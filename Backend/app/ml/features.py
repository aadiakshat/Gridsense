# app/ml/features.py

import pandas as pd

FEATURE_COLUMNS = [
    "power",
    "rolling_mean_5",
    "rolling_std_5",
    "delta",
    "hour",
]

def build_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Input df columns required:
    - timestamp
    - power
    """

    df = df.copy()

    df["rolling_mean_5"] = df["power"].rolling(window=5).mean()
    df["rolling_std_5"] = df["power"].rolling(window=5).std()
    df["delta"] = df["power"].diff()
    df["hour"] = pd.to_datetime(df["timestamp"]).dt.hour

    df = df.dropna()

    return df[FEATURE_COLUMNS]
