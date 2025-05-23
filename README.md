# 🛒 AWE Electronics Online Store

<p align="center">
  <img src="https://img.shields.io/badge/React-18.2.0-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React">
  <img src="https://img.shields.io/badge/FastAPI-0.104.1-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI">
  <img src="https://img.shields.io/badge/MongoDB-4.4+-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB">
  <img src="https://img.shields.io/badge/Python-3.8+-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python">
</p>

<p align="center">
  <strong>🚀 A modern, full-stack e-commerce platform for AWE Electronics</strong>
</p>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-api-documentation">API Docs</a> •
  <a href="#-project-structure">Structure</a> •
  <a href="#-contributing">Contributing</a>
</p>

---

## 📋 Table of Contents

- [🎯 Project Overview](#-project-overview)
- [✨ Features](#-features)
- [🏗️ Architecture](#️-architecture)
- [🛠️ Technology Stack](#️-technology-stack)
- [⚡ Quick Start](#-quick-start)
- [📁 Project Structure](#-project-structure)
- [🔧 Backend Setup](#-backend-setup)
- [⚛️ Frontend Setup](#️-frontend-setup)
- [📚 API Documentation](#-api-documentation)
- [🐳 Docker Deployment](#-docker-deployment)
- [🧪 Testing](#-testing)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

## 🎯 Project Overview

AWE Electronics Online Store is a comprehensive web-based e-commerce platform designed to help AWE Electronics expand from a single physical store to nationwide online sales. The platform provides a seamless shopping experience with modern web technologies and robust backend infrastructure.

### 🎯 Project Goals

- **🌐 Expand Business Scope**: Transform from physical retail to nationwide online sales
- **🎨 Enhance User Experience**: Provide intuitive, responsive, and efficient shopping interface
- **📊 Support Business Growth**: Offer comprehensive analytics and management tools
- **🔒 Ensure Security**: Implement robust authentication and data protection

## ✨ Features

### 👤 Customer Management
- ✅ User registration and authentication
- ✅ JWT-based secure login system
- ✅ Profile management and updates
- ✅ Password reset functionality

### 🛍️ Shopping Experience
- ✅ Advanced product search and filtering
- ✅ Real-time inventory management
- ✅ Smart shopping cart with price calculation
- ✅ Wishlist and favorites
- ✅ Product reviews and ratings

### 📦 Order Management
- ✅ Seamless checkout process
- ✅ Multiple payment methods support
- ✅ Real-time order tracking
- ✅ Order history and management
- ✅ Automated order number generation

### 📊 Admin Features
- ✅ Product catalog management
- ✅ Inventory tracking
- ✅ Order fulfillment
- ✅ Customer management
- ✅ Sales analytics and reporting

### 🚚 Logistics & Tracking
- ✅ Real-time shipping updates
- ✅ Delivery estimation
- ✅ Package tracking integration
- ✅ Shipping method selection

## 🏗️ Architecture

The project follows a **microservices architecture** with clear separation of concerns:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend │────│  FastAPI Backend │────│   MongoDB       │
│   (Port 3000)   │    │   (Port 8000)   │    │   Database      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 🔧 Design Principles
- **MVC Pattern**: Model-View-Controller architecture
- **RESTful API**: Standard HTTP methods and status codes
- **Async Processing**: Non-blocking operations for better performance
- **SOLID Principles**: Maintainable and scalable code structure

## 🛠️ Technology Stack

### Frontend
- **⚛️ React 18.2+** - Modern UI library with hooks
- **🎨 Material-UI / Tailwind CSS** - Component library and styling
- **🔄 Axios** - HTTP client for API communication
- **🛣️ React Router** - Client-side routing
- **📱 Progressive Web App** - Offline capabilities

### Backend
- **🐍 Python 3.8+** - Core programming language
- **⚡ FastAPI** - Modern, fast web framework
- **🔐 JWT Authentication** - Secure token-based auth
- **📝 Pydantic** - Data validation and serialization
- **🔄 Motor** - Async MongoDB driver

### Database
- **🍃 MongoDB** - NoSQL document database
- **🔍 Text Search** - Full-text search capabilities
- **📊 Aggregation** - Complex data queries
- **🔄 Change Streams** - Real-time data updates

### DevOps & Tools
- **🐳 Docker** - Containerization
- **📊 uvicorn** - ASGI server
- **🧪 pytest** - Testing framework
- **📝 Swagger/OpenAPI** - Automatic API documentation

## ⚡ Quick Start

### Prerequisites
- **Python 3.8+**
- **Node.js 16+**
- **MongoDB 4.4+**
- **Git**

### 🚀 One-Command Setup

```bash
# Clone the repository
git clone https://github.com/your-username/AWE_OES.git
cd AWE_OES

# Start the entire application with Docker
docker-compose up -d
```

### 🔗 Access Points
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **MongoDB**: mongodb://localhost:27017

## 📁 Project Structure

```
AWE_OES/
├── 📁 awe-electronics-store/     # React Frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   └── utils/
│   ├── package.json
│   └── README.md
├── 📁 backend/                   # FastAPI Backend
│   ├── controllers/              # Business logic
│   ├── models/                   # Data models
│   ├── routes/                   # API endpoints
│   ├── utils/                    # Helper functions
│   ├── database/                 # DB connection
│   ├── scripts/                  # Utility scripts
│   ├── requirements.txt
│   └── README.md
├── 📁 docs/                      # Documentation
├── 🐳 docker-compose.yml         # Docker orchestration
├── 📄 README.md                  # This file
└── 📄 LICENSE                    # License information
```

## 🔧 Backend Setup

### 1. Navigate to Backend Directory
```bash
cd backend
```

### 2. Create Virtual Environment
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Environment Configuration
```bash
cp config.env.example .env
# Edit .env with your configurations
```

### 5. Initialize Database
```bash
python scripts/init_db.py
```

### 6. Start Backend Server
```bash
python run.py
# Or: uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## ⚛️ Frontend Setup

### 1. Navigate to Frontend Directory
```bash
cd awe-electronics-store
```

### 2. Install Dependencies
```bash
npm install
# Or: yarn install
```

### 3. Start Development Server
```bash
npm start
# Or: yarn start
```

## 📚 API Documentation

### 🔗 Interactive API Documentation
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### 🚀 Core API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | User registration |
| `POST` | `/api/auth/login` | User login |
| `GET` | `/api/products/` | Search products |
| `POST` | `/api/cart/items` | Add item to cart |
| `POST` | `/api/orders/` | Create order |
| `GET` | `/api/tracking/number/{order_number}` | Track order |

### 📋 API Response Format
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "code": 200
}
```

## 🐳 Docker Deployment

### Development Environment
```bash
docker-compose -f docker-compose.dev.yml up -d
```

### Production Environment
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Environment Variables
```env
# Database
MONGODB_URL=mongodb://mongodb:27017
DATABASE_NAME=awe_electronics_store

# JWT
SECRET_KEY=your-super-secret-key
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Application
DEBUG=False
HOST=0.0.0.0
PORT=8000
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest
pytest --cov=. --cov-report=html
```

### Frontend Tests
```bash
cd awe-electronics-store
npm test
npm run test:coverage
```

### API Testing
```bash
# Test user registration
curl -X POST "http://localhost:8000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "full_name": "Test User",
    "password": "password123"
  }'
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

### 1. Fork the Repository
```bash
git fork https://github.com/your-username/AWE_OES.git
```

### 2. Create Feature Branch
```bash
git checkout -b feature/amazing-feature
```

### 3. Commit Changes
```bash
git commit -m "Add amazing feature"
```

### 4. Push to Branch
```bash
git push origin feature/amazing-feature
```

### 5. Open Pull Request

### 📋 Development Guidelines
- Follow **PEP 8** for Python code
- Use **ESLint** for JavaScript code
- Write **comprehensive tests**
- Update **documentation**
- Use **conventional commits**

## 🐛 Troubleshooting

### Common Issues

#### MongoDB Connection Failed
```bash
# Check if MongoDB is running
docker ps | grep mongo

# Restart MongoDB container
docker-compose restart mongodb
```

#### Port Already in Use
```bash
# Find process using port 8000
lsof -i :8000

# Kill the process
kill -9 <PID>
```

#### JWT Token Issues
- Check `SECRET_KEY` in environment variables
- Verify token expiration time
- Clear browser localStorage

## 📊 Performance Metrics

- **API Response Time**: < 200ms average
- **Database Queries**: Optimized with indexes
- **Frontend Bundle Size**: < 1MB gzipped
- **Lighthouse Score**: 90+ across all metrics

## 🔐 Security Features

- **🔒 JWT Authentication**: Secure token-based authentication
- **🛡️ Input Validation**: Comprehensive data validation
- **🔐 Password Hashing**: bcrypt encryption
- **🚫 Rate Limiting**: API endpoint protection
- **🔍 SQL Injection Protection**: MongoDB NoSQL safety

## 📈 Roadmap

- [ ] 📱 Mobile app development
- [ ] 🔍 Advanced search with AI
- [ ] 💳 Multiple payment gateway integration
- [ ] 🌍 Multi-language support
- [ ] 📊 Advanced analytics dashboard
- [ ] 🤖 Chatbot customer support

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Made with ❤️ by the AWE Electronics Team
</p>

<p align="center">
  <a href="https://github.com/your-username/AWE_OES/issues">🐛 Report Bug</a> •
  <a href="https://github.com/your-username/AWE_OES/issues">✨ Request Feature</a> •
  <a href="mailto:support@aweelectronics.com">📧 Contact Support</a>
</p>
