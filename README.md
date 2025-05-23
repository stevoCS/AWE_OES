# AWE Electronics Store - Frontend React Application

🛒 A modern electronics store frontend built with React.

## 🎯 Project Overview

AWE Electronics Store is a React-based frontend application for an electronics e-commerce platform.

### ✨ Main Features

**Frontend Features**
- 🔐 User interface for registration/login
- 📱 Product browsing and display
- 🛒 Shopping cart interface
- 📦 Order management interface
- 👤 Profile management
- 📱 Responsive design
- 🎨 Modern UI/UX

## 🏗 Project Structure

```
AWE_OES/
├── awe-electronics-store/    # Frontend React application
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services (configured for external backend)
│   │   └── styles/          # Style files
│   ├── public/              # Static resources
│   └── package.json
└── README.md               # Project documentation
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v16+)
- npm or yarn

### Installation and Setup

1. **Clone Project**

```bash
git clone <your-repo-url>
cd AWE_OES
```

2. **Start Frontend Application**

```bash
# Enter frontend directory
cd awe-electronics-store

# Install dependencies
npm install

# Start frontend application
npm start
```

Frontend application will start at http://localhost:3000

### 3. Backend Configuration

The frontend is configured to connect to a backend API at `http://localhost:5001/api`. You will need to:

1. Set up your own backend server
2. Ensure it provides the required API endpoints
3. Update the API base URL in `src/services/api.js` if needed

## 📚 Frontend Architecture

### Technology Stack
- **React 19** - Modern frontend framework
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **CSS Modules** - Component styling

### Key Components
- `src/App.js` - Main application component and routing
- `src/components/` - Reusable UI components
- `src/pages/` - Page-level components
- `src/services/api.js` - API service layer

### Required API Endpoints

The frontend expects the following API endpoints from your backend:

#### Authentication API
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user info

#### Products API
- `GET /api/products` - Get product list
- `GET /api/products/:id` - Get product details
- `GET /api/products/featured/list` - Get featured products

#### Cart API
- `GET /api/cart` - Get user cart
- `POST /api/cart/add` - Add product to cart
- `DELETE /api/cart/clear` - Clear cart

#### Orders API
- `POST /api/orders/create` - Create order
- `GET /api/orders/my-orders` - Get user orders
- `GET /api/orders/:id` - Get order details

## 🔧 Configuration

### API Base URL

Update the API base URL in `src/services/api.js`:

```javascript
const api = axios.create({
  baseURL: 'http://your-backend-url/api',
  // ... other config
});
```

### Environment Variables

Create a `.env` file in the `awe-electronics-store` directory:

```
REACT_APP_API_BASE_URL=http://localhost:5001/api
```

## 🎨 Customization

### Styling
- Modify CSS files in `src/styles/`
- Update component styles
- Customize theme colors and layouts

### Features
- Add new components in `src/components/`
- Create new pages in `src/pages/`
- Extend API services in `src/services/`

## 🚀 Deployment

### Build for Production

```bash
cd awe-electronics-store
npm run build
```

### Deployment Platforms
- **Vercel** (recommended)
- **Netlify**
- **AWS S3 + CloudFront**
- **GitHub Pages**

## 🧪 Development

### Available Scripts

```bash
npm start      # Start development server
npm run build  # Build for production
npm test       # Run tests
npm run eject  # Eject from Create React App
```

## 📱 Features Demo

1. **Product Browsing** - Browse electronics catalog
2. **User Registration** - Create user accounts
3. **Shopping Cart** - Add/remove products
4. **Order Management** - Place and track orders
5. **Responsive Design** - Works on mobile and desktop

## 🔍 Troubleshooting

### Common Issues

1. **API Connection Failed**
   - Check if backend server is running
   - Verify API base URL configuration
   - Check CORS settings on backend

2. **Build Errors**
   - Clear node_modules and reinstall: `rm -rf node_modules && npm install`
   - Clear npm cache: `npm cache clean --force`

## 🤝 Contributing

1. Fork the project
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add some amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project uses ISC License - see [LICENSE](LICENSE) file for details

---

**Note**: This is a frontend-only application. You will need to implement or connect to a compatible backend API to enable full functionality.
