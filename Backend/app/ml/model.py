# app/ml/model.py

import joblib
import numpy as np
from pathlib import Path

MODEL_PATH = Path(__file__).resolve().parent / "anomaly.pkl"

model = joblib.load(MODEL_PATH)

def detect_anomaly(features_df):
    """
    Returns:
    - is_anomaly (bool)
    - anomaly_score (float)
    """

    X = features_df.iloc[-1:].values

    prediction = model.predict(X)[0]        # -1 anomaly, 1 normal
    score = model.decision_function(X)[0]   # lower = more anomalous

    return prediction == -1, float(score)
