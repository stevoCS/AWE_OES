# AWE Electronics Online Store - Backend API

This is the Python backend service for AWE Electronics online store, developed using the FastAPI framework and utilizing MongoDB as the data storage.

## Features

### Core Functionality Modules

1. **User Authentication Management** (`/api/auth`)
   - User registration and login
   - JWT token authentication
   - User profile management
   - Token refresh

2. **Product Management** (`/api/products`)
   - CRUD operations for products
   - Product search and filtering
   - Category and brand management
   - Inventory management

3. **Shopping Cart Management** (`/api/cart`)
   - Adding/removing products
   - Updating product quantities
   - Cart checkout
   - Price calculation (including tax and shipping)

4. **Order Management** (`/api/orders`)
   - Creating orders from the shopping cart
   - Order status management
   - Order query and search
   - Order cancellation and refund

5. **Order Tracking** (`/api/tracking`)
   - Real-time logistics tracking
   - Order status updates
   - Delivery progress display
   - Estimated delivery time

## Technology Stack

- **Web Framework**: FastAPI 0.104.1
- **Database**: MongoDB (using Motor asynchronous driver)
- **Authentication**: JWT (python-jose)
- **Password Encryption**: Bcrypt (passlib)
- **Data Validation**: Pydantic 2.5.0
- **Asynchronous Support**: Python asyncio
- **API Documentation**: Swagger UI (auto-generated)

## Project Structure

```
backend/
├── main.py                 # FastAPI application entry
├── run.py                  # Startup script
├── requirements.txt        # Python dependencies
├── config.env.example      # Environment variable example
├── database/
│   └── connection.py       # MongoDB connection management
├── models/                 # Data models
│   ├── customer.py         # Customer model
│   ├── product.py          # Product model
│   ├── cart.py            # Shopping cart model
│   ├── order.py           # Order model
│   └── tracking.py        # Tracking model
├── controllers/           # Business logic controllers
│   ├── auth_controller.py  # Authentication controller
│   ├── product_controller.py # Product controller
│   ├── cart_controller.py  # Shopping cart controller
│   ├── order_controller.py # Order controller
│   └── tracking_controller.py # Tracking controller
├── routes/                # API routes
│   ├── auth.py            # Authentication routes
│   ├── products.py        # Product routes
│   ├── cart.py           # Shopping cart routes
│   ├── orders.py         # Order routes
│   └── tracking.py       # Tracking routes
└── utils/                # Utility functions
    ├── auth.py           # Authentication utilities
    └── response.py       # Response formatting
```

## Quick Start

### 1. Environment Requirements

- Python 3.8+
- MongoDB 4.4+

### 2. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 3. Configure Environment Variables

Copy the environment variable example file and configure:

```bash
cp config.env.example .env
```

Edit the `.env` file:

```env
# MongoDB configuration
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=awe_electronics_store

# JWT configuration
SECRET_KEY=your-super-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Application configuration
DEBUG=True
HOST=0.0.0.0
PORT=8000
```

### 4. Start MongoDB

Ensure MongoDB service is running:

```bash
# Using Docker to start MongoDB
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Or using locally installed MongoDB
mongod
```

### 5. Start the Application

```bash
# Method 1: Using the startup script
python run.py

# Method 2: Directly running
python main.py

# Method 3: Using uvicorn
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 6. Access API Documentation

After the application starts, access the following address to view the API documentation:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## API Usage Examples

### User Registration

```bash
curl -X POST "http://localhost:8000/api/auth/register" \
-H "Content-Type: application/json" \
-d '{
  "username": "testuser",
  "email": "test@example.com",
  "full_name": "Test User",
  "password": "password123"
}'
```

### User Login

```bash
curl -X POST "http://localhost:8000/api/auth/login" \
-H "Content-Type: application/json" \
-d '{
  "username": "testuser",
  "password": "password123"
}'
```

### Search Products

```bash
curl -X GET "http://localhost:8000/api/products/?keyword=phone&page=1&size=10"
```

### Add Product to Cart

```bash
curl -X POST "http://localhost:8000/api/cart/items" \
-H "Content-Type: application/json" \
-H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
-d '{
  "product_id": "product_id_here",
  "quantity": 2
}'
```

## Database Design

### Collection Structure

1. **customers** - Customer information
2. **products** - Product information
3. **carts** - Shopping cart
4. **orders** - Orders
5. **tracking** - Order tracking

### Index Suggestions

```javascript
// Customer collection index
db.customers.createIndex({ "username": 1 }, { unique: true })
db.customers.createIndex({ "email": 1 }, { unique: true })

// Product collection index
db.products.createIndex({ "name": "text", "description": "text" })
db.products.createIndex({ "category": 1 })
db.products.createIndex({ "brand": 1 })
db.products.createIndex({ "price": 1 })

// Order collection index
db.orders.createIndex({ "customer_id": 1 })
db.orders.createIndex({ "order_number": 1 }, { unique: true })
db.orders.createIndex({ "status": 1 })
db.orders.createIndex({ "created_at": -1 })

// Tracking collection index
db.tracking.createIndex({ "order_id": 1 }, { unique: true })
db.tracking.createIndex({ "order_number": 1 })
db.tracking.createIndex({ "tracking_number": 1 })
```

## Deployment

### Using Docker

1. Create a `Dockerfile`:

```dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["python", "run.py"]
```

2. Build and run:

```bash
docker build -t awe-backend .
docker run -p 8000:8000 awe-backend
```

### Using docker-compose

Create a `docker-compose.yml`:

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db

  backend:
    build: .
    ports:
      - "8000:8000"
    environment:
      - MONGODB_URL=mongodb://mongodb:27017
    depends_on:
      - mongodb

volumes:
  mongodb_data:
```

Run:

```bash
docker-compose up -d
```

## Development Notes

### Adding New Features

1. Define data models in `models/`
2. Implement business logic in `controllers/`
3. Define API routes in `routes/`
4. Register routes in `main.py`

### Testing

```bash
# Install test dependencies
pip install pytest pytest-asyncio httpx

# Run tests
pytest
```

### Code Style

The project follows the following code standards:
- PEP 8 Python code style
- Type annotations (Type Hints)
- Detailed docstrings

## Troubleshooting

### Common Issues

1. **MongoDB Connection Failure**
   - Check if MongoDB service is running
   - Verify connection URL configuration

2. **JWT Token Error**
   - Check SECRET_KEY configuration
   - Ensure token has not expired

3. **Import Error**
   - Ensure all dependencies are installed
   - Check Python path configuration

## License

MIT License

## Contact

If you have any questions, please create an Issue or contact the development team. 