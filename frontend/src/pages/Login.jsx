import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import Layout from '../components/Layout';
import { useUser } from '../context/UserContext';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import logoIcon from '../assets/Vector - 0.svg';
import './Login.css';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login: userLogin } = useUser();
  const { login: authLogin } = useAuth();
  const { getCartItemsCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // 首先尝试admin登录
      const authResult = await authLogin({ email, password });
      
      if (authResult.success) {
        // 如果是admin用户，重定向到admin dashboard
        if (authResult.user.is_admin) {
          navigate('/admin');
          return;
        }
      }

      // 如果不是admin或admin登录失败，尝试普通用户登录
      const hasCartItems = getCartItemsCount() > 0;
      const userResult = await userLogin(email, password);
      
      if (userResult.success) {
        // 检查是否有重定向参数
        const from = location.state?.from?.pathname || (hasCartItems ? '/cart?from=auth' : '/dashboard');
        navigate(from);
      } else {
        setError(userResult.error || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = () => {
    // Jump to the registration page.
    navigate('/register');
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
          <CardContent className="login-card-content">
            <h1 className="login-title" style={{
              color: theme.textPrimary
            }}>
              Log in or create an account
            </h1>

            <form className="login-form" onSubmit={handleLogin}>
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
                  style={{
                    backgroundColor: theme.inputBg,
                    color: theme.textPrimary,
                    border: `1px solid ${theme.border}`,
                    transition: 'border-color 0.2s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor = theme.primary}
                  onBlur={(e) => e.target.style.borderColor = theme.border}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                  {isLoading ? 'Logging in...' : 'Log In'}
                </button>
              </div>

              <div className="form-divider">
                <p className="divider-text" style={{
                  color: theme.textSecondary
                }}>
                  Or Registration
                </p>
              </div>

              <div className="form-field">
                <button 
                  type="button" 
                  className="form-button"
                  style={{
                    backgroundColor: theme.primary,
                    color: 'white',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = theme.primaryHover}
                  onMouseLeave={(e) => e.target.style.backgroundColor = theme.primary}
                  onClick={handleSignUp} 
                  disabled={isLoading}
                >
                  Sign up
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Login; 