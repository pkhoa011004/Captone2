# Node.js Backend Project

## Cấu trúc thư mục

```
BE/
├── src/
│   ├── config/               # Cấu hình (database, constants, etc.)
│   ├── controllers/          # Business logic handlers
│   ├── middleware/           # Express middleware
│   ├── models/               # Database models
│   ├── routes/               # API routes
│   ├── services/             # Business logic services
│   ├── utils/                # Helper functions
│   ├── validators/           # Input validation schemas
│   ├── index.js              # Entry point
├── tests/                    # Test files
├── logs/                     # Log files
├── .env.example              # Environment variables template
├── .gitignore
├── package.json
└── README.md
```

## Mô tả từng thư mục

- **config**: Cấu hình ứng dụng (database, constants, JWT, etc.)
- **controllers**: Xử lý logic của API endpoints
- **middleware**: Custom middleware (auth, validation, error handling, etc.)
- **models**: Database models/schemas
- **routes**: Định nghĩa các API routes
- **services**: Business logic tách riêng (có thể dùng lại từ nhiều controllers)
- **utils**: Helper functions (logger, response handlers, etc.)
- **validators**: Validation schemas cho request body
- **tests**: Unit tests và integration tests

## Cài đặt

### 1. Clone và cài đặt dependencies
```bash
cd BE
npm install
```

### 2. Tạo .env file
```bash
cp .env.example .env
```

Cập nhật các giá trị trong `.env` phù hợp với môi trường của bạn.

### 3. Chạy development server
```bash
npm run dev
```

Server sẽ chạy trên `http://localhost:5000`

### 4. Chạy production server
```bash
npm start
```

### 5. Chạy tests
```bash
npm test
```

### 6. Lint code
```bash
npm run lint
```

## Technologies

- **Express.js**: Web framework
- **Dotenv**: Environment variables
- **CORS**: Cross-Origin Resource Sharing
- **Helmet**: HTTP headers security
- **Joi**: Input validation
- **Nodemon**: Development auto-reload
- **Jest**: Testing framework

## API Endpoints

### Health Check
```
GET /api/v1/health
```

## Best Practices

1. **Controllers**: Chỉ xử lý request/response
2. **Services**: Chứa business logic phức tạp
3. **Middleware**: Xử lý cross-cutting concerns
4. **Utils**: Helper functions tái sử dụng
5. **Error Handling**: Sử dụng global error handler
6. **Validation**: Validate input trước khi xử lý

## Environment Variables

Tham khảo `.env.example` để xem các biến cần thiết.

