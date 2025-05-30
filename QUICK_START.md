# AWE Electronics - Quick Start Guide

![AWE Electronics](https://img.shields.io/badge/AWE_Electronics-E--commerce-blue)
![Status](https://img.shields.io/badge/Status-Production_Ready-success)

A comprehensive quick start guide to get AWE Electronics e-commerce platform up and running in minutes.

## 🚀 Quick Start

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **Python**: 3.8 or higher  
- **MongoDB**: v4.4 or higher
- **Git**: Latest version

### 1. Clone the Repository
```bash
git clone <repository-url>
cd AWE_OES
```

### 2. Start Backend Server (Terminal 1)
```bash
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Configure environment variables
cp config.env.example config.env
# Edit config.env with your database settings

# Start the FastAPI server
python run.py
```

✅ **Backend will be available at**: `http://localhost:8000`

### 3. Start Frontend Application (Terminal 2)
```bash
cd frontend

# Install Node.js dependencies
npm install

# Start the development server
npm run dev
```

✅ **Frontend will be available at**: `http://localhost:5173`

### 4. Access the Application
- **🌐 Frontend Application**: http://localhost:5173
- **⚡ Backend API**: http://localhost:8000
- **📚 API Documentation**: http://localhost:8000/docs
- **🔧 Alternative API Docs**: http://localhost:8000/redoc

## 🎯 Default Features & Pages

### Available Pages
- **🏠 Homepage** (`/`): Product showcase and featured items
- **📦 Products** (`/product`): Complete product catalog with filtering
- **🔍 Product Details** (`/product/:id`): Detailed product information
- **🔐 Login** (`/login`): User authentication
- **📝 Register** (`/register`): New user registration
- **🛒 Shopping Cart** (`/cart`): Cart management and checkout
- **👤 Dashboard** (`/dashboard`): User account management

### Test Accounts
You can register a new account or use the following test data:
- **Email**: Any valid email format (e.g., `test@example.com`)
- **Password**: Minimum 6 characters
- **Name**: Any valid first and last name

### Pre-loaded Product Data
The system comes with 8 complete products:

| Product | Price | Category |
|---------|-------|----------|
| UltraBook Pro 15 | $1,299.99 | Computers |
| Galaxy X50 | $899.99 | Mobile |
| SmartHome Speaker | $299.99 | Audio |
| FitTrack Smartwatch | $399.99 | Wearables |
| Wireless Mouse | $79.99 | Accessories |
| Wall Charger | $49.99 | Accessories |
| VR Headset | $599.99 | Gaming |
| Apple Keyboard | $179.99 | Accessories |

## 🛠️ Development Environment

### Frontend Development
- **Framework**: React 18.2+ with Vite 4.4+
- **State Management**: React Context API
- **Routing**: React Router v6
- **Styling**: CSS3 with Space Grotesk typography
- **Build Tool**: Vite for fast development and building

### Backend Development
- **Framework**: FastAPI 0.104+ (Python 3.8+)
- **Database**: MongoDB with async Motor driver
- **Authentication**: JWT token-based authentication
- **Data Validation**: Pydantic models with type safety
- **API Documentation**: Auto-generated OpenAPI/Swagger

### Database Configuration
- **Collections**: `users`, `products`, `carts`
- **Indexes**: Automatically created for optimal performance
- **Data Persistence**: All data is stored in MongoDB
- **Connection**: Async operations for better performance

## 🔧 Troubleshooting

### Common Issues & Solutions

#### 1. Frontend Cannot Connect to Backend
**Problem**: Frontend shows connection errors or API calls fail
```bash
# Solution: Verify backend server is running
curl http://localhost:8000/health

# Check if backend is accessible
ps aux | grep python
```

#### 2. MongoDB Connection Error
**Problem**: Backend fails to connect to MongoDB
```bash
# Solution 1: Start MongoDB service
mongod

# Solution 2: Using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Solution 3: Check connection string in config.env
cat backend/config.env
```

#### 3. Dependency Installation Failed
**Problem**: npm or pip installation errors
```bash
# Solution for npm
npm install -g npm@latest
npm cache clean --force
npm install

# Solution for pip
pip install --upgrade pip
pip install -r requirements.txt --force-reinstall
```

#### 4. Port Conflicts
**Problem**: Port already in use errors
```bash
# Check what's using the ports
lsof -i :5173  # Frontend port
lsof -i :8000  # Backend port

# Kill processes if needed
kill -9 <PID>

# Alternative: Change ports in configuration files
# Frontend: vite.config.js
# Backend: run.py or config.env
```

#### 5. Environment Variables Not Loading
**Problem**: Backend configuration errors
```bash
# Ensure config.env file exists
ls backend/config.env

# Verify file format (no extra spaces, correct syntax)
cat backend/config.env

# Copy from example if needed
cp backend/config.env.example backend/config.env
```

## 📱 Feature Walkthrough

### Getting Started Tutorial

1. **👤 User Registration & Login**
   - Navigate to http://localhost:5173/register
   - Create a new account with valid email and password
   - Login with your credentials at http://localhost:5173/login

2. **🛍️ Browse Products**
   - Visit the homepage to see featured products
   - Go to `/product` page for complete product catalog
   - Use search and category filters

3. **🔍 Product Filtering & Search**
   - Try searching for "laptop" or "phone"
   - Use category dropdown to filter by type
   - Sort by price or name

4. **🛒 Shopping Cart Management**
   - Click "Add to Cart" on any product
   - View cart at `/cart` page
   - Update quantities or remove items

5. **📋 Product Details**
   - Click on any product to view detailed information
   - See specifications, images, and pricing
   - Add to cart from product detail page

## 🚀 Next Steps

### Recommended Enhancements
- **💳 Payment Integration**: Add Stripe or PayPal payment processing
- **📧 Email Notifications**: Implement order confirmation emails
- **📱 Mobile App**: Develop React Native mobile application
- **🔍 Advanced Search**: Add AI-powered product recommendations
- **📊 Analytics Dashboard**: Implement admin analytics panel
- **🚚 Shipping Integration**: Add real-time shipping calculations

### Production Deployment
- **🐳 Docker**: Use provided Docker configurations
- **☁️ Cloud Hosting**: Deploy to AWS, Azure, or Google Cloud
- **🔒 Security**: Implement rate limiting and security headers
- **📊 Monitoring**: Add application performance monitoring
- **🔄 CI/CD**: Set up automated testing and deployment

## 📚 Additional Resources

### Documentation Links
- **📖 Complete Documentation**: [README.md](README.md)
- **🏗️ Project Structure**: [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)
- **⚛️ Frontend Guide**: [frontend/README.md](frontend/README.md)
- **🐍 Backend Guide**: [backend/README.md](backend/README.md)

### API Testing
```bash
# Test user registration
curl -X POST "http://localhost:8000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "password": "password123"
  }'

# Test product search
curl "http://localhost:8000/api/products/?search=laptop&limit=5"

# Test with authentication
curl -H "Authorization: Bearer <your-jwt-token>" \
  "http://localhost:8000/api/cart/"
```

## 🎉 Success!

You now have a fully functional e-commerce platform running locally! 

**🎊 Congratulations! You're ready to:**
- Browse and search products
- Register and manage user accounts
- Add items to shopping cart
- Explore the admin API documentation
- Start customizing and extending the platform

---

**Enjoy building with AWE Electronics!** 🛍️⚡

For questions or support, check the main [README.md](README.md) or open an issue in the repository. 