import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Product from './pages/Product';
import ProductDetail from './pages/ProductDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Account from './pages/Account';
import UserDashboard from './pages/UserDashboard';
import UserProfile from './pages/UserProfile';
import Cart from './pages/Cart';
import OrderConfirmation from './pages/OrderConfirmation';
import OrderTracking from './pages/OrderTracking';
import OrderDetail from './pages/OrderDetail';
import Payment from './pages/Payment';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailed from './pages/PaymentFailed';
import { CartProvider } from './context/CartContext';
import { UserProvider } from './context/UserContext';
import { OrderProvider } from './context/OrderContext';
import { ThemeProvider } from './context/ThemeContext';
import './App.css';

// Simple placeholder components for missing pages
const NewArrivals = () => (
  <div style={{ padding: '40px', textAlign: 'center', fontFamily: "'Space Grotesk', Arial, sans-serif" }}>
    <h1>New Arrivals</h1>
    <p>Coming soon...</p>
    <Link to="/" style={{ color: '#0D80F2', textDecoration: 'none' }}>Return to Home</Link>
  </div>
);

const BestSellers = () => (
  <div style={{ padding: '40px', textAlign: 'center', fontFamily: "'Space Grotesk', Arial, sans-serif" }}>
    <h1>Best Sellers</h1>
    <p>Coming soon...</p>
    <Link to="/" style={{ color: '#0D80F2', textDecoration: 'none' }}>Return to Home</Link>
  </div>
);

const AboutUs = () => (
  <div style={{ padding: '40px', textAlign: 'center', fontFamily: "'Space Grotesk', Arial, sans-serif" }}>
    <h1>About Us</h1>
    <p>AWE Electronics - Your trusted electronics partner since 2025.</p>
    <Link to="/" style={{ color: '#0D80F2', textDecoration: 'none' }}>Return to Home</Link>
  </div>
);

const CustomerSupport = () => (
  <div style={{ padding: '40px', textAlign: 'center', fontFamily: "'Space Grotesk', Arial, sans-serif" }}>
    <h1>Customer Support</h1>
    <p>Need help? Contact us at support@aweelectronics.com</p>
    <Link to="/" style={{ color: '#0D80F2', textDecoration: 'none' }}>Return to Home</Link>
  </div>
);

const TermsOfService = () => (
  <div style={{ padding: '40px', textAlign: 'center', fontFamily: "'Space Grotesk', Arial, sans-serif" }}>
    <h1>Terms of Service</h1>
    <p>Terms and conditions coming soon...</p>
    <Link to="/" style={{ color: '#0D80F2', textDecoration: 'none' }}>Return to Home</Link>
  </div>
);

const Warranty = () => (
  <div style={{ padding: '40px', textAlign: 'center', fontFamily: "'Space Grotesk', Arial, sans-serif" }}>
    <h1>Warranty Information</h1>
    <p>All products come with a 1-year manufacturer warranty.</p>
    <Link to="/" style={{ color: '#0D80F2', textDecoration: 'none' }}>Return to Home</Link>
  </div>
);

// Component to track location changes and force re-renders
const AppRoutes = () => {
  const location = useLocation();
  
  // Force re-render: use location.pathname + timestamp as key
  const routeKey = `${location.pathname}-${location.search}-${Date.now()}`;
  
  console.log('Route change:', location.pathname, '- Key:', routeKey);
  
  return (
    <Routes key={routeKey}>
      <Route path="/" element={<Home key={`home-${location.pathname}`} />} />
      <Route path="/product" element={<Product key={`product-${location.pathname}`} />} />
      <Route path="/product/:id" element={<ProductDetail key={`product-detail-${location.pathname}`} />} />
      <Route path="/new-arrivals" element={<NewArrivals key={`new-arrivals-${location.pathname}`} />} />
      <Route path="/best-sellers" element={<BestSellers key={`best-sellers-${location.pathname}`} />} />
      <Route path="/login" element={<Login key={`login-${location.pathname}`} />} />
      <Route path="/register" element={<Register key={`register-${location.pathname}`} />} />
      <Route path="/dashboard" element={<UserDashboard key={`dashboard-${location.pathname}`} />} />
      <Route path="/profile" element={<UserProfile key={`profile-${location.pathname}`} />} />
      <Route path="/account" element={<Account key={`account-${location.pathname}`} />} />
      <Route path="/cart" element={<Cart key={`cart-${location.pathname}`} />} />
      <Route path="/about-us" element={<AboutUs key={`about-us-${location.pathname}`} />} />
      <Route path="/customer-support" element={<CustomerSupport key={`customer-support-${location.pathname}`} />} />
      <Route path="/terms-of-service" element={<TermsOfService key={`terms-of-service-${location.pathname}`} />} />
      <Route path="/warranty" element={<Warranty key={`warranty-${location.pathname}`} />} />
      <Route path="/order-confirmation" element={<OrderConfirmation key={`order-confirmation-${location.pathname}`} />} />
      <Route path="/order-tracking" element={<OrderTracking key={`order-tracking-${location.pathname}`} />} />
      <Route path="/order-detail/:orderId" element={<OrderDetail key={`order-detail-${location.pathname}`} />} />
      <Route path="/order/:orderNumber" element={<OrderTracking key={`order-tracking-${location.pathname}`} />} />
      <Route path="/payment" element={<Payment key={`payment-${location.pathname}`} />} />
      <Route path="/payment-success" element={<PaymentSuccess key={`payment-success-${location.pathname}`} />} />
      <Route path="/payment-failed" element={<PaymentFailed key={`payment-failed-${location.pathname}`} />} />
      {/* Catch-all route for undefined paths */}
      <Route path="*" element={
        <div style={{ padding: '40px', textAlign: 'center', fontFamily: "'Space Grotesk', Arial, sans-serif" }}>
          <h1>Page Not Found</h1>
          <p>The page you're looking for doesn't exist.</p>
          <Link to="/" style={{ color: '#0D80F2', textDecoration: 'none' }}>Return to Home</Link>
        </div>
      } />
    </Routes>
  );
};

function App() {
  return (
    <ThemeProvider>
      <UserProvider>
        <CartProvider>
          <OrderProvider>
            <Router
              future={{
                v7_startTransition: true,
                v7_relativeSplatPath: true
              }}
            >
              <div id="app-container">
                <AppRoutes />
              </div>
            </Router>
          </OrderProvider>
        </CartProvider>
      </UserProvider>
    </ThemeProvider>
  );
}

export default App;
