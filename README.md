# AWE Electronics - OES - Full Stack Project

<p align="center">
  <img src="https://img.shields.io/badge/React-18.2-61DAFB?style=flat&logo=react" alt="React">
  <img src="https://img.shields.io/badge/FastAPI-0.104-009688?style=flat&logo=fastapi" alt="FastAPI">
  <img src="https://img.shields.io/badge/MongoDB-4.4+-47A248?style=flat&logo=mongodb" alt="MongoDB">
  <img src="https://img.shields.io/badge/Status-Production_Ready-success?style=flat" alt="Status">
</p>

**A modern full-stack e-commerce platform that uses the Australian GST tax system and supports admin functions.**

## 🚀 Quick Start

### Requirements
- Node.js 18+
- Python 3.8+
- MongoDB 4.4+

### Installation & Setup

```bash
# 1. Clone the project
git clone <repository-url>
cd AWE_OES

# 2. Start MongoDB
docker run -d -p 27017:27017 --name mongodb mongo:latest

# 3. Start Backend Service (Terminal 1)
cd backend
pip install -r requirements.txt
python run.py

# 4. Start Frontend Service (Terminal 2)
cd frontend
npm install
npm run dev
```

**Access URLs:**
- 🌐 Frontend App: http://localhost:5173
- ⚡ Backend API: http://localhost:8000
- 📚 API Documentation: http://localhost:8000/docs

## 🧪 Test Accounts

### User Account (Registration Required)
```
Email: Any valid email
Password: At least 6 characters
```

### Admin Account (Pre-configured)
```
Username: admin
Password: admin123
Email: admin@aweelectronics.com
```

**Admin Function Testing:**
1. Login to frontend using admin account
2. Access admin dashboard features
3. Test API endpoints: http://localhost:8000/docs (using admin JWT token)

## ✨ Key Features

### User Features
- ✅ User registration/login
- ✅ Product browsing & search
- ✅ Shopping cart management
- ✅ Australian GST (10%) tax calculation
- ✅ Responsive design

### Admin Features
- ✅ Dashboard statistics
- ✅ Product management (CRUD operations)
- ✅ Order management & status updates
- ✅ Customer management
- ✅ System settings (Australian localization)

### Technical Features
- ✅ JWT authentication system
- ✅ Async API operations
- ✅ Auto-generated API documentation
- ✅ Input validation & error handling
- ✅ MongoDB full-text search


## 🏗️ Technical Architecture

```
Frontend (React)    →    Backend (FastAPI)    →    Database (MongoDB)
├─ React 18.2            ├─ Python 3.8+              ├─ Document Store
├─ Vite 4.4              ├─ JWT Authentication        ├─ Full-text Search
├─ React Router          ├─ Async Controllers         ├─ Aggregation Queries
└─ Context API           └─ Pydantic Validation       └─ Index Optimization
```

## 📁 Project Structure

```
AWE_OES/
├── frontend/                    # React Frontend Application
│   ├── src/
│   │   ├── pages/              # Page Components
│   │   ├── context/            # State Management
│   │   ├── utils/              # Utility Functions
│   │   └── assets/             # Static Assets
│   └── package.json
└── backend/                     # FastAPI Backend API
    ├── routes/                 # API Routes
    ├── controllers/            # Business Logic
    ├── models/                 # Data Models
    ├── database/               # Database Connection
    └── requirements.txt
```

## 🔗 API Endpoints

### Authentication API
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Product API
- `GET /api/products/` - Get product list
- `GET /api/products/{id}` - Get product details
- `GET /api/products/meta/categories` - Get categories

### Shopping Cart API
- `GET /api/cart/summary` - Get shopping cart
- `POST /api/cart/items` - Add item to cart
- `PUT /api/cart/items/{id}` - Update quantity
- `DELETE /api/cart/items/{id}` - Remove item

### Admin API (Requires admin privileges)
- `GET /api/admin/dashboard/stats` - Dashboard statistics
- `GET /api/admin/products` - Product management
- `GET /api/admin/orders` - Order management
- `GET /api/admin/customers` - Customer management
- `POST /api/admin/upload-image` - Image upload

## 🔧 Development Environment

### Frontend Development
```bash
cd frontend
npm run dev      # Development server
npm run build    # Production build
npm run preview  # Preview build
npm run lint     # Code linting
```

### Backend Development
```bash
cd backend
python run.py            # Development server
python -m pytest        # Run tests
uvicorn main:app --reload  # Alternative startup
```

### Database Operations
```bash
# MongoDB connection
mongosh mongodb://localhost:27017

# View collections
use awe_electronics_store
show collections

# View product data
db.products.find().pretty()
```

## 🚀 Production Deployment

### Docker Deployment
```bash
# Build images
docker build -t awe-frontend ./frontend
docker build -t awe-backend ./backend

# Run containers
docker run -p 5173:5173 awe-frontend
docker run -p 8000:8000 awe-backend
```

### Environment Variables
```env
# backend/config.env
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=awe_electronics_store
SECRET_KEY=your-secret-key
DEBUG=False
```

## 🧪 Testing Guide

### User Feature Testing
1. Visit http://localhost:5173
2. Register new user or login
3. Browse products and add to cart
4. View cart and GST tax calculations

### Admin Feature Testing
1. Login using admin account
2. Test dashboard statistics display
3. Manage products (CRUD operations)
4. View and update order status
5. Manage customer information

### API Testing
```bash
# Health check
curl http://localhost:8000/health

# User registration
curl -X POST "http://localhost:8000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@example.com","full_name":"Test User","password":"password123"}'

# Admin login
curl -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin@awe.com","password":"admin123"}'
```

## 🔒 Security Features

- 🔐 JWT Token Authentication
- 🔒 bcrypt Password Encryption
- ✅ Pydantic Data Validation
- 🛡️ CORS Security Configuration
- 🚫 SQL Injection Protection
- 🔍 Input Parameter Validation

## 📚 Documentation Resources

- **Frontend Documentation**: [frontend/README.md](frontend/README.md)
- **Backend Documentation**: [backend/README.md](backend/README.md)
- **API Documentation**: https://awe-oes.onrender.com/docs
- **Project Structure**: [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)
- **Quick Start Guide**: [QUICK_START.md](QUICK_START.md)

## 🤝 Contributing Guidelines

1. Fork the project
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file for details

---

**AWE Electronics** - Australian E-commerce Platform 🇦🇺⚡