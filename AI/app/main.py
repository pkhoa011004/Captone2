from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config.settings import settings
from app.api import api_router
from app.middleware.error_handler import exception_handler, http_exception_handler
from app.utils.exceptions import APIException
from app.utils.logger import log_info

# Create FastAPI app
app = FastAPI(
    title=settings.APP_TITLE,
    description=settings.APP_DESCRIPTION,
    version=settings.API_VERSION,
    debug=settings.DEBUG
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add exception handlers
app.add_exception_handler(APIException, exception_handler)
app.add_exception_handler(Exception, http_exception_handler)

# Include API routers
app.include_router(api_router)

@app.on_event("startup")
async def startup_event():
    """Startup event"""
    log_info(f"[START] Application starting - {settings.APP_TITLE}")

@app.on_event("shutdown")
async def shutdown_event():
    """Shutdown event"""
    log_info("[STOP] Application shutting down")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG
    )
