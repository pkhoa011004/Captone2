"""API response helpers"""
from typing import Any, Optional
from pydantic import BaseModel

class SuccessResponse(BaseModel):
    """Success response model"""
    success: bool = True
    message: str
    data: Any = None

class ErrorResponse(BaseModel):
    """Error response model"""
    success: bool = False
    message: str
    errors: Optional[list] = None

def success(message: str, data: Any = None) -> SuccessResponse:
    """Create success response"""
    return SuccessResponse(message=message, data=data)

def error(message: str, errors: Optional[list] = None) -> ErrorResponse:
    """Create error response"""
    return ErrorResponse(message=message, errors=errors)
