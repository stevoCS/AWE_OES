import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SearchIcon, ShoppingCartIcon } from '../components/ui/icons';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { useUser } from '../context/UserContext';
import './Login.css';
import logoIcon from '../assets/Vector - 0.svg';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isLoading } = useUser();
  const navigate = useNavigate();

  // Footer links data
  const footerLinks = [
    { title: "About Us", href: "/about-us" },
    { title: "Customer Support", href: "/customer-support" },
    { title: "Terms of Service", href: "/terms-of-service" },
  ];

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    const result = await login(email, password);
    
    if (result.success) {
      // Login successful, redirecting to user dashboard.
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
  };

  const handleSignUp = () => {
    // Jump to the registration page.
    navigate('/register');
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
                Log in or create an account
              </h1>

              <form className="login-form" onSubmit={handleLogin}>
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
                
                <div className="form-field">
                  <input
                    className="form-input"
                    placeholder="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="form-field">
                  <input
                    type="password"
                    className="form-input"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="form-field">
                  <button type="submit" className="form-button" disabled={isLoading}>
                    {isLoading ? 'Logging in...' : 'Log In'}
                  </button>
                </div>

                <div className="form-divider">
                  <p className="divider-text">
                    Or Registration
                  </p>
                </div>

                <div className="form-field">
                  <button type="button" className="form-button" onClick={handleSignUp} disabled={isLoading}>
                    Sign up
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

export default Login; 