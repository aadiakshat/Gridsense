import pandas as pd

def build_forecast_features(df: pd.DataFrame):
    df = df.sort_values("timestamp")

    df["hour"] = df["timestamp"].dt.hour
    df["dayofweek"] = df["timestamp"].dt.dayofweek
    df["is_weekend"] = df["dayofweek"].isin([5, 6]).astype(int)

    df["lag_energy"] = df["energy"].shift(1)
    df["rolling_mean_6"] = df["energy"].rolling(6).mean()
    df["rolling_std_6"] = df["energy"].rolling(6).std()

    df["anomaly_score"] = df["anomaly_score"].fillna(0)

    df = df.dropna()
    return df
