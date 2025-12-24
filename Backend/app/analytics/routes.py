from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import SessionLocal
from app.models import PowerReading
from fastapi import APIRouter, Depends
from app.auth.jwtdependency import get_current_user

import pandas as pd

from app.schemas import PowerReadingCreate, PowerReadingOut
from app.ml.features import build_features
from app.ml.model import detect_anomaly


router = APIRouter( 
    tags=["Sensors"],
    dependencies=[Depends(get_current_user)]      # 🔒 LOCK APPLIED
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ---------------- SANITY ----------------
@router.get("/ping")
def ping():
    return {"analytics": "alive"}

# ---------------- DAILY ENERGY ----------------
@router.get("/daily-energy")
def daily_energy(db: Session = Depends(get_db)):
    results = (
        db.query(
            func.date(PowerReading.timestamp).label("date"),
            func.sum(PowerReading.energy).label("total_energy")
        )
        .group_by(func.date(PowerReading.timestamp))
        .order_by(func.date(PowerReading.timestamp))
        .all()
    )

    return [
        {"date": r.date, "total_energy": round(r.total_energy, 2)}
        for r in results
    ]

# ---------------- HOURLY AVERAGE POWER ----------------
@router.get("/hourly-average-power")
def hourly_average_power(db: Session = Depends(get_db)):
    results = (
        db.query(
            func.strftime('%H', PowerReading.timestamp).label("hour"),
            func.avg(PowerReading.power).label("avg_power")
        )
        .group_by("hour")
        .order_by("hour")
        .all()
    )

    return [
        {"hour": r.hour, "avg_power": round(r.avg_power, 2)}
        for r in results
    ]

# ---------------- PEAK LOAD DETECTION ----------------
@router.get("/peak-loads")
def peak_loads(threshold: float = 1500, db: Session = Depends(get_db)):
    peaks = (
        db.query(PowerReading)
        .filter(PowerReading.power > threshold)
        .order_by(PowerReading.power.desc())
        .all()
    )

    return [
        {
            "timestamp": p.timestamp,
            "power": p.power,
            "voltage": p.voltage,
            "current": p.current
        }
        for p in peaks
    ]
@router.get("/debug-count")
def debug_count(db: Session = Depends(get_db)):
    return {
        "count": db.query(PowerReading).count()
    }
# ---------------- POWER INGEST + ML ----------------
@router.post("/power", response_model=PowerReadingOut)
def ingest_power(
    data: PowerReadingCreate,
    db: Session = Depends(get_db)
):
    # 1️⃣ Store reading
    # 1️⃣ Compute energy from power (1-minute interval)
    data_dict = data.model_dump()

    # power (W) → energy (kWh)
    data_dict["energy"] = data_dict["power"] / 1000 / 60

    reading = PowerReading(**data_dict)
    db.add(reading)
    db.commit()
    db.refresh(reading)


    # 2️⃣ Fetch recent history
    rows = (
        db.query(PowerReading)
        .order_by(PowerReading.timestamp.desc())
        .limit(50)
        .all()
    )

    # Not enough data yet
    if len(rows) < 6:
        return reading

    # 3️⃣ Build dataframe
    df = pd.DataFrame([
        {"timestamp": r.timestamp, "power": r.power}
        for r in rows
    ]).sort_values("timestamp")

    features = build_features(df)

    # 4️⃣ Run ML
    is_anomaly, score = detect_anomaly(features)

    # 5️⃣ Update DB
    reading.is_anomaly = int(is_anomaly)
    reading.anomaly_score = score
    db.commit()

    return reading

# ---------------- ANOMALIES ----------------
@router.get("/anomalies")
def get_anomalies(db: Session = Depends(get_db)):
    anomalies = (
        db.query(PowerReading)
        .filter(PowerReading.is_anomaly == 1)
        .order_by(PowerReading.timestamp.desc())
        .all()
    )

    return [
        {
            "timestamp": a.timestamp,
            "power": a.power,
            "voltage": a.voltage,
            "current": a.current,
            "score": a.anomaly_score,
        }
        for a in anomalies
    ]
