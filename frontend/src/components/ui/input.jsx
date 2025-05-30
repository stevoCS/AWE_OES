import React from 'react';
import './ui.css';

export const Input = ({ className = '', ...props }) => {
  return (
    <input 
      className={`ui-input ${className}`}
      {...props}
    />
  );
}; 