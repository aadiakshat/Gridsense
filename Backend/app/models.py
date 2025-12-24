from sqlalchemy import Column, Integer, Float, DateTime
from datetime import datetime
from .database import Base

class PowerReading(Base):
    __tablename__ = "power_readings"

    id = Column(Integer, primary_key=True, index=True)
    voltage = Column(Float)
    current = Column(Float)
    power = Column(Float)
    energy = Column(Float)
    timestamp = Column(DateTime, default=datetime.utcnow)
    is_anomaly = Column(Integer, default=0)
    anomaly_score = Column(Float, nullable=True)
