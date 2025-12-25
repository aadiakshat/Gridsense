import joblib
import pandas as pd
from pathlib import Path

# Load model at module level
MODEL_PATH = Path(__file__).parent / "linear_energy_forecast.pkl"

model = None  # 🔥 Initialize as None first

try:
    if MODEL_PATH.exists():
        model = joblib.load(MODEL_PATH)
        print(f"✅ Model loaded from {MODEL_PATH}")
    else:
        print(f"⚠️ Model file not found at {MODEL_PATH}")
        print(f"⚠️ Please run training script first: python -m app.ml2.train_forecast")
except Exception as e:
    print(f"❌ Error loading model: {e}")
    model = None


def forecast_energy(df, steps=6):
    # 🔥 Check if model is loaded
    if model is None:
        print("⚠️ Model is not loaded, cannot make predictions")
        return []
    
    df = df.sort_values("timestamp")
    df = (
        df.set_index("timestamp")
        .resample("1H")
        .sum()
        .reset_index()
    )
    
    df["last_energy"] = df["energy"].shift(1)
    df["rolling_mean_6"] = df["energy"].rolling(6, min_periods=1).mean()
    df["hour"] = df["timestamp"].dt.hour
    df["is_weekend"] = (df["timestamp"].dt.dayofweek >= 5).astype(int)
    
    df = df.dropna(subset=["last_energy"])
    
    if len(df) < 2:
        return []
    
    last_energy = df.iloc[-1]["energy"]
    last_time = df.iloc[-1]["timestamp"]
    recent_energies = list(df["energy"].tail(6))
    predictions = []
    
    for i in range(steps):
        next_time = last_time + pd.Timedelta(hours=i + 1)
        rolling_mean_6 = sum(recent_energies) / len(recent_energies)
        
        X = pd.DataFrame([{
            "last_energy": last_energy,
            "rolling_mean_6": rolling_mean_6,
            "hour": next_time.hour,
            "is_weekend": int(next_time.dayofweek >= 5)
        }])
        
        pred = float(model.predict(X)[0])
        pred = max(0, pred)
        
        predictions.append({
            "timestamp": next_time,
            "energy": round(pred, 5),
            "is_future": True,
            "type": "future_forecast"
        })
        
        if len(recent_energies) >= 6:
            recent_energies.pop(0)
        recent_energies.append(pred)
        
        last_energy = pred
    
    return predictions