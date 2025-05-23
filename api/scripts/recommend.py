# recommend.py
import pandas as pd
from surprise import Dataset, Reader, SVD
import joblib

# Load data
rates = pd.read_csv("rates.csv", encoding='utf-8')
posts = pd.read_csv("posts.csv", encoding='utf-8')

# Ensure correct lowercase columns
rates.columns = ['id', 'rating', 'ratedDate', 'userId', 'postsId', 'averageRating']
posts.columns = ['id', 'title', 'author', 'photo', 'language', 'pages', 'publishedOn', 'categoryId', 'pdf', 'description']

# Use only the relevant rating data for model training
filtered_rates = rates[['userId', 'postsId', 'rating']]
filtered_rates = filtered_rates[filtered_rates['rating'] > 0]

# Merge post titles for model
merged = pd.merge(filtered_rates, posts[['id', 'title']], left_on='postsId', right_on='id')

# Prepare dataset
reader = Reader(rating_scale=(1, 5))
data = Dataset.load_from_df(merged[['userId', 'title', 'rating']], reader)
trainset = data.build_full_trainset()

# Train model
model = SVD()
model.fit(trainset)

# Save model and titles
joblib.dump(model, 'book_recommender.pkl')
joblib.dump(merged['title'].unique(), 'book_titles.pkl')

print("✅ Model and titles saved.")
