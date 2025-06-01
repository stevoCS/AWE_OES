# AWE Electronics Backend API

A high-performance, production-ready e-commerce backend API built with FastAPI and MongoDB, featuring complete e-commerce functionality with admin management capabilities.

## 🏗️ Architecture Overview

### Core Technologies
- **FastAPI** - Modern async web framework with automatic OpenAPI documentation
- **MongoDB** - NoSQL document database with Motor async driver
- **JWT Authentication** - Secure token-based authentication system
- **Pydantic** - Data validation and serialization with type hints
- **bcrypt** - Password hashing and security
- **Uvicorn** - ASGI server for production deployment

### Project Structure
```
backend/
├── main.py                 # Application entry point & route registration
├── run.py                  # Development server launcher
├── config.env              # Environment configuration
├── requirements.txt        # Python dependencies
│
├── models/                 # Data models & validation schemas
│   ├── __init__.py        # Model exports
│   ├── product.py         # Product models (CRUD, search, filtering)
│   ├── customer.py        # Customer/User models (auth, profile)
│   ├── order.py           # Order models (cart, checkout, tracking)
│   └── admin.py           # Admin-specific models (dashboard, stats)
│
├── controllers/            # Business logic & data processing
│   ├── __init__.py        # Controller exports
│   ├── auth_controller.py # Authentication & user management
│   ├── product_controller.py # Product CRUD & search logic
│   ├── cart_controller.py # Shopping cart management
│   ├── order_controller.py # Order processing & tracking
│   └── admin_controller.py # Admin dashboard & analytics
│
├── routes/                 # API endpoints & request routing
│   ├── __init__.py        # Route exports
│   ├── auth.py            # /api/auth/* - Login, register, profile
│   ├── products.py        # /api/products/* - Product catalog
│   ├── cart.py            # /api/cart/* - Shopping cart
│   ├── orders.py          # /api/orders/* - Order management
│   ├── customers.py       # /api/customers/* - Customer data
│   └── admin.py           # /api/admin/* - Admin operations
│
├── utils/                  # Utility functions & helpers
│   ├── __init__.py        # Utility exports
│   ├── auth.py            # JWT token generation & validation
│   └── helpers.py         # Common helper functions
│
└── database/              # Database configuration & connection
    ├── __init__.py        # Database exports
    └── connection.py      # MongoDB connection & collection access
```

## 🔄 API Workflow & Data Flow

### 1. Authentication Flow
```
Registration/Login → JWT Token Generation → Token Validation → Protected Routes
         ↓
User Profile Management → Password Updates → Admin Role Verification
         ↓
Session Management → Token Refresh → Automatic Logout
```

### 2. E-commerce Workflow
```
Product Browsing → Search & Filtering → Product Details
         ↓
Add to Cart → Cart Management → Guest/User Cart Sync
         ↓
Checkout Process → Order Creation → Payment Processing
         ↓
Order Tracking → Status Updates → Delivery Confirmation
```

### 3. Admin Management Flow
```
Admin Authentication → Dashboard Analytics → Real-time Statistics
         ↓
Product Management → CRUD Operations → Inventory Updates
         ↓
Order Management → Status Changes → Customer Communications
         ↓
Customer Management → User Data → Analytics Reports
```

## 🗄️ Database Schema Design

### Collections & Data Models
```
MongoDB Database: awe_electronics_store
├── customers (Users & Admins)
│   ├── _id: ObjectId
│   ├── username: String (unique)
│   ├── email: String (unique)
│   ├── full_name: String
│   ├── password_hash: String (bcrypt)
│   ├── role: String (user/admin)
│   ├── profile: Object (phone, address, bio)
│   ├── created_at: DateTime
│   └── updated_at: DateTime
│
├── products (Product Catalog)
│   ├── _id: ObjectId
│   ├── name: String
│   ├── description: String
│   ├── price: Decimal
│   ├── category: String
│   ├── brand: String
│   ├── images: Array[String]
│   ├── stock_quantity: Integer
│   ├── homepage_section: String (new/best/none)
│   ├── views_count: Integer
│   ├── sales_count: Integer
│   ├── created_at: DateTime
│   └── updated_at: DateTime
│
├── orders (Order Management)
│   ├── _id: ObjectId
│   ├── order_number: String (unique)
│   ├── customer_id: ObjectId (ref: customers)
│   ├── items: Array[OrderItem]
│   ├── subtotal: Decimal
│   ├── tax_amount: Decimal (GST 10%)
│   ├── shipping_cost: Decimal
│   ├── total_amount: Decimal
│   ├── status: String (pending/processing/shipped/delivered)
│   ├── shipping_address: Object
│   ├── payment_method: String
│   ├── created_at: DateTime
│   └── updated_at: DateTime
│
├── cart_items (Shopping Cart)
│   ├── _id: ObjectId
│   ├── customer_id: ObjectId (ref: customers)
│   ├── product_id: ObjectId (ref: products)
│   ├── quantity: Integer
│   ├── price: Decimal (snapshot)
│   ├── created_at: DateTime
│   └── updated_at: DateTime
│
└── settings (System Configuration)
    ├── _id: ObjectId
    ├── type: String (system)
    ├── site_name: String
    ├── currency: String (AUD)
    ├── timezone: String (Australia/Melbourne)
    ├── created_at: DateTime
    └── updated_at: DateTime
```

## 🚀 Getting Started

### Prerequisites
- Python 3.8+
- MongoDB 4.4+
- pip (Python package manager)

### Installation & Setup
```bash
# Clone repository
git clone <repository>
cd AWE_OES/backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Environment configuration
cp config.env.example config.env
# Edit config.env with your settings
```

### Environment Configuration
```env
# Database
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=awe_electronics_store

# Security
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Development
DEBUG=True
CORS_ORIGINS=["http://localhost:3000", "http://localhost:5173"]
```

### Start Services
```bash
# Start MongoDB (Docker recommended)
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Start backend API server
python run.py

# Or for production
uvicorn main:app --host 0.0.0.0 --port 8000
```

## 🔗 API Endpoints Reference

### Authentication Endpoints
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | User registration | No |
| POST | `/api/auth/login` | User login | No |
| GET | `/api/auth/profile` | Get user profile | Yes |
| PUT | `/api/auth/profile` | Update user profile | Yes |
| POST | `/api/auth/change-password` | Change password | Yes |

### Product Management
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/products/` | Get product catalog | No |
| GET | `/api/products/{id}` | Get product details | No |
| GET | `/api/products/meta/categories` | Get categories | No |
| POST | `/api/admin/products` | Create product | Admin |
| PUT | `/api/admin/products/{id}` | Update product | Admin |
| DELETE | `/api/admin/products/{id}` | Delete product | Admin |

### Shopping Cart
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/cart/summary` | Get cart summary | Yes |
| POST | `/api/cart/items` | Add item to cart | Yes |
| PUT | `/api/cart/items/{id}` | Update cart item | Yes |
| DELETE | `/api/cart/items/{id}` | Remove from cart | Yes |
| DELETE | `/api/cart` | Clear cart | Yes |

### Order Management
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/orders` | Create order | Yes |
| GET | `/api/orders` | Get user orders | Yes |
| GET | `/api/orders/{id}` | Get order details | Yes |
| GET | `/api/admin/orders` | Get all orders | Admin |
| PUT | `/api/admin/orders/{id}/status` | Update order status | Admin |

### Admin Dashboard
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/admin/dashboard/stats` | Dashboard statistics | Admin |
| GET | `/api/admin/dashboard/sales-trends` | Sales analytics | Admin |
| GET | `/api/admin/customers` | Customer management | Admin |
| POST | `/api/admin/upload-image` | Upload product images | Admin |
| GET/PUT | `/api/admin/settings` | System settings | Admin |

## 🔒 Security Features

### Authentication & Authorization
- **JWT Tokens**: Stateless authentication with configurable expiry
- **Password Security**: bcrypt hashing with salt rounds
- **Role-Based Access**: User/Admin role separation
- **Token Validation**: Automatic token verification middleware

### Data Protection
- **Input Validation**: Pydantic models with type checking
- **SQL Injection Prevention**: MongoDB's document-based queries
- **CORS Configuration**: Configurable cross-origin policies
- **Error Handling**: Sanitized error responses

## 📊 Performance Features

### Database Optimization
- **Async Operations**: Non-blocking database queries with Motor
- **Connection Pooling**: Efficient database connection management
- **Indexing Strategy**: Optimized queries for search and filtering
- **Aggregation Pipelines**: Complex analytics with MongoDB aggregation

### Caching & Efficiency
- **Response Optimization**: Efficient JSON serialization
- **Query Optimization**: Selective field projection
- **Pagination**: Efficient data loading with limit/offset
- **Image Handling**: Optimized file upload and serving

## 🧪 Testing & Development

### API Testing
```bash
# Health check
curl http://localhost:8000/health

# User registration
curl -X POST "http://localhost:8000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","full_name":"Test User","password":"password123"}'

# User login
curl -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}'

# Get products
curl "http://localhost:8000/api/products/"

# Admin login
curl -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### Default Test Accounts
```
Admin Account:
Username: admin
Password: admin123
Email: admin@aweelectronics.com

Test User Account:
Username: testuser
Password: password123
Email: test@example.com
```

## 📚 API Documentation

### Interactive Documentation
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI Schema**: http://localhost:8000/openapi.json

### Health Monitoring
- **Health Check**: http://localhost:8000/health
- **Database Status**: Automatic connection validation
- **Service Metrics**: Built-in performance monitoring

## 🐳 Deployment Options

### Docker Deployment
```bash
# Build image
docker build -t awe-backend .

# Run container
docker run -p 8000:8000 awe-backend

# Using Docker Compose
docker-compose up -d
```

### Production Configuration
```bash
# Production server
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker

# Environment variables
export MONGODB_URL=mongodb://prod-mongo:27017
export SECRET_KEY=production-secret-key
export DEBUG=False
```

## 🔧 Development Guidelines

### Adding New Features
1. **Define Models**: Create Pydantic models in `models/`
2. **Implement Logic**: Add business logic in `controllers/`
3. **Create Routes**: Define API endpoints in `routes/`
4. **Register Routes**: Add to `main.py`
5. **Test APIs**: Verify with interactive docs

### Code Standards
- **Type Hints**: Use Python type annotations
- **Async/Await**: Implement async operations properly
- **Error Handling**: Provide meaningful error messages
- **Documentation**: Add docstrings to functions
- **Validation**: Use Pydantic for data validation

## 🆘 Troubleshooting

### Common Issues
```bash
# MongoDB connection failed
docker ps                    # Check MongoDB container
mongosh                      # Test database connection

# Import errors
pip install -r requirements.txt  # Reinstall dependencies

# Port conflicts
lsof -ti:8000 | xargs kill -9   # Kill process on port 8000

# Database access issues
# Check MONGODB_URL in config.env
# Verify database permissions
```

### Performance Optimization
- Monitor MongoDB slow queries
- Implement proper indexing
- Use connection pooling
- Enable query logging for debugging

---

**Production Status**: ✅ Ready for deployment with comprehensive testing and optimization 