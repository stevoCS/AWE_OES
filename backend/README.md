# AWE Electronics - Backend API

![FastAPI](https://img.shields.io/badge/FastAPI-0.104.1-009688)
![Python](https://img.shields.io/badge/Python-3.8+-3776AB)
![MongoDB](https://img.shields.io/badge/MongoDB-4.4+-47A248)
![JWT](https://img.shields.io/badge/JWT-Authentication-000000)
![Status](https://img.shields.io/badge/Status-Production_Ready-success)

A high-performance, async REST API backend for AWE Electronics e-commerce platform, built with FastAPI and MongoDB.

## 🚀 Features

### Core API Modules
- **🔐 Authentication System**: JWT-based user registration, login, and session management
- **📦 Product Management**: Full CRUD operations with advanced search and filtering
- **🛒 Shopping Cart**: Real-time cart management with persistent state
- **👤 User Profiles**: Complete user account management and preferences
- **🔍 Advanced Search**: Full-text search, category filtering, and sorting
- **📊 Inventory Tracking**: Real-time stock management and availability
- **⚡ High Performance**: Async operations with MongoDB for optimal speed

### Technical Features
- **📚 Auto-Generated Documentation**: Interactive Swagger UI and ReDoc
- **🔒 Security**: Password hashing, JWT tokens, and input validation
- **📝 Data Validation**: Comprehensive Pydantic models with type safety
- **🌐 CORS Support**: Configured for cross-origin frontend integration
- **🔧 Error Handling**: Structured error responses and logging
- **🚀 Async Operations**: Non-blocking database operations

## 🛠️ Technology Stack

- **Framework**: FastAPI 0.104.1 (high-performance async web framework)
- **Database**: MongoDB 4.4+ with Motor async driver
- **Authentication**: JWT (JSON Web Tokens) with python-jose
- **Password Security**: bcrypt hashing with passlib
- **Data Validation**: Pydantic 2.5.0 for request/response models
- **API Documentation**: Automatic OpenAPI/Swagger generation
- **Environment**: Python 3.8+ with asyncio support
- **Development**: Uvicorn ASGI server for development and production

## 📁 Project Architecture

```
backend/
├── main.py                 # FastAPI application entry point
├── run.py                  # Development server startup script
├── requirements.txt        # Python dependencies
├── config.env             # Environment configuration
├── config.env.example     # Environment template
├── 
├── database/              # Database layer
│   └── connection.py      # MongoDB async connection management
├── 
├── models/                # Pydantic data models
│   ├── user.py           # User data models
│   ├── product.py        # Product data models
│   └── cart.py           # Shopping cart models
├── 
├── controllers/           # Business logic layer
│   ├── auth_controller.py    # Authentication business logic
│   ├── product_controller.py # Product management logic
│   └── cart_controller.py    # Cart management logic
├── 
├── routes/                # API route definitions
│   ├── auth.py           # Authentication endpoints
│   ├── products.py       # Product endpoints
│   └── cart.py           # Cart endpoints
├── 
├── utils/                 # Utility functions
│   ├── auth.py           # JWT token utilities
│   ├── password.py       # Password hashing utilities
│   └── response.py       # Standardized response formatting
└── 
└── scripts/              # Database and utility scripts
    └── init_db.py        # Database initialization
```

## 🚀 Quick Start

### Prerequisites
- **Python**: 3.8 or higher
- **MongoDB**: 4.4 or higher (local installation or Docker)
- **pip**: Latest version recommended

### Installation

1. **Clone and navigate to backend**
   ```bash
   git clone <repository-url>
   cd AWE_OES/backend
   ```

2. **Create virtual environment (recommended)**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment**
   ```bash
   cp config.env.example config.env
   ```
   
   Edit `config.env` with your settings:
   ```env
   # MongoDB Configuration
   MONGODB_URL=mongodb://localhost:27017
   DATABASE_NAME=awe_electronics
   
   # JWT Configuration
   SECRET_KEY=your-super-secret-key-change-this-in-production
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   
   # Application Settings
   DEBUG=True
   HOST=0.0.0.0
   PORT=8000
   
   # CORS Settings
   FRONTEND_URL=http://localhost:5173
   ```

5. **Start MongoDB**
   ```bash
   # Using Docker (recommended)
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   
   # Or using local MongoDB
   mongod
   ```

6. **Initialize database (optional)**
   ```bash
   python scripts/init_db.py
   ```

7. **Start the development server**
   ```bash
   python run.py
   ```

The API will be available at `http://localhost:8000`

### Available Scripts

```bash
python run.py                    # Start development server
python main.py                   # Direct FastAPI startup
uvicorn main:app --reload        # Alternative with uvicorn
python scripts/init_db.py        # Initialize database
```

## 📚 API Documentation

### Interactive Documentation
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI JSON**: http://localhost:8000/openapi.json

### Authentication Endpoints

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| `POST` | `/api/auth/register` | User registration | None |
| `POST` | `/api/auth/login` | User login | None |
| `GET` | `/api/auth/me` | Get current user info | Bearer Token |

### Product Endpoints

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| `GET` | `/api/products/` | List products with filtering | None |
| `GET` | `/api/products/{id}` | Get product details | None |
| `GET` | `/api/products/meta/categories` | Get product categories | None |
| `GET` | `/api/products/meta/brands` | Get product brands | None |

### Cart Endpoints

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| `GET` | `/api/cart/` | Get user's cart | Bearer Token |
| `POST` | `/api/cart/add` | Add item to cart | Bearer Token |
| `PUT` | `/api/cart/update` | Update cart item quantity | Bearer Token |
| `DELETE` | `/api/cart/remove/{productId}` | Remove item from cart | Bearer Token |

## 🔧 API Usage Examples

### User Registration
```bash
curl -X POST "http://localhost:8000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "password": "securepassword123"
  }'
```

### User Login
```bash
curl -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword123"
  }'
```

### Search Products
```bash
curl -X GET "http://localhost:8000/api/products/?search=laptop&category=computers&page=1&limit=10"
```

### Add to Cart (requires authentication)
```bash
curl -X POST "http://localhost:8000/api/cart/add" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "productId": "product_id_here",
    "quantity": 2
  }'
```

## 💾 Database Schema

### MongoDB Collections

#### Users Collection
```javascript
{
  _id: ObjectId,
  email: String (unique),
  firstName: String,
  lastName: String,
  passwordHash: String,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

#### Products Collection
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  price: Number,
  category: String,
  brand: String,
  model: String,
  specifications: Object,
  images: [String],
  stockQuantity: Number,
  isAvailable: Boolean,
  viewsCount: Number,
  salesCount: Number,
  createdAt: Date,
  updatedAt: Date
}
```

#### Carts Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  items: [{
    productId: ObjectId,
    quantity: Number,
    price: Number
  }],
  totalAmount: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### Database Indexes
```javascript
// User indexes
db.users.createIndex({ "email": 1 }, { unique: true })

// Product indexes
db.products.createIndex({ "name": "text", "description": "text" })
db.products.createIndex({ "category": 1 })
db.products.createIndex({ "brand": 1 })
db.products.createIndex({ "price": 1 })
db.products.createIndex({ "isAvailable": 1 })

// Cart indexes
db.carts.createIndex({ "userId": 1 }, { unique: true })
```

## 🚀 Production Deployment

### Using Docker

1. **Create Dockerfile**
   ```dockerfile
   FROM python:3.9-slim
   
   WORKDIR /app
   
   COPY requirements.txt .
   RUN pip install --no-cache-dir -r requirements.txt
   
   COPY . .
   
   EXPOSE 8000
   
   CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
   ```

2. **Build and run**
   ```bash
   docker build -t awe-backend .
   docker run -p 8000:8000 awe-backend
   ```

### Using Docker Compose

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
    environment:
      - MONGO_INITDB_ROOT_USERNAME=admin
      - MONGO_INITDB_ROOT_PASSWORD=password

  backend:
    build: .
    ports:
      - "8000:8000"
    environment:
      - MONGODB_URL=mongodb://admin:password@mongodb:27017
      - DATABASE_NAME=awe_electronics
    depends_on:
      - mongodb
    volumes:
      - .:/app

volumes:
  mongodb_data:
```

### Environment Configuration for Production

```env
# Production MongoDB with authentication
MONGODB_URL=mongodb://username:password@host:port/database?authSource=admin

# Strong JWT secret (generate with: openssl rand -hex 32)
SECRET_KEY=your-super-long-random-secret-key-for-production

# Production settings
DEBUG=False
HOST=0.0.0.0
PORT=8000

# CORS for production frontend
FRONTEND_URL=https://your-frontend-domain.com
```

## 🔧 Development Guidelines

### Code Standards
- **PEP 8**: Follow Python style guidelines
- **Type Hints**: Use type annotations throughout
- **Async/Await**: Utilize async operations for database calls
- **Error Handling**: Implement proper try-catch blocks
- **Logging**: Use structured logging for debugging

### Adding New Features

1. **Define Models**: Create Pydantic models in `models/`
2. **Implement Logic**: Add business logic in `controllers/`
3. **Create Routes**: Define API endpoints in `routes/`
4. **Register Routes**: Add routes to `main.py`
5. **Test**: Add tests for new functionality

### Testing

```bash
# Install test dependencies
pip install pytest pytest-asyncio httpx

# Run tests
pytest

# Run with coverage
pytest --cov=. --cov-report=html
```

## 🔍 Monitoring and Logging

### Health Check Endpoint
```bash
curl http://localhost:8000/health
```

### Application Logs
- Development: Console output with detailed information
- Production: Structured JSON logs for aggregation

### Performance Monitoring
- Built-in FastAPI metrics at `/metrics` endpoint
- Response time tracking
- Database query performance monitoring

## 🛠️ Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   ```bash
   # Check MongoDB status
   docker ps  # if using Docker
   mongosh   # test connection
   ```

2. **JWT Token Errors**
   - Verify `SECRET_KEY` in config.env
   - Check token expiration time
   - Ensure proper Authorization header format

3. **CORS Issues**
   - Update `FRONTEND_URL` in config.env
   - Check browser developer tools for CORS errors

4. **Import Errors**
   ```bash
   # Ensure virtual environment is activated
   source venv/bin/activate
   
   # Reinstall dependencies
   pip install -r requirements.txt
   ```

### Performance Optimization

- **Database**: Use appropriate indexes for query patterns
- **Async**: Ensure all I/O operations are async
- **Caching**: Implement Redis for frequently accessed data
- **Pagination**: Use limit/offset for large result sets

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

## 🤝 Contributing

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open Pull Request**

### Development Standards
- Follow existing code style and patterns
- Add tests for new features
- Update documentation
- Ensure all tests pass before submitting

## 🆘 Support

For support and questions:
- **Documentation**: Check the [Project Structure](../PROJECT_STRUCTURE.md)
- **Quick Start**: Review the [Quick Start Guide](../QUICK_START.md)
- **Issues**: Open an issue for bugs or feature requests
- **API Docs**: Visit http://localhost:8000/docs for interactive documentation

---

**AWE Electronics Backend** - Built with ⚡ FastAPI and MongoDB 