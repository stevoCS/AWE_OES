import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import Layout from '../components/Layout';
import { useUser } from '../context/UserContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { DebugLogger } from '../utils/debug';
import './Login.css'; // Reuse the login page style

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
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  // Add debug logging
  React.useEffect(() => {
    DebugLogger.log('Register component mounted', { 
      pathname: location.pathname,
      cartItems: getCartItemsCount()
    });
  }, [location.pathname, getCartItemsCount]);

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
    
    DebugLogger.userAction('Register form submitted', {
      email: formData.email,
      firstName: formData.firstName,
      lastName: formData.lastName
    });
    
    // Check if the password matches
    if (formData.password !== formData.confirmPassword) {
      setError('Password confirmation does not match');
      DebugLogger.error('Password mismatch');
      return;
    }

    // Check if the password length is at least 6 characters
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      DebugLogger.error('Password too short');
      return;
    }

    // Check if user has items in cart before registration
    const hasCartItems = getCartItemsCount() > 0;
    DebugLogger.log('Pre-registration check', { hasCartItems, cartCount: getCartItemsCount() });
    
    try {
      DebugLogger.log('Calling register API...');
      const result = await register(formData);
      
      DebugLogger.log('Register API result', { 
        success: result.success, 
        error: result.error,
        user: result.user?.email 
      });
      
      if (result.success) {
        DebugLogger.success('Registration successful', { 
          userId: result.user?.id,
          email: result.user?.email 
        });
        
        // Determine navigation target
        const targetPath = hasCartItems ? '/cart?from=auth' : '/dashboard';
        DebugLogger.navigation(location.pathname, targetPath, 'post-registration');
        
        // Navigate
        DebugLogger.log('Calling navigate function', { targetPath });
        navigate(targetPath);
        
        // Additional debug - check if navigation actually happened
        setTimeout(() => {
          DebugLogger.log('Post-navigation check', { 
            currentPath: window.location.pathname,
            expectedPath: targetPath.split('?')[0]
          });
        }, 100);
        
      } else {
        DebugLogger.error('Registration failed', result.error);
        setError(result.error);
      }
    } catch (error) {
      DebugLogger.error('Registration exception', error);
      setError(error.message || 'Registration failed');
    }
  };

  const handleLoginRedirect = () => {
    DebugLogger.navigation(location.pathname, '/login', 'login-redirect');
    navigate('/login');
  };

  return (
    <Layout>
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 'calc(100vh - 200px)', // Subtract header + footer height
        padding: '40px 20px',
        fontFamily: "'Space Grotesk', Arial, sans-serif",
        backgroundColor: theme.background
      }}>
        <Card className="login-card" style={{
          backgroundColor: theme.cardBg,
          border: `1px solid ${theme.border}`,
          boxShadow: theme.shadowLight
        }}>
          <CardContent className="login-card-content" style={{ alignItems: 'flex-start' }}>
            <h1 className="login-title" style={{ 
              textAlign: 'left',
              paddingLeft: '16px', // Align with form-input.
              color: theme.textPrimary
            }}>
              Sign up for an account
            </h1>

            <form className="login-form" onSubmit={handleRegister}>
              {error && (
                <div style={{ 
                  color: theme.error, 
                  fontSize: '14px', 
                  marginBottom: '16px',
                  textAlign: 'center',
                  padding: '8px',
                  backgroundColor: theme.error + '20',
                  borderRadius: '4px',
                  border: `1px solid ${theme.error}50`
                }}>
                  {error}
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
                <div className="form-field" style={{ flex: 1 }}>
                  <input
                    className="form-input"
                    style={{
                      backgroundColor: theme.inputBg,
                      color: theme.textPrimary,
                      border: `1px solid ${theme.border}`,
                      transition: 'border-color 0.2s ease'
                    }}
                    onFocus={(e) => e.target.style.borderColor = theme.primary}
                    onBlur={(e) => e.target.style.borderColor = theme.border}
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
                    style={{
                      backgroundColor: theme.inputBg,
                      color: theme.textPrimary,
                      border: `1px solid ${theme.border}`,
                      transition: 'border-color 0.2s ease'
                    }}
                    onFocus={(e) => e.target.style.borderColor = theme.primary}
                    onBlur={(e) => e.target.style.borderColor = theme.border}
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
                  style={{
                    backgroundColor: theme.inputBg,
                    color: theme.textPrimary,
                    border: `1px solid ${theme.border}`,
                    transition: 'border-color 0.2s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor = theme.primary}
                  onBlur={(e) => e.target.style.borderColor = theme.border}
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
                  style={{
                    backgroundColor: theme.inputBg,
                    color: theme.textPrimary,
                    border: `1px solid ${theme.border}`,
                    transition: 'border-color 0.2s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor = theme.primary}
                  onBlur={(e) => e.target.style.borderColor = theme.border}
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
                  style={{
                    backgroundColor: theme.inputBg,
                    color: theme.textPrimary,
                    border: `1px solid ${theme.border}`,
                    transition: 'border-color 0.2s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor = theme.primary}
                  onBlur={(e) => e.target.style.borderColor = theme.border}
                  placeholder="Confirm Password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="form-field">
                <button 
                  type="submit" 
                  className="form-button"
                  style={{
                    backgroundColor: theme.primary,
                    color: 'white',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = theme.primaryHover}
                  onMouseLeave={(e) => e.target.style.backgroundColor = theme.primary}
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </button>
              </div>

              <div className="form-divider">
                <p className="divider-text" style={{
                  color: theme.textSecondary
                }}>
                  Already have an account?
                </p>
              </div>

              <div className="form-field">
                <button 
                  type="button" 
                  className="form-button"
                  style={{
                    backgroundColor: 'transparent',
                    color: theme.primary,
                    border: `1px solid ${theme.primary}`,
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = theme.primary;
                    e.target.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.color = theme.primary;
                  }}
                  onClick={handleLoginRedirect} 
                  disabled={isLoading}
                >
                  Log In 
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Register; 