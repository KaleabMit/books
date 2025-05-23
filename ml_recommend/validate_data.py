import pandas as pd

# File paths
rates_path = "C:/api/ml_data/rates.csv"
posts_path = "C:/api/ml_data/posts.csv"

# Load CSVs
rates = pd.read_csv(rates_path, encoding='utf-8')
posts = pd.read_csv(posts_path, encoding='utf-8')
posts.columns = ['id', 'title', 'author', 'photo', 'language', 'pages', 'publishedOn', 'categoryId', 'pdf', 'description']

# Get unique post IDs from rates.csv
rated_post_ids = set(rates['postsId'].unique())
existing_post_ids = set(posts['id'].unique())

# Find missing post IDs
missing_post_ids = rated_post_ids - existing_post_ids

if missing_post_ids:
    print(f"❌ {len(missing_post_ids)} post(s) in rates.csv not found in posts.csv:")
    print(sorted(missing_post_ids))
else:
    print("✅ All post IDs in rates.csv are present in posts.csv.")
