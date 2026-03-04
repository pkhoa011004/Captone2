# Python FastAPI Project

## Cấu trúc thư mục

```
AI/
├── app/
│   ├── api/
│   │   ├── routes/
│   │   │   ├── health.py       # Health check routes
│   │   │   └── users.py        # User routes
│   │   └── __init__.py
│   ├── config/
│   │   ├── settings.py         # Settings & environment config
│   │   ├── database.py         # Database configuration
│   │   └── __init__.py
│   ├── models/                 # SQLAlchemy models
│   ├── schemas/                # Pydantic schemas
│   │   ├── user.py
│   │   └── __init__.py
│   ├── services/               # Business logic services
│   ├── utils/
│   │   ├── exceptions.py       # Custom exceptions
│   │   ├── logger.py           # Logging utility
│   │   ├── responses.py        # Response helpers
│   │   └── __init__.py
│   ├── middleware/
│   │   └── error_handler.py    # Error handling middleware
│   ├── main.py                 # FastAPI application entry point
│   └── __init__.py
├── tests/                      # Test files
├── logs/                       # Log files
├── requirements.txt            # Python dependencies
├── .env.example                # Environment variables template
├── .gitignore
└── README.md
```

## Mô tả từng thư mục

- **api/routes**: Định nghĩa các API endpoints
- **config**: Cấu hình ứng dụng (settings, database)
- **models**: SQLAlchemy database models
- **schemas**: Pydantic validation schemas (request/response)
- **services**: Business logic tách riêng
- **utils**: Helper functions (logger, exceptions, responses)
- **middleware**: Custom middleware (error handling, etc.)
- **tests**: Unit tests và integration tests

## Cài đặt

### 1. Tạo virtual environment
```bash
python -m venv venv
```

### 2. Kích hoạt virtual environment
```bash
# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate
```

### 3. Cài đặt dependencies
```bash
pip install -r requirements.txt
```

### 4. Tạo .env file
```bash
cp .env.example .env
```

Cập nhật các giá trị trong `.env` phù hợp với môi trường.

### 5. Chạy development server
```bash
cd app
python -m uvicorn main:app --reload
```

Server sẽ chạy tại `http://localhost:8000`

### 6. Xem API documentation
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### 7. Chạy tests
```bash
pytest
```

## Technologies

- **FastAPI**: Modern web framework
- **Uvicorn**: ASGI server
- **SQLAlchemy**: ORM
- **Pydantic**: Data validation
- **Pydantic Settings**: Configuration management
- **Python-Jose**: JWT tokens
- **Passlib**: Password hashing
- **Pytest**: Testing framework

## API Endpoints

### Health Check
```
GET /api/v1/health
```

### Users
```
POST /api/v1/users/register    - Register new user
POST /api/v1/users/login       - Login user
GET /api/v1/users/             - List all users
GET /api/v1/users/{user_id}    - Get user by ID
```

## Best Practices

1. **Schemas**: Dùng Pydantic cho validation
2. **Database**: SQLAlchemy cho ORM
3. **Services**: Tách business logic từ routes
4. **Error Handling**: Custom exceptions
5. **Logging**: Centralized logging
6. **Config**: Environment-based settings

