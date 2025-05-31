import React from 'react';
import { useTheme } from '../context/ThemeContext';
import Header from './Header';
import Footer from './Footer';
import './Layout.css';

const Layout = ({ children, className = '' }) => {
  const { theme, currentTheme } = useTheme();

  return (
    <div 
      className={`page-container ${className} theme-${currentTheme}`}
      style={{
        backgroundColor: theme.background,
        color: theme.textPrimary,
        minHeight: '100vh',
        transition: 'background-color 0.2s ease, color 0.2s ease'
      }}
    >
      <Header />
      <main 
        className="page-content"
        style={{
          backgroundColor: theme.background,
          color: theme.textPrimary
        }}
      >
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout; 