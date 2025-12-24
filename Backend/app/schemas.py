from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class PowerReadingCreate(BaseModel):
    voltage: float
    current: float
    power: float
    energy: float


class PowerReadingOut(PowerReadingCreate):
    timestamp: datetime
    is_anomaly: bool
    anomaly_score: Optional[float] = None

    class Config:
        from_attributes = True   # ✅ REQUIRED for SQLAlchemy
