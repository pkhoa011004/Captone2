"""Middleware for error handling"""
from fastapi import Request
from fastapi.responses import JSONResponse
from app.utils.exceptions import APIException
from app.utils.logger import log_error

async def exception_handler(request: Request, exc: APIException):
    """Handle custom API exceptions"""
    log_error(f"API Exception: {exc.message}")
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "message": exc.message
        }
    )

async def http_exception_handler(request: Request, exc: Exception):
    """Handle HTTP exceptions"""
    log_error(f"HTTP Exception: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "message": "Internal server error"
        }
    )
