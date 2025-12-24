# app/ml/train.py

import joblib
import pandas as pd
from sqlalchemy import create_engine
from sklearn.ensemble import IsolationForest
from pathlib import Path

DB_URL = "sqlite:///./app.db"
MODEL_PATH = Path(__file__).resolve().parent / "anomaly.pkl"

engine = create_engine(DB_URL)

df = pd.read_sql(
    "SELECT timestamp, power FROM power_readings ORDER BY timestamp",
    engine
)

df["timestamp"] = pd.to_datetime(df["timestamp"])

df["rolling_mean_5"] = df["power"].rolling(5).mean()
df["rolling_std_5"] = df["power"].rolling(5).std()
df["delta"] = df["power"].diff()
df["hour"] = df["timestamp"].dt.hour

df = df.dropna()

X = df[[
    "power",
    "rolling_mean_5",
    "rolling_std_5",
    "delta",
    "hour"
]]

model = IsolationForest(
    n_estimators=200,
    contamination = 0.2,
    random_state=42
)

model.fit(X)

joblib.dump(model, MODEL_PATH)

print("✅ Anomaly model trained and saved")
