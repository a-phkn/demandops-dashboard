DemandOps Dashboard 🚀
Revolutionizing Kirana Inventory with Predictive Analytics.
DemandOps is a full-stack application designed to help small kirana store owners optimize their inventory. By leveraging trained Machine Learning models and real-time regional signals, it transforms sales patterns into actionable stock insights — telling owners exactly what to order, when, and how much.

✨ Key Features
🧠 ML-Powered Demand Forecasting

Trained Models: Pre-trained K-Means Clustering and Decision Tree Classifier (.pkl files) categorize products by demand profile and predict stockout risk (HIGH / MEDIUM / LOW).
Intelligent Signals: Demand surges predicted by analyzing overlapping factors — regional festivals (Diwali, Onam, Bihu, Ganesh Chaturthi, and 20+ more), weekends, monsoon seasons, and salary week patterns.
Synthetic Dataset: 365,000 rows of India-specific retail sales data across 2 years, 5 store types, and 25 products — modeled on real Indian retail patterns including festival spikes, monsoon shifts, and salary-week surges.


📍 Localized Context (GPS Integration)

Regional Pulse: Uses browser geolocation to detect the store's state and automatically applies region-specific festival multipliers.
Setting Aware: Adjusts baseline forecasts based on whether the store is Urban, Semi-Urban, or Rural.

📊 Actionable Inventory Management

Days of Stock Left: Real-time calculation of how long current stock will last based on predicted demand — accounting for all active signal multipliers.
Health Indicators: Color-coded urgency levels (🔴 Reorder Now, 🟡 Low Stock, 🟢 Healthy).
Alert System: High-visibility alerts for Stockout Risk and Expiry Warnings.
Multiplier Breakdown: Hover any Final Qty to see exactly why it changed — e.g. Base 20kg × Festival 1.7 × Salary 1.25 = 41kg.

🎨 Modern Glassmorphism UI

Performance-First: Semi-transparent interface with smooth Framer Motion animations and a dynamic animated background.
Dark / Light Mode: Full theme support that adapts the color palette and background.




🛠️ Tech Stack
Frontend

React 18, TypeScript, Tailwind CSS
Shadcn/UI, Lucide React, Framer Motion
Vite (build tool)

Backend & ML

Python 3.10+, Flask
Scikit-learn — K-Means Clustering, Decision Tree Classifier
Models trained via train_models.py and exported as dt_model.pkl and kmeans_model.pkl

Infrastructure

pnpm workspaces (monorepo)
Express API server (Node.js)




⚙️ Setup & Installation
1. Prerequisites

Node.js v18+
Python 3.10+
pnpm — install with npm install -g pnpm

2. Clone & Install
   git clone https://github.com/a-phkn/demandops-dashboard.git
   cd demandops-dashboard
   pnpm install

3. Run the Frontend
   pnpm dev

4. Run the ML Backend
   pip install flask scikit-learn pandas numpy
   python app.py

5. Retrain Models (optional)
   python train_models.py




📁 Project Architecture

/artifacts/dashboard/       - React frontend (pages, components, UI)
  └── src/pages/Dashboard.tsx  - Main dashboard page
  └── src/components/ui/    - Shadcn UI component library

/artifacts/api-server/      - Express API server (Node.js)

/models/                    - Pre-trained ML models
  └── dt_model.pkl          - Decision Tree Classifier
  └── kmeans_model.pkl      - K-Means Clustering model

train_models.py             - ML training script (generates .pkl files)
app.py                      - Flask backend — serves ML predictions via REST API



🧪 ML Model Performance

MetricValueK-Means Silhouette Score~0.58 (5 clusters)Decision Tree Accuracy~84% on held-out test setMAPE vs 7-day baseline28% → 11% (6-signal fusion)
Product Clusters found by K-Means:
ClusterProfileExample Products0Festival-sensitive staplesSugar, Ghee, Atta1Weather-driven impulse buysMaggi, Tea, Chips2Stable daily-need itemsSoap, Salt, Detergent3PerishablesMilk, Bread, Curd4Puja / occasion itemsCoconut, Camphor, Agarbatti




🌍 Societal Impact

India has 12 million unorganized kirana stores with zero AI penetration. DemandOps addresses a real gap — helping owners reduce:
15–30% revenue loss from stockouts
8–12% revenue loss from perishable waste
Predictions are explainable — the owner sees exactly why a number changed, building trust in AI-assisted decisions.







Developed by Anushka Phookan







   