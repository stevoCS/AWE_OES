import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from './ThemeToggle';
import logoIcon from '../assets/Vector - 0.svg';
import searchIcon from '../assets/Vector - search.svg';
import cartIcon from '../assets/Vector - cart.svg';

const Header = () => {
  const { user, isLoggedIn } = useUser();
  const { getCartItemsCount } = useCart();
  const { theme } = useTheme();
  const location = useLocation();

  // Check if current page is login or register page
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <header 
      className="home-header"
      style={{
        backgroundColor: theme.headerBg,
        borderBottom: `1px solid ${theme.headerBorder}`,
        color: theme.textPrimary
      }}
    >
      <div className="header-left">
        <Link to="/" className="brand-link" style={{ color: theme.textPrimary }}>
          <img src={logoIcon} alt="AWE Electronics Logo" className="logo-icon" />
          <span 
            className="brand-title"
            style={{ color: theme.textPrimary }}
          >
            AWE Electronics
          </span>
        </Link>
        <nav className="sub-titles">
          <Link 
            to="/#new-arrivals" 
            className="sub-title" 
            style={{ color: theme.textSecondary }}
            onMouseEnter={(e) => e.target.style.color = theme.primary}
            onMouseLeave={(e) => e.target.style.color = theme.textSecondary}
            onClick={(e) => {
              if (window.location.pathname === '/') {
                e.preventDefault();
                document.getElementById('new-arrivals')?.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          >
            New Arrivals
          </Link>
          <Link 
            to="/#best-sellers" 
            className="sub-title"
            style={{ color: theme.textSecondary }}
            onMouseEnter={(e) => e.target.style.color = theme.primary}
            onMouseLeave={(e) => e.target.style.color = theme.textSecondary}
            onClick={(e) => {
              if (window.location.pathname === '/') {
                e.preventDefault();
                document.getElementById('best-sellers')?.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          >
            Best Sellers
          </Link>
        </nav>
      </div>
      <div className="header-right">
        <div 
          className="search-bar"
          style={{
            backgroundColor: theme.inputBg,
            border: `1px solid ${theme.border}`,
            borderRadius: '8px'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = theme.backgroundTertiary}
          onMouseLeave={(e) => e.target.style.backgroundColor = theme.inputBg}
        >
          <img src={searchIcon} alt="search" className="search-icon-internal" />
          <input 
            type="text" 
            placeholder="Search" 
            style={{
              backgroundColor: 'transparent',
              color: theme.textPrimary,
              border: 'none',
              outline: 'none'
            }}
          />
        </div>
        
        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Only show login/user info if not on auth pages */}
        {!isAuthPage && (
          <>
            {isLoggedIn ? (
              <Link 
                to="/dashboard" 
                className="login-btn" 
                style={{ 
                  minWidth: 'auto', 
                  width: 'auto',
                  paddingLeft: '12px',
                  paddingRight: '12px',
                  color: theme.textSecondary,
                  backgroundColor: 'transparent',
                  borderRadius: '8px'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = theme.backgroundTertiary;
                  e.target.style.color = theme.textPrimary;
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = theme.textSecondary;
                }}
              >
                Welcome, {user.firstName}
              </Link>
            ) : (
              <Link 
                to="/login" 
                className="login-btn"
                style={{
                  color: theme.textSecondary,
                  backgroundColor: 'transparent',
                  borderRadius: '8px'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = theme.backgroundTertiary;
                  e.target.style.color = theme.textPrimary;
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = theme.textSecondary;
                }}
              >
                Log in
              </Link>
            )}
          </>
        )}
        <Link 
          to="/cart" 
          className="cart-btn" 
          style={{ 
            position: 'relative',
            backgroundColor: 'transparent',
            borderRadius: '8px',
            border: 'none'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = theme.backgroundTertiary}
          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
        >
          <img src={cartIcon} alt="cart" className="cart-icon" />
          {getCartItemsCount() > 0 && (
            <span style={{
              position: 'absolute',
              top: '-6px',
              right: '-6px',
              backgroundColor: theme.error,
              color: 'white',
              borderRadius: '50%',
              width: '18px',
              height: '18px',
              fontSize: '11px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '600'
            }}>
              {getCartItemsCount()}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
};

export default Header; 