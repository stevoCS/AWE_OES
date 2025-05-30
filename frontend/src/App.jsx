import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Product from './pages/Product';
import ProductDetail from './pages/ProductDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Account from './pages/Account';
import UserDashboard from './pages/UserDashboard';
import Cart from './pages/Cart';
import OrderConfirmation from './pages/OrderConfirmation';
import Payment from './pages/Payment';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailed from './pages/PaymentFailed';
import TestNavigation from './pages/TestNavigation';
import { CartProvider } from './context/CartContext';
import { UserProvider } from './context/UserContext';
import { OrderProvider } from './context/OrderContext';
import './App.css';

// Simple route wrapper for unique keys
const RouteWrapper = ({ Component, routeName }) => {
  const location = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return <Component key={`${routeName}-${location.pathname}`} />;
};

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

function App() {
  return (
    <UserProvider>
      <CartProvider>
        <OrderProvider>
          <Router>
            <Routes>
              <Route path="/" element={<RouteWrapper Component={Home} routeName="Home" />} />
              <Route path="/product" element={<RouteWrapper Component={Product} routeName="Product" />} />
              <Route path="/product/:id" element={<RouteWrapper Component={ProductDetail} routeName="ProductDetail" />} />
              <Route path="/new-arrivals" element={<RouteWrapper Component={NewArrivals} routeName="NewArrivals" />} />
              <Route path="/best-sellers" element={<RouteWrapper Component={BestSellers} routeName="BestSellers" />} />
              <Route path="/login" element={<RouteWrapper Component={Login} routeName="Login" />} />
              <Route path="/register" element={<RouteWrapper Component={Register} routeName="Register" />} />
              <Route path="/dashboard" element={<RouteWrapper Component={UserDashboard} routeName="Dashboard" />} />
              <Route path="/account" element={<RouteWrapper Component={Account} routeName="Account" />} />
              <Route path="/cart" element={<RouteWrapper Component={Cart} routeName="Cart" />} />
              <Route path="/about-us" element={<RouteWrapper Component={AboutUs} routeName="AboutUs" />} />
              <Route path="/customer-support" element={<RouteWrapper Component={CustomerSupport} routeName="CustomerSupport" />} />
              <Route path="/terms-of-service" element={<RouteWrapper Component={TermsOfService} routeName="TermsOfService" />} />
              <Route path="/warranty" element={<RouteWrapper Component={Warranty} routeName="Warranty" />} />
              <Route path="/order-confirmation" element={<RouteWrapper Component={OrderConfirmation} routeName="OrderConfirmation" />} />
              <Route path="/payment" element={<RouteWrapper Component={Payment} routeName="Payment" />} />
              <Route path="/payment-success" element={<RouteWrapper Component={PaymentSuccess} routeName="PaymentSuccess" />} />
              <Route path="/payment-failed" element={<RouteWrapper Component={PaymentFailed} routeName="PaymentFailed" />} />
              <Route path="/test-navigation" element={<RouteWrapper Component={TestNavigation} routeName="TestNavigation" />} />
              {/* Catch-all route for undefined paths */}
              <Route path="*" element={
                <div style={{ padding: '40px', textAlign: 'center', fontFamily: "'Space Grotesk', Arial, sans-serif" }}>
                  <h1>Page Not Found</h1>
                  <p>The page you're looking for doesn't exist.</p>
                  <Link to="/" style={{ color: '#0D80F2', textDecoration: 'none' }}>Return to Home</Link>
                </div>
              } />
            </Routes>
          </Router>
        </OrderProvider>
      </CartProvider>
    </UserProvider>
  );
}

export default App;
