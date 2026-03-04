import logging
from app.config.settings import settings

logger = logging.getLogger(__name__)

def log_info(message: str, extra: dict = None):
    """Log info message"""
    logger.info(message, extra=extra)

def log_error(message: str, extra: dict = None):
    """Log error message"""
    logger.error(message, extra=extra)

def log_warning(message: str, extra: dict = None):
    """Log warning message"""
    logger.warning(message, extra=extra)

def log_debug(message: str, extra: dict = None):
    """Log debug message"""
    logger.debug(message, extra=extra)
