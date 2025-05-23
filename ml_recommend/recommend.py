import pandas as pd
import joblib
from sklearn.decomposition import TruncatedSVD
from sklearn.metrics.pairwise import cosine_similarity

# Load data
rates = pd.read_csv("rates.csv", encoding='utf-8')
posts = pd.read_csv("posts.csv", encoding='utf-8')

# Preprocess columns
rates.columns = ['id', 'rating', 'ratedDate', 'userId', 'postsId', 'averageRating']
posts.columns = ['id', 'title', 'author', 'photo', 'language', 'pages', 'publishedOn', 'categoryId', 'pdf', 'description']

# Pivot ratings matrix
ratings = rates[['userId', 'postsId', 'rating']]
pivot = ratings.pivot_table(index='userId', columns='postsId', values='rating').fillna(0)

# Matrix factorization
svd = TruncatedSVD(n_components=50)
latent_matrix = svd.fit_transform(pivot)
similarity = cosine_similarity(latent_matrix)

# Save models and metadata
joblib.dump(svd, 'svd_model.pkl')
joblib.dump(pivot, 'ratings_matrix.pkl')
joblib.dump(similarity, 'user_similarity.pkl')
print("✅ Model, matrix, and similarity saved.")
