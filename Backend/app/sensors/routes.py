from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import SessionLocal
from ..models import PowerReading
from ..schemas import PowerReadingCreate
from fastapi import APIRouter, Depends
from app.auth.jwtdependency import get_current_user

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

@router.post("/ingest")
def ingest_power_data(
    data: PowerReadingCreate,
    db: Session = Depends(get_db)
):
    reading = PowerReading(**data.dict())
    db.add(reading)
    db.commit()
    db.refresh(reading)
    return {"message": "Power data stored successfully"}


