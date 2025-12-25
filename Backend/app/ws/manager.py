from fastapi import WebSocket
from typing import List

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def send_personal_message(self, message: dict, websocket: WebSocket):
        """Send message to a specific client"""
        await websocket.send_json(message)

    async def broadcast(self, data: dict):
        """Send message to all connected clients"""
        dead_connections = []
        for ws in self.active_connections:
            try:
                await ws.send_json(data)
            except Exception as e:
                print(f"Error broadcasting to client: {e}")
                dead_connections.append(ws)
        
        # Remove dead connections
        for ws in dead_connections:
            self.disconnect(ws)