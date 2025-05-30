import React from 'react';
import './ui.css';

export const Card = ({ children, className = '', ...props }) => {
  return (
    <div 
      className={`ui-card ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardContent = ({ children, className = '', ...props }) => {
  return (
    <div 
      className={`ui-card-content ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}; 