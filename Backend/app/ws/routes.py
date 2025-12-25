import asyncio
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.ws.manager import ConnectionManager
from app.database import SessionLocal  # Import your SessionLocal
from app.models import PowerReading  # Import your model
from sqlalchemy import desc
from datetime import datetime, timedelta

router = APIRouter()   
manager = ConnectionManager()

async def get_latest_stats():
    """Fetch latest power statistics"""
    db = SessionLocal()
    try:
        # Get latest reading
        latest = db.query(PowerReading).order_by(desc(PowerReading.timestamp)).first()
        
        if not latest:
            return None
            
        # Get stats for last hour
        one_hour_ago = datetime.utcnow() - timedelta(hours=1)
        recent_readings = db.query(PowerReading).filter(
            PowerReading.timestamp >= one_hour_ago
        ).all()
        
        if not recent_readings:
            return None
        
        avg_power = sum(r.power for r in recent_readings) / len(recent_readings)
        max_power = max(r.power for r in recent_readings)
        
        return {
            "timestamp": latest.timestamp.isoformat(),
            "current_power": latest.power,
            "current_voltage": latest.voltage,
            "current_current": latest.current,
            "avg_power_1h": round(avg_power, 2),
            "max_power_1h": max_power,
            "reading_count": len(recent_readings)
        }
    except Exception as e:
        print(f"Error fetching stats: {e}")
        return None
    finally:
        db.close()

@router.websocket("/ws/live")
async def live_updates(websocket: WebSocket):
    await manager.connect(websocket)
    
    try:
        # Send initial connection confirmation
        await websocket.send_json({
            "type": "connection",
            "status": "connected",
            "message": "WebSocket connection established"
        })
        
        # Keep connection alive and send updates
        while True:
            stats = await get_latest_stats()
            
            if stats:
                await manager.send_personal_message({
                    "type": "stats_update",
                    "data": stats
                }, websocket)
            
            await asyncio.sleep(5)  # Update every 5 seconds
            
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        print("Client disconnected")
    except Exception as e:
        print(f"WebSocket error: {e}")
        manager.disconnect(websocket)