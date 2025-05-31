import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const Footer = () => {
  const { theme } = useTheme();

  return (
    <footer 
      className="home-footer"
      style={{
        backgroundColor: theme.background,
        borderTop: `1px solid ${theme.border}`,
        color: theme.textTertiary
      }}
    >
      <div className="footer-links">
        <Link 
          to="/about-us" 
          className="footer-link-item"
          style={{ 
            color: theme.textSecondary,
            textDecoration: 'none'
          }}
          onMouseEnter={(e) => e.target.style.color = theme.primary}
          onMouseLeave={(e) => e.target.style.color = theme.textSecondary}
        >
          About Us
        </Link>
        <Link 
          to="/customer-support" 
          className="footer-link-item"
          style={{ 
            color: theme.textSecondary,
            textDecoration: 'none'
          }}
          onMouseEnter={(e) => e.target.style.color = theme.primary}
          onMouseLeave={(e) => e.target.style.color = theme.textSecondary}
        >
          Customer Support
        </Link>
        <Link 
          to="/terms-of-service" 
          className="footer-link-item"
          style={{ 
            color: theme.textSecondary,
            textDecoration: 'none'
          }}
          onMouseEnter={(e) => e.target.style.color = theme.primary}
          onMouseLeave={(e) => e.target.style.color = theme.textSecondary}
        >
          Terms of Service
        </Link>
      </div>
      <div 
        className="footer-copyright"
        style={{ color: theme.textTertiary }}
      >
        © 2025 AWE Electronics. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer; 