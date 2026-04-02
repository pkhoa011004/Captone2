"""Chat message schemas"""
from pydantic import BaseModel
from typing import Optional

class ChatMessageRequest(BaseModel):
    """Request schema for chat message"""
    message: str
    conversation_id: Optional[str] = None

class ChatMessageResponse(BaseModel):
    """Response schema for chat message"""
    conversation_id: str
    user_message: str
    ai_response: str
    timestamp: str

class ChatHistoryRequest(BaseModel):
    """Request schema for chat history"""
    conversation_id: str
