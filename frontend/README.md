# AWE Electronics - Frontend Application

![React](https://img.shields.io/badge/React-18.2.0-blue)
![Vite](https://img.shields.io/badge/Vite-4.4.5-646CFF)
![React Router](https://img.shields.io/badge/React_Router-6.16.0-CA4245)
![Status](https://img.shields.io/badge/Status-Production_Ready-success)

A modern, responsive e-commerce frontend application built with React and Vite for AWE Electronics platform.

## 🚀 Features

### Core Functionality
- **🛍️ Product Catalog**: Browse and search through electronics products
- **🔍 Advanced Filtering**: Filter by categories, price, and search keywords
- **📱 Product Details**: Comprehensive product information and specifications
- **🛒 Shopping Cart**: Add, remove, and manage cart items with persistent state
- **👤 User Authentication**: Complete registration and login system with JWT
- **📊 User Dashboard**: Personal account management interface

### UI/UX Features
- **📱 Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **🎨 Modern Interface**: Clean, professional design with Space Grotesk typography
- **⚡ Fast Loading**: Optimized images and efficient state management
- **🖼️ Product Gallery**: High-quality product images with proper fallbacks
- **🔄 Real-time Updates**: Instant cart updates and navigation feedback

## 🛠️ Technology Stack

- **Framework**: React 18.2.0 with Hooks and Context API
- **Build Tool**: Vite 4.4.5 for fast development and optimized builds
- **Routing**: React Router v6 for client-side navigation
- **State Management**: React Context API for global state
- **Styling**: CSS3 with modern features and responsive design
- **HTTP Client**: Native Fetch API for backend communication
- **Authentication**: JWT token-based authentication
- **Development**: ESLint for code quality and consistency

## 📁 Project Structure

```
src/
├── api/                    # API configuration and endpoints
│   └── config.js          # Backend API integration
├── assets/                 # Static assets
│   ├── *.png              # Product images
│   └── *.svg              # Icons and graphics
├── components/             # Reusable UI components
│   └── ui/                # UI component library
├── context/                # React Context providers
│   ├── UserContext.jsx    # User authentication state
│   └── CartContext.jsx    # Shopping cart state
├── pages/                  # Page components
│   ├── Home.jsx           # Homepage with featured products
│   ├── Product.jsx        # Product listing and filtering
│   ├── ProductDetail.jsx  # Individual product details
│   ├── Login.jsx          # User login interface
│   ├── Register.jsx       # User registration
│   ├── Cart.jsx           # Shopping cart management
│   └── Dashboard.jsx      # User account dashboard
├── utils/                  # Utility functions
├── App.jsx                # Main application component
├── App.css                # Global styles
└── main.jsx               # Application entry point
```

## 🚀 Quick Start

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v8.0.0 or higher
- **Backend API**: AWE Electronics backend server running

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd AWE_OES/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   - Ensure backend server is running on `http://localhost:8000`
   - Check API endpoints in `src/api/config.js`

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Access the application**
   - Open your browser to `http://localhost:5173`
   - The application will automatically reload when you make changes

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## 🔗 API Integration

The frontend integrates with the AWE Electronics backend API:

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user info

### Product Endpoints
- `GET /api/products/` - Fetch all products with pagination
- `GET /api/products/{id}` - Get specific product details
- `GET /api/products/meta/categories` - Get product categories

### Cart Endpoints
- `GET /api/cart/` - Get user's cart
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/update` - Update cart item quantity
- `DELETE /api/cart/remove/{id}` - Remove item from cart

## 🎯 Product Catalog

The application showcases 8 complete product categories:

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

## 🔧 Development Guidelines

### Code Style
- Follow React best practices and hooks patterns
- Use functional components with hooks
- Implement proper error boundaries
- Maintain consistent naming conventions

### State Management
- Use React Context for global state (user, cart)
- Keep component state local when possible
- Implement proper loading and error states

### Performance Optimization
- Lazy load components where appropriate
- Optimize image loading with proper fallbacks
- Implement efficient re-rendering patterns
- Use React.memo for expensive components

### Responsive Design
- Mobile-first responsive design approach
- Breakpoints: 768px (tablet), 1024px (desktop)
- Touch-friendly interface elements
- Accessible navigation and forms

## 📱 Browser Support

- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile Browsers**: iOS Safari 14+, Chrome Mobile 90+
- **Features**: ES6+, Fetch API, CSS Grid, Flexbox

## 🚀 Production Deployment

### Build Process
```bash
npm run build
```

This creates an optimized production build in the `dist/` directory.

### Deployment Options
- **Static Hosting**: Netlify, Vercel, GitHub Pages
- **CDN Integration**: CloudFront, CloudFlare
- **Server Deployment**: Nginx, Apache with proper routing

### Environment Configuration
- Configure API base URL for production
- Set up proper CORS policies
- Implement security headers

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Standards
- Write meaningful commit messages
- Include tests for new features
- Update documentation as needed
- Follow the existing code style

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

## 🆘 Support

For support and questions:
- Check the [Quick Start Guide](../QUICK_START.md)
- Review the [Project Structure](../PROJECT_STRUCTURE.md)
- Open an issue for bugs or feature requests

---

**AWE Electronics Frontend** - Built with ❤️ using React and Vite
