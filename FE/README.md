# React Frontend Project

## Cấu trúc thư mục

```
FE/
├── public/                    # Files tĩnh
│   └── index.html            # HTML chính
├── src/
│   ├── components/           # Các component React
│   ├── pages/                # Các trang (pages)
│   ├── services/             # API services, business logic
│   ├── hooks/                # Custom React hooks
│   ├── utils/                # Utility functions
│   ├── styles/               # CSS/SCSS files
│   ├── assets/               # Hình ảnh, fonts, etc
│   ├── App.jsx               # Component chính
│   ├── App.css               # CSS cho App
│   └── main.jsx              # Entry point
├── .gitignore
├── package.json
├── vite.config.js
└── README.md
```

## Hướng dẫn sử dụng

### Cài đặt dependencies
```bash
npm install
```

### Chạy development server
```bash
npm run dev
```

### Build cho production
```bash
npm run build
```

### Preview production build
```bash
npm run preview
```

## Mô tả từng thư mục

- **components**: Chứa các reusable React components
- **pages**: Chứa các page components (thường dùng với router)
- **services**: Chứa các hàm gọi API, xử lý dữ liệu
- **hooks**: Chứa custom hooks
- **utils**: Chứa các helper functions
- **styles**: Chứa các CSS/SCSS files
- **assets**: Chứa hình ảnh, fonts, videos, etc

