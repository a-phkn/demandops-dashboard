import pandas as pd
import numpy as np
from sklearn.cluster import KMeans
from sklearn.tree import DecisionTreeClassifier
import joblib
import os

print("🚀 Starting ML Training Pipeline...")

# ---------------------------------------------------------
# 1. GENERATE SYNTHETIC TRAINING DATA
# ---------------------------------------------------------
print("📊 Generating synthetic dataset...")
np.random.seed(42)

# Matching the products from your React UI
products = {
    'Sugar': {'base': 20, 'volatility': 0.2},
    'Ghee': {'base': 4, 'volatility': 0.5},   
    'Rice': {'base': 15, 'volatility': 0.1},
    'Bread': {'base': 10, 'volatility': 0.05},
    'Dry Fruits': {'base': 4, 'volatility': 0.6},
    'Atta': {'base': 25, 'volatility': 0.1}
}

data = []
for _ in range(2000): # Generate 2000 random scenarios
    product = np.random.choice(list(products.keys()))
    base_qty = products[product]['base']

    # Simulate current real-world metrics
    avg_daily_sales = max(1, int(np.random.normal(base_qty, base_qty * products[product]['volatility'])))
    current_stock = np.random.randint(0, base_qty * 5) 
    is_festival_week = np.random.choice([0, 1], p=[0.8, 0.2]) 

    # Calculate target label: Stockout Risk
    days_cover = current_stock / avg_daily_sales if avg_daily_sales > 0 else 99

    if days_cover < 2:
        risk = "HIGH"
    elif days_cover < 4:
        risk = "MEDIUM"
    else:
        risk = "LOW"

    data.append({
        'Product': product,
        'Avg_Daily_Sales': avg_daily_sales,
        'Current_Stock': current_stock,
        'Is_Festival_Week': is_festival_week,
        'Stockout_Risk': risk
    })

df = pd.DataFrame(data)

# ---------------------------------------------------------
# 2. TRAIN LAYER 1: K-MEANS CLUSTERING
# ---------------------------------------------------------
print("🧠 Training Layer 1: K-Means Clustering...")
cluster_features = df[['Avg_Daily_Sales']]
kmeans = KMeans(n_clusters=4, random_state=42, n_init=10)
df['Product_Cluster'] = kmeans.fit_predict(cluster_features)

# ---------------------------------------------------------
# 3. TRAIN LAYER 2: DECISION TREE CLASSIFIER
# ---------------------------------------------------------
print("🌳 Training Layer 2: Decision Tree...")
X = df[['Product_Cluster', 'Current_Stock', 'Avg_Daily_Sales', 'Is_Festival_Week']]
y = df['Stockout_Risk']

dt_classifier = DecisionTreeClassifier(max_depth=5, random_state=42)
dt_classifier.fit(X, y)

accuracy = dt_classifier.score(X, y)
print(f"✅ Decision Tree trained with Accuracy: {accuracy * 100:.2f}%")

# ---------------------------------------------------------
# 4. SAVE THE MODELS
# ---------------------------------------------------------
print("💾 Saving models to disk...")
os.makedirs('models', exist_ok=True)

joblib.dump(kmeans, 'models/kmeans_model.pkl')
joblib.dump(dt_classifier, 'models/dt_model.pkl')

print("🎉 Pipeline Complete! Models saved in the 'models/' directory.")