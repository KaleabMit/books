from flask import Flask, request, jsonify
import pandas as pd
import joblib
import os
import numpy as np
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Global variables initialized
svd = None
pivot = None
similarity = None
rates = None
posts = None

# Correct Paths
DATA_DIR = "C:/BSRS/api/ml_data"
MODEL_PATH = "svd_model.pkl"
RATINGS_PATH = "ratings_matrix.pkl"
SIMILARITY_PATH = "user_similarity.pkl"
RATES_CSV = os.path.join(DATA_DIR, "rates.csv")
POSTS_CSV = os.path.join(DATA_DIR, "posts.csv")

# Load Data
def load_assets():
    if not all(os.path.exists(p) for p in [MODEL_PATH, RATINGS_PATH, SIMILARITY_PATH]):
        raise RuntimeError("Model or matrices missing. Please retrain.")
    svd = joblib.load(MODEL_PATH)
    pivot = joblib.load(RATINGS_PATH)
    similarity = joblib.load(SIMILARITY_PATH)
    return svd, pivot, similarity

def load_data():
    if not os.path.exists(RATES_CSV) or not os.path.exists(POSTS_CSV):
        raise FileNotFoundError(f"Could not find the required CSV files at {DATA_DIR}")
    
    rates = pd.read_csv(RATES_CSV, encoding='utf-8')
    posts = pd.read_csv(POSTS_CSV, encoding='utf-8')

    posts.columns = ['id', 'title', 'author', 'photo', 'language', 'pages', 'publishedOn', 'categoryId', 'pdf', 'description']
    
    valid_post_ids = set(posts['id'])
    rates = rates[rates['postsId'].isin(valid_post_ids)]

    return rates, posts

# Load on startup
try:
    svd, pivot, similarity = load_assets()
    rates, posts = load_data()
except Exception as e:
    print(f"Error loading assets: {e}")

@app.route("/recommend", methods=["GET"])
def recommend():
    global svd, pivot, similarity, posts

    # Check if everything loaded correctly
    if svd is None or pivot is None or similarity is None or posts is None:
        return jsonify({"error": "Recommendation model or data not loaded properly."}), 500

    user_id = request.args.get("userId", type=int)
    if user_id is None:
        return jsonify({"error": "Missing userId"}), 400

    if user_id not in pivot.index:
        return jsonify({"message": "User not found in ratings, providing default recommendations."}), 200

    user_idx = pivot.index.tolist().index(user_id)
    similar_users = np.argsort(similarity[user_idx])[::-1][1:10]
    similar_user_ids = [pivot.index[i] for i in similar_users]

    similar_ratings = pivot.loc[similar_user_ids]
    mean_ratings = similar_ratings.mean().sort_values(ascending=False)

    already_rated = pivot.loc[user_id][pivot.loc[user_id] > 0].index
    recommendations = mean_ratings.drop(labels=already_rated, errors='ignore')[:5]

    results = []
    for post_id in recommendations.index:
        matching = posts[posts['id'] == post_id]
        if matching.empty:
            print(f"Post ID {post_id} not found in posts.csv")
            continue
        book = matching.iloc[0]
        results.append({
            "title": book["title"],
            "predicted_rating": round(recommendations[post_id], 2),
            "author": book["author"],
            "photo": book["photo"],
            "pdf": book["pdf"]
        })

    return jsonify(results)

@app.route("/retrain", methods=["POST"])
def retrain():
    global svd, pivot, similarity, rates, posts

    try:
        rates, posts = load_data()
        ratings = rates[['userId', 'postsId', 'rating']]
        pivot = ratings.pivot_table(index='userId', columns='postsId', values='rating').fillna(0)

        from sklearn.decomposition import TruncatedSVD
        from sklearn.metrics.pairwise import cosine_similarity

        n_components = min(50, pivot.shape[1] - 1)
        if n_components < 1:
            return jsonify({"error": "Not enough data to retrain the model."}), 400

        svd = TruncatedSVD(n_components=n_components)
        latent_matrix = svd.fit_transform(pivot)
        similarity = cosine_similarity(latent_matrix)

        joblib.dump(svd, MODEL_PATH)
        joblib.dump(pivot, RATINGS_PATH)
        joblib.dump(similarity, SIMILARITY_PATH)

        return jsonify({"message": "Model retrained and saved."})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
