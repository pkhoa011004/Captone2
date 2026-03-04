"""Custom exceptions"""

class APIException(Exception):
    """Base API exception"""
    def __init__(self, message: str, status_code: int = 400):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)

class NotFoundError(APIException):
    """Resource not found"""
    def __init__(self, message: str = "Resource not found"):
        super().__init__(message, 404)

class UnauthorizedError(APIException):
    """Unauthorized access"""
    def __init__(self, message: str = "Unauthorized"):
        super().__init__(message, 401)

class ValidationError(APIException):
    """Validation error"""
    def __init__(self, message: str = "Validation failed"):
        super().__init__(message, 422)

class ConflictError(APIException):
    """Resource already exists"""
    def __init__(self, message: str = "Resource already exists"):
        super().__init__(message, 409)
