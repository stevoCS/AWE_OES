import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
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
import AdminDashboard from './pages/AdminDashboard';
import AdminProductManagement from './pages/AdminProductManagement';
import AdminOrderManagement from './pages/AdminOrderManagement';
import AdminCustomerManagement from './pages/AdminCustomerManagement';
import AdminSettings from './pages/AdminSettings';
import { CartProvider } from './context/CartContext';
import { UserProvider } from './context/UserContext';
import { OrderProvider } from './context/OrderContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import KeepAlive from './components/KeepAlive';
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

function App() {
  console.log('App component is rendering...');
  
  return (
    <ThemeProvider>
      <AuthProvider>
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
                  {/* KeepAlive组件防止Render服务休眠 */}
                  <KeepAlive />
                  
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/product" element={<Product />} />
                    <Route path="/product/:id" element={<ProductDetail />} />
                    <Route path="/new-arrivals" element={<NewArrivals />} />
                    <Route path="/best-sellers" element={<BestSellers />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/dashboard" element={<UserDashboard />} />
                    <Route path="/profile" element={<UserProfile />} />
                    <Route path="/account" element={<Account />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/about-us" element={<AboutUs />} />
                    <Route path="/customer-support" element={<CustomerSupport />} />
                    <Route path="/terms-of-service" element={<TermsOfService />} />
                    <Route path="/warranty" element={<Warranty />} />
                    <Route path="/order-confirmation" element={<OrderConfirmation />} />
                    <Route path="/order-tracking" element={<OrderTracking />} />
                    <Route path="/order-detail/:orderId" element={<OrderDetail />} />
                    <Route path="/order/:orderNumber" element={<OrderTracking />} />
                    <Route path="/payment" element={<Payment />} />
                    <Route path="/payment-success" element={<PaymentSuccess />} />
                    <Route path="/payment-failed" element={<PaymentFailed />} />
                    
                    {/* Admin Routes */}
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/admin/orders" element={<AdminOrderManagement />} />
                    <Route path="/admin/products" element={<AdminProductManagement />} />
                    <Route path="/admin/customers" element={<AdminCustomerManagement />} />
                    <Route path="/admin/settings" element={<AdminSettings />} />
                    
                    {/* Catch-all route for undefined paths */}
                    <Route path="*" element={
                      <div style={{ padding: '40px', textAlign: 'center', fontFamily: "'Space Grotesk', Arial, sans-serif" }}>
                        <h1>Page Not Found</h1>
                        <p>The page you're looking for doesn't exist.</p>
                        <Link to="/" style={{ color: '#0D80F2', textDecoration: 'none' }}>Return to Home</Link>
                      </div>
                    } />
                  </Routes>
                </div>
              </Router>
            </OrderProvider>
          </CartProvider>
        </UserProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
