import React from 'react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = ({ style = {} }) => {
  const { currentTheme, toggleTheme, theme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      style={{
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        border: `1px solid ${theme.border}`,
        backgroundColor: theme.background,
        color: theme.textPrimary,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '18px',
        transition: 'all 0.2s ease',
        boxShadow: theme.shadowLight,
        ...style
      }}
      onMouseEnter={(e) => {
        e.target.style.backgroundColor = theme.backgroundTertiary;
        e.target.style.transform = 'scale(1.05)';
      }}
      onMouseLeave={(e) => {
        e.target.style.backgroundColor = theme.background;
        e.target.style.transform = 'scale(1)';
      }}
      title={`Switch to ${currentTheme === 'light' ? 'dark' : 'light'} mode`}
    >
      {currentTheme === 'light' ? '🌙' : '☀️'}
    </button>
  );
};

export default ThemeToggle; 