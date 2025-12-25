from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.sensors.routes import router as sensor_router
from app.analytics.routes import router as analytics_router
from app.auth.routesauth import router as auth_router  
from app.ws.routes import router as ws_router
from app.database import Base,engine
from app.usermodel import User

from dotenv import load_dotenv



load_dotenv()


Base.metadata.create_all(bind=engine)


# ✅ Load environment variables


app = FastAPI(title="GridSense API")

# ✅ CORS (always-on)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # dev mode OK
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Register routers
app.include_router(auth_router)        # 🔐 AUTH
app.include_router(analytics_router, prefix="/analytics")
app.include_router(sensor_router, prefix="/sensors")
app.include_router(ws_router)

@app.get("/")
def root():
    return {"status": "GridSense backend running"}

for r in app.routes:
    print(type(r), getattr(r, "path", None))
