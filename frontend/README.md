# AWE Electronics Frontend

A modern, responsive e-commerce frontend built with React 18 + Vite, featuring a complete shopping experience with admin management capabilities.

## 🏗️ Architecture Overview

### Core Technologies
- **React 18** - Component-based UI library with hooks
- **Vite** - Fast development build tool
- **React Router** - Client-side routing
- **Context API** - Global state management
- **CSS Modules** - Component-scoped styling

### Project Structure
```
frontend/
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── Layout.jsx     # Main layout wrapper
│   │   ├── AdminLayout.jsx # Admin panel layout
│   │   └── ui/            # UI primitives (buttons, icons)
│   ├── context/           # React Context providers
│   │   ├── UserContext.jsx    # User authentication & profile
│   │   ├── CartContext.jsx    # Shopping cart state
│   │   └── ThemeContext.jsx   # Dark/light theme
│   ├── pages/             # Route components
│   │   ├── Home.jsx           # Product showcase homepage
│   │   ├── Product.jsx        # Product catalog with filters
│   │   ├── ProductDetail.jsx  # Individual product view
│   │   ├── Cart.jsx           # Shopping cart
│   │   ├── Payment.jsx        # Checkout & payment
│   │   ├── Login.jsx          # User authentication
│   │   ├── Register.jsx       # User registration
│   │   ├── UserProfile.jsx    # Profile management
│   │   └── Admin*/           # Admin management pages
│   ├── api/               # API integration
│   │   ├── config.js          # Auth & public APIs
│   │   └── adminApi.js        # Admin-specific APIs
│   ├── utils/             # Utility functions
│   │   └── imageMap.js        # Product image management
│   └── assets/            # Static assets (images, icons)
```

## 🔄 Application Flow

### 1. User Authentication Flow
```
Login/Register → JWT Token → UserContext → Protected Routes
     ↓
User Profile Management → Avatar Upload → Local Storage
     ↓
Session Persistence → Email-specific Storage → Auto-restore
```

### 2. Shopping Experience Flow
```
Browse Products → Filter/Search → Product Details
     ↓
Add to Cart → CartContext → Guest/User Cart Merge
     ↓
Checkout → Payment Processing → Order Confirmation
```

### 3. Admin Management Flow
```
Admin Login → Protected Admin Routes → Management Dashboard
     ↓
Product Management → Drag & Drop Homepage Organization
     ↓
Order Management → Status Updates → Customer Notifications
     ↓
Customer Management → User Data Overview
```

## 🛠️ Key Features

### Customer Features
- **🛍️ Product Catalog**: Advanced filtering, search, and categorization
- **🛒 Shopping Cart**: Persistent cart with guest/user merge capability
- **💳 Payment System**: Luhn algorithm validation with multiple payment methods
- **👤 User Profiles**: Avatar upload, profile management, order history
- **🎨 Theme Support**: Dark/light mode with system preference detection
- **📱 Responsive Design**: Mobile-first approach with adaptive layouts

### Admin Features
- **📊 Dashboard**: Real-time analytics and order overview
- **🎯 Product Management**: CRUD operations with drag-and-drop homepage organization
- **📦 Order Management**: Status tracking and customer communication
- **👥 Customer Management**: User data and activity monitoring
- **⚙️ Settings**: System configuration and admin profile management

## 🔧 State Management

### Context Providers
1. **UserContext**: Authentication, profile data, session persistence
2. **CartContext**: Shopping cart state, guest/user merge, local storage
3. **ThemeContext**: UI theming, dark/light mode preferences

### Data Flow
```
API Calls → Context Updates → Component Re-renders → UI Updates
     ↓
Local Storage → Persistence → Session Restoration
```

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn package manager

### Installation & Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Environment Setup
Create `.env` file in frontend root:
```env
VITE_API_BASE_URL=http://localhost:8000
VITE_APP_NAME=AWE Electronics
```

## 🧪 Payment Testing

The payment system uses the Luhn algorithm for card validation. Use these test cards:

### Valid Test Cards
```
4532015112830366 - Visa (16 digits)
5555555555554444 - Mastercard (16 digits)
378282246310005 - American Express (15 digits)
6011111111111117 - Discover (16 digits)
```

### Special Test Scenarios
- **CVV 000 or 999**: Triggers payment failure
- **Last digit 0 or 5**: Simulates insufficient balance
- **Last digit 1 or 6**: Simulates bank rejection

## 🎨 UI/UX Design Principles

### Design System
- **Typography**: Space Grotesk font family for modern appeal
- **Color Palette**: Blue primary (#0D80F2) with semantic colors
- **Spacing**: 8px grid system for consistent layouts
- **Components**: Reusable UI primitives with consistent styling

### Responsive Breakpoints
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## 📁 Asset Management

### Product Images
- Location: `src/assets/`
- Formats: PNG, JPG (optimized for web)
- Naming: Descriptive names matching product categories
- Management: Automated mapping in `utils/imageMap.js`

### Dynamic Image Support
- Admin uploads: Handled via dynamic image cache
- Fallback system: Intelligent matching based on product names
- Performance: Lazy loading and optimized rendering

## 🔒 Security Features

- **JWT Authentication**: Secure token-based auth with refresh tokens
- **Protected Routes**: Role-based access control
- **Input Validation**: Client-side validation with server verification
- **XSS Protection**: Sanitized data rendering
- **CSRF Protection**: Token-based request validation

## 📈 Performance Optimizations

- **Code Splitting**: Route-based lazy loading
- **Image Optimization**: WebP format with fallbacks
- **Caching Strategy**: Local storage for user data and cart
- **Bundle Analysis**: Optimized build with tree shaking
- **Memory Management**: Proper cleanup of event listeners

## 🌐 Internationalization Ready

- **Localization Support**: English UI with extensible i18n structure
- **Currency**: Australian Dollar (AUD) with GST calculation
- **Timezone**: Australia/Melbourne timezone support
- **Date Formats**: Localized date and time display

---

Built with ❤️ for modern e-commerce experiences

```bash
# Install
npm install

# Start
npm run dev

# Build
npm run build
```
## Tech Stack
React 18 + Vite + React Router + Context API

## Overview 
Our payment system now uses the standard Luhn algorithm (mod 10 algorithm) to verify the validity of credit card numbers.

## Test Cases 
### Valid Card Numbers (Will Succeed) 
```
4532015112830366 - Visa (16 digits) 
4000056655665556 - Visa (16 digits) 5
555555555554444 - Mastercard (16 digits) 
5105105105105100 - Mastercard (16 digits) 
378282246310005 - American Express (15 digits) 
371449635398431 - American Express (15 digits) 
6011111111111117 - Discover (16 digits) 
6011000990139424 - Discover (16 digits)

### Special Failure Conditions

#### 1. Card Number Last Digit Rules
- Last digit is 0 or 5: Simulates insufficient balance
- Last digit is 1 or 6: Simulates bank rejection

#### 2. CVV Special Values
- `000`: Triggers payment failure
- `999`: Triggers payment failure