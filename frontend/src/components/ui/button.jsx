import React from 'react';
import './ui.css';

export const Button = ({ children, variant = 'default', className = '', ...props }) => {
  const baseClass = 'ui-button';
  const variantClass = `ui-button--${variant}`;
  
  return (
    <button 
      className={`${baseClass} ${variantClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}; 