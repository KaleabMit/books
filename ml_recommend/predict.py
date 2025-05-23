import joblib
import pandas as pd
import numpy as np
import json
import sys

# Load models and data
svd = joblib.load('svd_model.pkl')
pivot = joblib.load('ratings_matrix.pkl')
similarity = joblib.load('user_similarity.pkl')

rates = pd.read_csv("rates.csv", encoding='utf-8')
posts = pd.read_csv("posts.csv", encoding='utf-8')
posts.columns = ['id', 'title', 'author', 'photo', 'language', 'pages', 'publishedOn', 'categoryId', 'pdf', 'description']

# Input user
user_id = int(sys.argv[1]) if len(sys.argv) > 1 else 1
if user_id not in pivot.index:
    print(json.dumps({"error": "User not found"}))
    sys.exit()

# Similarity and recommendation logic
user_idx = pivot.index.tolist().index(user_id)
similar_users = list(np.argsort(similarity[user_idx])[::-1][1:10])  # Top 10 similar users
similar_user_ids = [pivot.index[i] for i in similar_users]

# Weighted ratings from similar users
similar_ratings = pivot.loc[similar_user_ids]
mean_ratings = similar_ratings.mean().sort_values(ascending=False)

# Remove already rated items
already_rated = pivot.loc[user_id][pivot.loc[user_id] > 0].index
recommendations = mean_ratings.drop(labels=already_rated, errors='ignore')[:5]

# Output
results = []
for post_id in recommendations.index:
    book = posts[posts['id'] == post_id].iloc[0]
    results.append({
        "title": book["title"],
        "predicted_rating": round(recommendations[post_id], 2),
        "author": book["author"],
        "photo": book["photo"],
        "pdf": book["pdf"]
        })
    import sys
import json
import joblib
import pandas as pd
from sklearn.decomposition import TruncatedSVD
from sklearn.metrics.pairwise import cosine_similarity

# Load the models and matrices
svd = joblib.load('svd_model.pkl')
pivot = joblib.load('ratings_matrix.pkl')
similarity = joblib.load('user_similarity.pkl')

# Get the userId passed from the command line
user_id = int(sys.argv[1])  # Get the user ID from arguments

# Function to get recommendations (implement logic based on your model)
def get_recommendations(user_id):
    # Placeholder: Get user ratings
    user_ratings = pivot.loc[user_id]  # Get the ratings for the user
    recommendations = []

    # Example: This would be where the recommendation logic happens
    # Use SVD, similarity, or any other algorithm to get the recommended items
    for post_id, rating in user_ratings.iteritems():
        if rating == 0:  # Only recommend posts the user hasn't rated
            predicted_rating = 3.5  # Use your model's prediction for the rating
            recommendations.append({
                "title": f"Post {post_id}",
                "predicted_rating": predicted_rating,
                "author": "Author Placeholder",  # This can come from a database or another source
                "photo": f"http://localhost:5000/posts/pictures/photo_{post_id}.jpg",  # Example photo
                "pdf": f"http://localhost:5000/posts/pdfs/post_{post_id}.pdf"  # Example PDF
            })

    return recommendations

# Get the recommendations for the user
recommendations = get_recommendations(user_id)

# Return the recommendations as JSON
print(json.dumps(recommendations))


print(json.dumps(results))
