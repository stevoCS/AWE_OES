import React from 'react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = ({ style = {} }) => {
  const { currentTheme, toggleTheme, theme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      style={{
        width: '40px',
        height: '20px',
        borderRadius: '10px',
        border: 'none',
        backgroundColor: currentTheme === 'light' ? '#d1d5db' : '#4b5563',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        padding: '2px',
        transition: 'all 0.2s ease',
        position: 'relative',
        outline: 'none',
        ...style
      }}
      onMouseEnter={(e) => {
        e.target.style.backgroundColor = currentTheme === 'light' ? '#9ca3af' : '#6b7280';
      }}
      onMouseLeave={(e) => {
        e.target.style.backgroundColor = currentTheme === 'light' ? '#d1d5db' : '#4b5563';
      }}
      title={`Switch to ${currentTheme === 'light' ? 'dark' : 'light'} mode`}
    >
      {/* Toggle Circle */}
      <div
        style={{
          width: '16px',
          height: '16px',
          borderRadius: '50%',
          backgroundColor: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '8px',
          transition: 'transform 0.2s ease',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
          transform: currentTheme === 'light' ? 'translateX(0px)' : 'translateX(18px)',
          position: 'absolute',
          left: '2px'
        }}
      >
        {currentTheme === 'light' ? '☀️' : '🌙'}
      </div>
    </button>
  );
};

export default ThemeToggle; 