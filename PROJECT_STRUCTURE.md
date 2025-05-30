# AWE Electronics - Project Structure & Architecture

![Architecture](https://img.shields.io/badge/Architecture-Microservices-brightgreen)
![Frontend](https://img.shields.io/badge/Frontend-React_18.2-61DAFB)
![Backend](https://img.shields.io/badge/Backend-FastAPI_0.104-009688)
![Database](https://img.shields.io/badge/Database-MongoDB_4.4-47A248)

A comprehensive guide to the AWE Electronics e-commerce platform architecture, project structure, and technical implementation.

## 🏗️ Project Architecture

AWE Electronics is a complete e-commerce platform built with a modern **microservices architecture** featuring full frontend-backend separation:

- **Frontend**: React 18.2 + Vite 4.4 + React Router v6
- **Backend**: FastAPI 0.104 + Python 3.8+ + MongoDB 4.4+
- **Database**: MongoDB with async Motor driver
- **Authentication**: JWT Token-based security

### 🎯 Architectural Principles
- **Separation of Concerns**: Clear boundaries between frontend, backend, and database layers
- **Async-First Design**: Non-blocking operations throughout the stack
- **RESTful API**: Standard HTTP methods and status codes
- **Component-Based UI**: Reusable React components with proper state management
- **Type Safety**: Pydantic models for backend data validation

## 📁 Complete Project Structure

```
AWE_OES/
├── 📁 frontend/                    # React Frontend Application
│   ├── src/
│   │   ├── api/                   # API Integration Layer
│   │   │   └── config.js          # Backend API endpoint configuration
│   │   ├── assets/                # Static Assets & Resources
│   │   │   ├── laptop.png         # Product images
│   │   │   ├── Phone.png          # (UltraBook, Galaxy X50, etc.)
│   │   │   ├── Speaker.png        
│   │   │   ├── smartwatch.png     
│   │   │   ├── Wireless mouse.png 
│   │   │   ├── Well charger.png   
│   │   │   ├── VR Headset.png     
│   │   │   └── Keyboard.png       
│   │   ├── components/            # Reusable UI Components
│   │   │   └── ui/               # UI Component Library
│   │   ├── context/              # React Context State Management
│   │   │   ├── UserContext.jsx   # User authentication & profile state
│   │   │   └── CartContext.jsx   # Shopping cart state management
│   │   ├── pages/                # Page Components (Route Handlers)
│   │   │   ├── Home.jsx          # Homepage with product showcase
│   │   │   ├── Product.jsx       # Product listing with search/filter
│   │   │   ├── ProductDetail.jsx # Individual product detail view
│   │   │   ├── Login.jsx         # User login interface
│   │   │   ├── Register.jsx      # User registration form
│   │   │   ├── Cart.jsx          # Shopping cart management
│   │   │   └── Dashboard.jsx     # User account dashboard
│   │   ├── App.jsx               # Main application component & routing
│   │   └── main.jsx              # Application entry point
│   ├── public/                   # Public Static Files
│   ├── package.json              # Node.js dependencies & scripts
│   ├── vite.config.js            # Vite build configuration
│   ├── eslint.config.js          # ESLint code quality rules
│   ├── .gitignore               # Git ignore patterns
│   └── README.md                # Frontend documentation
│
├── 📁 backend/                     # FastAPI Backend Application
│   ├── controllers/              # Business Logic Layer
│   │   ├── auth_controller.py    # Authentication business logic
│   │   ├── product_controller.py # Product management operations
│   │   └── cart_controller.py    # Shopping cart operations
│   ├── models/                   # Pydantic Data Models
│   │   ├── user.py              # User data models & validation
│   │   ├── product.py           # Product data models & schemas
│   │   └── cart.py              # Cart item models & structures
│   ├── routes/                   # API Route Definitions
│   │   ├── auth.py              # Authentication endpoints
│   │   ├── products.py          # Product CRUD endpoints
│   │   └── cart.py              # Cart management endpoints
│   ├── utils/                    # Utility Functions & Helpers
│   │   ├── auth.py              # JWT token utilities
│   │   ├── password.py          # Password hashing & verification
│   │   └── response.py          # Standardized API response formatting
│   ├── database/                 # Database Layer
│   │   └── connection.py        # MongoDB async connection management
│   ├── scripts/                  # Database & Utility Scripts
│   │   └── init_db.py           # Database initialization & seeding
│   ├── main.py                   # FastAPI application entry point
│   ├── run.py                    # Development server startup script
│   ├── requirements.txt          # Python dependencies
│   ├── config.env               # Environment variables (local)
│   ├── config.env.example       # Environment template
│   └── README.md                # Backend documentation
│
├── 📄 README.md                   # Main project documentation
├── 📄 QUICK_START.md             # Quick start guide (this file)
├── 📄 PROJECT_STRUCTURE.md       # Project structure documentation
├── 📄 LICENSE                    # MIT License
└── 📁 .git/                      # Git repository data
```

## 🚀 Core Features & Implementation

### Frontend Features
- ✅ **User Authentication**: Registration, login, JWT token management
- ✅ **Product Display**: Homepage showcase, product listing, detailed views
- ✅ **Advanced Filtering**: Category-based filtering, search functionality, sorting
- ✅ **Shopping Cart**: Add/remove items, quantity management, persistent state
- ✅ **Responsive Design**: Modern UI/UX optimized for all device sizes
- ✅ **Image Management**: High-quality product images with proper loading

### Backend Features  
- ✅ **RESTful API**: Complete CRUD operations with standard HTTP methods
- ✅ **User Management**: Secure registration, login, profile management
- ✅ **Product Management**: Full product lifecycle with search capabilities
- ✅ **Cart Operations**: Real-time cart state synchronization
- ✅ **Data Validation**: Comprehensive Pydantic model validation
- ✅ **Error Handling**: Structured error responses with proper HTTP codes
- ✅ **Database Integration**: Async MongoDB operations with proper indexing

### Database Features
- ✅ **Document Storage**: Flexible NoSQL data modeling
- ✅ **Text Search**: Full-text search capabilities across products
- ✅ **Indexing**: Optimized queries with proper database indexes
- ✅ **Relationships**: Proper data relationships between users, products, and carts

## 📊 Database Schema Design

### Users Collection (`users`)
```javascript
{
  _id: ObjectId,                    // MongoDB unique identifier
  email: String,                    // User email (unique index)
  firstName: String,                // User's first name
  lastName: String,                 // User's last name
  passwordHash: String,             // bcrypt hashed password
  isActive: Boolean,                // Account status flag
  createdAt: Date,                  // Registration timestamp
  updatedAt: Date                   // Last modification timestamp
}

// Indexes:
// - { email: 1 } (unique)
// - { isActive: 1 }
```

### Products Collection (`products`)
```javascript
{
  _id: ObjectId,                    // MongoDB unique identifier
  name: String,                     // Product name
  description: String,              // Detailed product description
  price: Number,                    // Product price in USD
  category: String,                 // Product category (Computers, Mobile, etc.)
  brand: String,                    // Product brand/manufacturer
  model: String,                    // Product model identifier
  specifications: {                 // Product specifications object
    processor: String,              // CPU/processor info
    memory: String,                 // RAM/storage info
    display: String,                // Screen/display details
    connectivity: String,           // Connection options
    // ... additional specs per product type
  },
  images: [String],                 // Array of image file paths
  stockQuantity: Number,            // Available inventory count
  isAvailable: Boolean,             // Availability flag
  viewsCount: Number,               // Number of product views
  salesCount: Number,               // Number of units sold
  createdAt: Date,                  // Product creation timestamp
  updatedAt: Date                   // Last modification timestamp
}

// Indexes:
// - { name: "text", description: "text" } (full-text search)
// - { category: 1 }
// - { brand: 1 }
// - { price: 1 }
// - { isAvailable: 1 }
```

### Carts Collection (`carts`)
```javascript
{
  _id: ObjectId,                    // MongoDB unique identifier
  userId: ObjectId,                 // Reference to user document
  items: [{                         // Array of cart items
    productId: ObjectId,            // Reference to product document
    quantity: Number,               // Item quantity
    price: Number                   // Price at time of adding to cart
  }],
  totalAmount: Number,              // Calculated total cart value
  createdAt: Date,                  // Cart creation timestamp
  updatedAt: Date                   // Last modification timestamp
}

// Indexes:
// - { userId: 1 } (unique - one cart per user)
// - { "items.productId": 1 }
```

## 🎯 Product Catalog

The system includes 8 complete products with detailed specifications:

| Product | Price | Category | Key Features |
|---------|-------|----------|-------------|
| **UltraBook Pro 15** | $1,299.99 | Computers | Intel i7 processor, 16GB RAM, 512GB SSD |
| **Galaxy X50** | $899.99 | Mobile | 6.5" OLED display, 128GB storage, Triple camera |
| **SmartHome Speaker** | $299.99 | Audio | AI assistant, WiFi connectivity, Bluetooth |
| **FitTrack Smartwatch** | $399.99 | Wearables | Health tracking, GPS, Heart rate monitor |
| **Wireless Mouse** | $79.99 | Accessories | Ergonomic design, 2.4GHz wireless, USB-C |
| **Wall Charger** | $49.99 | Accessories | Fast charging, USB-C, 65W power output |
| **VR Headset** | $599.99 | Gaming | 4K display resolution, Motion tracking |
| **Apple Keyboard** | $179.99 | Accessories | Mechanical switches, Backlit, Wireless |

Each product includes:
- **High-quality images** stored in `frontend/src/assets/`
- **Detailed specifications** with technical details
- **Proper inventory management** with stock tracking
- **Category classification** for filtering and search

## 🛠️ Development Environment Setup

### Frontend Development Environment
```bash
cd frontend
npm install                     # Install dependencies
npm run dev                     # Start development server (port 5173)
npm run build                   # Build for production
npm run preview                 # Preview production build
npm run lint                    # Code quality check
```

**Technology Stack:**
- **Build Tool**: Vite 4.4+ for fast development and optimized builds
- **Framework**: React 18.2+ with modern hooks and Context API
- **Routing**: React Router v6 for client-side navigation
- **Styling**: CSS3 with Space Grotesk typography
- **Code Quality**: ESLint for consistent code standards

### Backend Development Environment
```bash
cd backend
pip install -r requirements.txt # Install Python dependencies
python run.py                   # Start development server (port 8000)
python main.py                  # Alternative startup method
python scripts/init_db.py       # Initialize database with sample data
```

**Technology Stack:**
- **Framework**: FastAPI 0.104+ for high-performance async API
- **Database Driver**: Motor for async MongoDB operations
- **Authentication**: JWT tokens with python-jose library
- **Data Validation**: Pydantic 2.5+ for request/response models
- **Password Security**: bcrypt with passlib for secure hashing

## 🔗 API Endpoint Reference

### Authentication Endpoints
| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| `POST` | `/api/auth/register` | User registration | `{email, firstName, lastName, password}` | User data + JWT token |
| `POST` | `/api/auth/login` | User login | `{email, password}` | User data + JWT token |
| `GET` | `/api/auth/me` | Get current user | None (JWT required) | User profile data |

### Product Management Endpoints
| Method | Endpoint | Description | Parameters | Response |
|--------|----------|-------------|------------|----------|
| `GET` | `/api/products/` | List products | `search`, `category`, `page`, `limit` | Paginated product list |
| `GET` | `/api/products/{id}` | Get product details | Product ID in path | Full product data |
| `GET` | `/api/products/meta/categories` | Get categories | None | List of available categories |
| `GET` | `/api/products/meta/brands` | Get brands | None | List of available brands |

### Shopping Cart Endpoints
| Method | Endpoint | Description | Request Body | Authentication |
|--------|----------|-------------|--------------|----------------|
| `GET` | `/api/cart/` | Get user's cart | None | JWT required |
| `POST` | `/api/cart/add` | Add item to cart | `{productId, quantity}` | JWT required |
| `PUT` | `/api/cart/update` | Update item quantity | `{productId, quantity}` | JWT required |
| `DELETE` | `/api/cart/remove/{productId}` | Remove item | Product ID in path | JWT required |

## 🎉 Project Highlights & Best Practices

### Architecture Highlights
- **🎯 Modern Tech Stack**: Latest versions of React, FastAPI, and MongoDB
- **⚡ High Performance**: Async operations throughout the stack
- **🔒 Security First**: JWT authentication, password hashing, input validation
- **📱 Responsive Design**: Mobile-first approach with modern UI/UX
- **🔧 Developer Experience**: Hot reload, auto-generated docs, comprehensive error handling
- **🚀 Production Ready**: Proper error handling, logging, and monitoring capabilities

### Code Quality Standards
- **Frontend**: ESLint configuration with React best practices
- **Backend**: PEP 8 Python standards with type hints
- **Database**: Proper indexing and query optimization
- **API Design**: RESTful endpoints with consistent response formats
- **Documentation**: Comprehensive inline documentation and README files

### Scalability Considerations
- **Microservices Architecture**: Easy to scale individual components
- **Database Indexing**: Optimized for query performance
- **Async Operations**: Non-blocking I/O for better concurrency
- **Component-Based UI**: Reusable components for maintainability
- **Environment Configuration**: Easy deployment across different environments

---

**AWE Electronics** - Built with modern technologies and best practices 🚀

For detailed setup instructions, see [QUICK_START.md](QUICK_START.md) or the main [README.md](README.md). 