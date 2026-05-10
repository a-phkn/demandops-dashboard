from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import pandas as pd
import warnings


# Suppress sklearn warnings about feature names for cleaner logs
warnings.filterwarnings("ignore", category=UserWarning)

app = FastAPI()

# 1. Enable CORS so your React frontend can communicate with this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. Load the AI Models (The "Brain")
print("Loading ML models...")
try:
    kmeans = joblib.load("models/kmeans_model.pkl")
    dt_classifier = joblib.load("models/dt_model.pkl")
    print("✅ Models loaded successfully!")
except Exception as e:
    print(f"❌ Error loading models: {e}")

# 3. Mock Database (Matches your React UI BASE_PRODUCTS exactly)
INVENTORY = [
    {
        "id": 1,
        "product": "Sugar",
        "baseNum": 20,
        "unit": "kg",
        "responsive": True,
        "stock": 30,
    },
    {
        "id": 2,
        "product": "Ghee",
        "baseNum": 4,
        "unit": "kg",
        "responsive": True,
        "stock": 12,
    },
    {
        "id": 3,
        "product": "Rice",
        "baseNum": 15,
        "unit": "kg",
        "responsive": True,
        "stock": 8,
    },
    {
        "id": 4,
        "product": "Bread",
        "baseNum": 10,
        "unit": "packs",
        "responsive": False,
        "expiry": "Expiry",
    },
    {
        "id": 5,
        "product": "Dry Fruits",
        "baseNum": 4,
        "unit": "kg",
        "responsive": True,
        "isNew": True,
        "stock": 0,
    },
    {
        "id": 6,
        "product": "Atta",
        "baseNum": 25,
        "unit": "kg",
        "responsive": True,
        "stock": 55,
    },
]


# ---------------------------------------------------------
# API ENDPOINTS
# ---------------------------------------------------------
# Create a data model for the incoming stock update
class StockUpdate(BaseModel):
    product_id: int
    new_stock: float


# Create the POST endpoint to receive the data
@app.post("/api/stock/update")
def update_stock(data: StockUpdate):
    # Find the item in our database and update its stock level
    for item in INVENTORY:
        if item["id"] == data.product_id:
            item["stock"] = data.new_stock
            return {
                "status": "success",
                "message": f"Updated {item['product']} stock to {data.new_stock}",
            }

    return {"status": "error", "message": "Product not found"}


@app.get("/api/inventory")
def get_inventory():
    """Returns the inventory with real-time AI stockout predictions"""
    for item in INVENTORY:
        # Only predict risk for items that respond to demand and have a stock value
        if item.get("responsive") and item.get("stock") is not None:
            # Layer 1: Predict Product Cluster based on velocity
            cluster_input = pd.DataFrame([{"Avg_Daily_Sales": item["baseNum"]}])
            cluster = kmeans.predict(cluster_input)[0]

            # Layer 2: Predict Stockout Risk
            dt_input = pd.DataFrame(
                [
                    {
                        "Product_Cluster": cluster,
                        "Current_Stock": item["stock"],
                        "Avg_Daily_Sales": item["baseNum"],
                        "Is_Festival_Week": 0,  # Frontend handles dynamic festival multipliers
                    }
                ]
            )

            risk_prediction = dt_classifier.predict(dt_input)[0]

            # Format the output to exactly match the React UI Badge requirements
            if risk_prediction == "HIGH":
                item["risk"] = "High Risk"
            elif risk_prediction == "MEDIUM":
                item["risk"] = "Med Risk"
            else:
                item.pop("risk", None)  # Remove risk badge if stock is safe

    return INVENTORY


@app.get("/")
def read_root():
    return {"status": "online", "message": "DemandOps API is running!"}


@app.delete("/api/inventory/{item_id}")
def delete_item(item_id: int):
    global INVENTORY
    # Rebuild the inventory list, keeping only the items that DO NOT match the ID
    initial_length = len(INVENTORY)
    INVENTORY = [item for item in INVENTORY if item["id"] != item_id]

    if len(INVENTORY) < initial_length:
        return {"status": "success", "message": f"Item {item_id} deleted."}
    return {"status": "error", "message": "Item not found."}
