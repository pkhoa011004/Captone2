"""Pydantic schemas for request/response"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    """Base user schema"""
    email: EmailStr
    name: str = Field(..., min_length=2)
    phone: Optional[str] = None

class UserCreate(UserBase):
    """User creation schema"""
    password: str = Field(..., min_length=6)

class UserUpdate(BaseModel):
    """User update schema"""
    name: Optional[str] = None
    phone: Optional[str] = None

class UserResponse(UserBase):
    """User response schema"""
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class UserInDB(UserResponse):
    """User in database schema"""
    password_hash: str
