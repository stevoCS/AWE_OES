import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import './AdminLayout.css';

// import icons
import logoIcon from '../assets/Vector - 0.svg';
import dashboardIcon from '../assets/dashboard.svg';
import ordersIcon from '../assets/orders.svg';
import productsIcon from '../assets/db product.svg';
import customersIcon from '../assets/costomers.svg';
import settingsIcon from '../assets/settings.svg';

const AdminLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useUser();
  
  // Token status management
  const [tokenStatus, setTokenStatus] = useState({
    isValid: true,
    timeRemaining: 0,
    expiryTime: null
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  // calculate token remaining time
  useEffect(() => {
    const calculateTokenTime = () => {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      
      if (!token) {
        setTokenStatus({ isValid: false, timeRemaining: 0, expiryTime: null });
        return;
      }

      try {
        // parse JWT token to get expiry time
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expiryTime = payload.exp * 1000; // convert to milliseconds
        const currentTime = Date.now();
        const timeRemaining = Math.max(0, expiryTime - currentTime);
        
        setTokenStatus({
          isValid: timeRemaining > 0,
          timeRemaining,
          expiryTime
        });

        //  token expire warning
        if (timeRemaining <= 5 * 60 * 1000 && timeRemaining > 4 * 60 * 1000) {
          console.warn('Please save your work and refresh the page to get a new token.');
        }
        if (timeRemaining <= 2 * 60 * 1000 && timeRemaining > 1.5 * 60 * 1000 && !isRefreshing) {
          console.warn(' Attempting to refresh automatically...');
          refreshToken();
        }
        if (timeRemaining <= 1 * 60 * 1000 && timeRemaining > 0) {
          console.warn('Please refresh the page immediately.');
        }
        if (timeRemaining <= 0) {
          console.error('Please refresh the page and login again.');
        }
      } catch (error) {
        console.error('Error parsing token:', error);
        setTokenStatus({ isValid: false, timeRemaining: 0, expiryTime: null });
      }
    };

    // initial calculation
    calculateTokenTime();
    
    // update every second
    const interval = setInterval(calculateTokenTime, 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Auto refresh token on page load/refresh if needed
  useEffect(() => {
    const autoRefreshOnLoad = async () => {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      
      if (!token) return;

      try {
        // parse JWT token to get expiry time
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expiryTime = payload.exp * 1000;
        const currentTime = Date.now();
        const timeRemaining = expiryTime - currentTime;
        
        // If token expires in less than 15 minutes, refresh it
        if (timeRemaining > 0 && timeRemaining <= 15 * 60 * 1000) {
          console.log('Token expires soon, auto-refreshing on page load...');
          const success = await refreshToken();
          if (success) {
            console.log('Token successfully refreshed on page load');
          } else {
            console.warn('Failed to refresh token on page load');
          }
        }
      } catch (error) {
        console.error('Error checking token on page load:', error);
      }
    };

    // Run auto refresh on component mount (page load/refresh)
    autoRefreshOnLoad();
  }, []); // Empty dependency array ensures this runs only once on mount

  // format remaining time
  const formatTimeRemaining = (ms) => {
    if (ms <= 0) return 'Expired';
    
    const minutes = Math.floor(ms / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    
    if (minutes === 0) {
      return `${seconds}s`;
    }
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // get status color
  const getStatusColor = () => {
    if (!tokenStatus.isValid) return '#ef4444'; // red - expired
    if (tokenStatus.timeRemaining <= 5 * 60 * 1000) return '#f59e0b'; // orange - 5 minutes
    if (tokenStatus.timeRemaining <= 10 * 60 * 1000) return '#eab308'; // yellow - 10 minutes
    return '#22c55e'; // green - normal
  };

  // get status text
  const getStatusText = () => {
    if (!tokenStatus.isValid) return 'Session expired';
    if (tokenStatus.timeRemaining <= 5 * 60 * 1000) return 'Session expiring soon';
    if (tokenStatus.timeRemaining <= 10 * 60 * 1000) return 'Session expires in 10 min';
    return 'Session active';
  };

    // navigation menu items
  const navItems = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      path: '/admin',
      icon: dashboardIcon
    },
    {
      id: 'orders',
      name: 'Orders',
      path: '/admin/orders',
      icon: ordersIcon
    },
    {
      id: 'products',
      name: 'Products',
      path: '/admin/products',
      icon: productsIcon
    },
    {
      id: 'customers',
      name: 'Customers',
      path: '/admin/customers',
      icon: customersIcon
    },
    {
      id: 'settings',
      name: 'Settings',
      path: '/admin/settings',
      icon: settingsIcon
    }
  ];

  const handleLogout = () => {
    if (logout) {
      logout();
    } else {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
    }
    navigate('/login');
  };

  // refresh token function
  const refreshToken = async () => {
    const refreshTokenValue = localStorage.getItem('refresh_token');
    
    if (!refreshTokenValue) {
      console.error('No refresh token available');
      return false;
    }

    try {
      setIsRefreshing(true);
      
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
      const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refresh_token: refreshTokenValue
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        // update access_token in localStorage
        localStorage.setItem('access_token', data.data.access_token);
        console.log('Token refreshed successfully');
        return true;
      } else {
        throw new Error(data.message || 'Token refresh failed');
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="admin-layout">
      {/* Header */}
      <header className="admin-header">
        <div className="admin-header-left">
          <div className="admin-brand">
            <img src={logoIcon} alt="Logo" className="admin-logo-icon" />
            <span className="admin-brand-text">AWE Electronics</span>
          </div>
        </div>
        <div className="admin-header-right">
          <div className="admin-token-status">
            <div 
              className="admin-token-indicator"
              style={{ backgroundColor: getStatusColor() }}
              title={getStatusText()}
            ></div>
            <span className="admin-token-time">
              {formatTimeRemaining(tokenStatus.timeRemaining)}
            </span>
          </div>
          <span className="admin-header-title">Admin Dashboard</span>
          <button 
            className="admin-logout-btn"
            onClick={handleLogout}
            title="Logout"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="admin-main-container">
        {/* Sidebar */}
        <aside className="admin-sidebar">
          <div className="admin-sidebar-header">
            <h2 className="admin-sidebar-title">Store Admin</h2>
          </div>
          
          <nav className="admin-sidebar-nav">
            {navItems.map((item) => (
              <Link
                key={item.id}
                to={item.path}
                className={`admin-nav-item ${
                  location.pathname === item.path || 
                  (item.path === '/admin' && location.pathname === '/admin/dashboard') 
                    ? 'active' 
                    : ''
                }`}
              >
                <span className="admin-nav-icon">
                  <img src={item.icon} alt={item.name} className="admin-nav-icon-svg" />
                </span>
                <span className="admin-nav-text">{item.name}</span>
              </Link>
            ))}
          </nav>

          <div className="admin-sidebar-footer">
            <Link 
              to="/" 
              className="admin-nav-item view-store"
            >
              <span className="admin-nav-icon">🏪</span>
              <span className="admin-nav-text">View Store</span>
            </Link>
          </div>
        </aside>

        {/* Main Content */}
        <main className="admin-content">
          {children}
        </main>
      </div>

      {/* Footer */}
      <footer className="admin-footer">
        <div className="admin-footer-content">
          <div className="admin-footer-links">
            <Link to="/about-us" className="admin-footer-link">About Us</Link>
            <Link to="/customer-support" className="admin-footer-link">Customer Support</Link>
            <Link to="/terms-of-service" className="admin-footer-link">Terms of Service</Link>
          </div>
          <div className="admin-footer-copyright">
            © 2025 AWE Electronics. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AdminLayout; 