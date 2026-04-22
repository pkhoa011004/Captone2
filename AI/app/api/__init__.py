"""Main API router"""
from fastapi import APIRouter
from app.api.routes import health, users, chat

api_router = APIRouter(prefix="/api/v1")

# Include routers
api_router.include_router(health.router)
api_router.include_router(users.router)
api_router.include_router(chat.router)
