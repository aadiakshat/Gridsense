# create_tables.py
from app.database import engine, Base
from app.models import PowerReading

Base.metadata.create_all(bind=engine)
