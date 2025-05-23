# predict.py
import joblib
import pandas as pd
import sys
import json

# Load model and titles
model = joblib.load("book_recommender.pkl")
titles = joblib.load("book_titles.pkl")

# Load data
rates = pd.read_csv("rates.csv", encoding='utf-8')
rates.columns = ['id', 'rating', 'ratedDate', 'userId', 'postsId', 'averageRating']
posts = pd.read_csv("posts.csv", encoding='utf-8')
posts.columns = ['id', 'title', 'author', 'photo', 'language', 'pages', 'publishedOn', 'categoryId', 'pdf', 'description']

# Get user ID from command line or default to 1
user_id = int(sys.argv[1]) if len(sys.argv) > 1 else 1

# Get titles rated by the user
merged = pd.merge(rates[['userId', 'postsId', 'rating']], posts[['id', 'title']], left_on='postsId', right_on='id')
user_rated = merged[merged['userId'] == user_id]['title'].values

# Predict for unrated titles
unrated = [t for t in titles if t not in user_rated]
predictions = [model.predict(user_id, t) for t in unrated]
predictions.sort(key=lambda x: x.est, reverse=True)

top_n = 5
top_recommendations = predictions[:top_n]

# Output as JSON
results = [{"title": pred.iid, "predicted_rating": round(pred.est, 2)} for pred in top_recommendations]
print(json.dumps(results))
