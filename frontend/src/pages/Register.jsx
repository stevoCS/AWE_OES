import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SearchIcon, ShoppingCartIcon } from '../components/ui/icons';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { useUser } from '../context/UserContext';
import { useCart } from '../context/CartContext';
import './Login.css'; // Reuse the login page style
import logoIcon from '../assets/Vector - 0.svg';

export const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const { register, isLoading } = useUser();
  const { getCartItemsCount } = useCart();
  const navigate = useNavigate();

  // Footer links data
  const footerLinks = [
    { title: "About Us", href: "/about-us" },
    { title: "Customer Support", href: "/customer-support" },
    { title: "Terms of Service", href: "/terms-of-service" },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    
    // Check if the password matches
    if (formData.password !== formData.confirmPassword) {
      setError('Password confirmation does not match');
      return;
    }

    // Check if the password length is at least 6 characters
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    // Check if user has items in cart before registration
    const hasCartItems = getCartItemsCount() > 0;
    
    const result = await register(formData);
    
    if (result.success) {
      // If user had items in cart, redirect to cart for checkout
      // Otherwise redirect to dashboard
      if (hasCartItems) {
        navigate('/cart?from=auth');
      } else {
        navigate('/dashboard');
      }
    } else {
      setError(result.error);
    }
  };

  const handleLoginRedirect = () => {
    // Redirect to login page
    navigate('/login');
  };

  return (
    <div className="login-container">
      <div className="login-wrapper">
        {/* Header */}
        <header className="login-header">
          <div className="header-left">
            <Link to="/" className="brand-section">
              <div className="logo-container">
                <img
                  className="logo-image"
                  alt="Vector"
                  src={logoIcon}
                />
              </div>
              <div className="brand-text">
                AWE Electronics
              </div>
            </Link>

            <nav className="nav-section">
              <Link to="/new-arrivals" className="nav-link">
                New Arrivals
              </Link>
              <Link to="/best-sellers" className="nav-link">
                Best Sellers
              </Link>
            </nav>
          </div>

          <div className="header-right">
            <div className="search-container">
              <div className="search-wrapper">
                <div className="search-icon-container">
                  <SearchIcon className="ui-icon" style={{ width: '20px', height: '20px', color: '#607589' }} />
                </div>
                <input
                  className="search-input"
                  placeholder="Search"
                  type="text"
                />
              </div>
            </div>

            <Button variant="ghost">
              <ShoppingCartIcon style={{ width: '17px', height: '17px', color: '#111416' }} />
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <main className="login-main">
          <Card className="login-card">
            <CardContent className="login-card-content">
              <h1 className="login-title">
                Create your account
              </h1>

              <form className="login-form" onSubmit={handleRegister}>
                {error && (
                  <div style={{ 
                    color: '#dc2626', 
                    fontSize: '14px', 
                    marginBottom: '16px',
                    textAlign: 'center',
                    padding: '8px',
                    backgroundColor: '#fef2f2',
                    borderRadius: '4px',
                    border: '1px solid #fecaca'
                  }}>
                    {error}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
                  <div className="form-field" style={{ flex: 1 }}>
                    <input
                      className="form-input"
                      placeholder="First Name"
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="form-field" style={{ flex: 1 }}>
                    <input
                      className="form-input"
                      placeholder="Last Name"
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="form-field">
                  <input
                    className="form-input"
                    placeholder="Email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="form-field">
                  <input
                    type="password"
                    className="form-input"
                    placeholder="Password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="form-field">
                  <input
                    type="password"
                    className="form-input"
                    placeholder="Confirm Password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="form-field">
                  <button type="submit" className="form-button" disabled={isLoading}>
                    {isLoading ? 'Creating Account...' : 'Create Account'}
                  </button>
                </div>

                <div className="form-divider">
                  <p className="divider-text">
                    Already have an account?
                  </p>
                </div>

                <div className="form-field">
                  <button type="button" className="form-button" onClick={handleLoginRedirect} disabled={isLoading}>
                    Log In
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>
        </main>

        {/* Footer */}
        <footer className="login-footer">
          <div className="footer-content">
            <div className="footer-inner">
              <div className="footer-links">
                {footerLinks.map((link, index) => (
                  <div key={index} className="footer-link-item">
                    <Link to={link.href} className="footer-link-text">
                      {link.title}
                    </Link>
                  </div>
                ))}
              </div>

              <div className="footer-copyright-container">
                <div className="footer-copyright">
                  © 2025 AWE Electronics. All rights reserved.
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Register; 