import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';
import Layout from '../components/Layout';
import './Login.css'; // Reuse the style of the login page.

export const Account = () => {
  const { user, logout, updateUser, isLoggedIn } = useUser();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [editData, setEditData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    contactNumber: user?.contactNumber || '',
    shippingAddress: user?.shippingAddress || '',
    personalPreference: user?.personalPreference || ''
  });
  const [message, setMessage] = useState('');

  // If the user is not logged in, redirect to the login page.
  React.useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
    }
  }, [isLoggedIn, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    updateUser(editData);
    setMessage('Personal information has been updated');
    setTimeout(() => {
      setMessage('');
      // Navigate back to user dashboard after successful save
      navigate('/dashboard');
    }, 1500); // Show success message for 1.5 seconds before navigating
  };

  if (!user) return null;

  return (
    <Layout>
      <div style={{
        backgroundColor: theme.background,
        minHeight: '100vh',
        fontFamily: "'Space Grotesk', Arial, sans-serif"
      }}>
        {/* Breadcrumb */}
        <div style={{
          padding: '20px 40px',
          fontSize: '14px',
          color: theme.textSecondary,
          backgroundColor: theme.cardBg,
          borderBottom: `1px solid ${theme.border}`
        }}>
          <Link to="/" style={{ color: theme.textSecondary, textDecoration: 'none' }}>Home</Link>
          <span style={{ margin: '0 8px' }}>/</span>
          <Link to="/dashboard" style={{ color: theme.textSecondary, textDecoration: 'none' }}>Dashboard</Link>
          <span style={{ margin: '0 8px' }}>/</span>
          <span style={{ color: theme.textPrimary }}>Account Settings</span>
        </div>

        {/* Main Content */}
        <main style={{
          display: 'flex',
          justifyContent: 'center',
          padding: '40px 20px',
          minHeight: 'calc(100vh - 200px)'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '800px',
            backgroundColor: theme.cardBg,
            borderRadius: '12px',
            padding: '40px',
            position: 'relative',
            boxShadow: theme.shadowLight,
            border: `1px solid ${theme.border}`
          }}>
            {/* Account Management Title */}
            <h1 style={{
              fontSize: '32px',
              fontWeight: '700',
              color: theme.textPrimary,
              marginBottom: '8px',
              textAlign: 'center'
            }}>
              Account Settings
            </h1>

            <p style={{
              fontSize: '16px',
              color: theme.textSecondary,
              textAlign: 'center',
              marginBottom: '32px'
            }}>
              Manage your personal information and preferences
            </p>

            {/* Success Message */}
            {message && (
              <div style={{
                backgroundColor: theme.success + '20',
                border: `1px solid ${theme.success}`,
                borderRadius: '8px',
                padding: '12px 16px',
                marginBottom: '24px',
                color: theme.success,
                fontSize: '14px',
                textAlign: 'center'
              }}>
                {message}
              </div>
            )}

            {/* Account Form */}
            <form onSubmit={handleSave}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '24px',
                marginBottom: '24px'
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: theme.textPrimary,
                    marginBottom: '8px'
                  }}>
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={editData.firstName}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: `1px solid ${theme.border}`,
                      borderRadius: '8px',
                      fontSize: '16px',
                      boxSizing: 'border-box',
                      backgroundColor: theme.cardBg,
                      color: theme.textPrimary,
                      outline: 'none',
                      transition: 'border-color 0.2s ease'
                    }}
                    onFocus={(e) => e.target.style.borderColor = theme.primary}
                    onBlur={(e) => e.target.style.borderColor = theme.border}
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: theme.textPrimary,
                    marginBottom: '8px'
                  }}>
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={editData.lastName}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: `1px solid ${theme.border}`,
                      borderRadius: '8px',
                      fontSize: '16px',
                      boxSizing: 'border-box',
                      backgroundColor: theme.cardBg,
                      color: theme.textPrimary,
                      outline: 'none',
                      transition: 'border-color 0.2s ease'
                    }}
                    onFocus={(e) => e.target.style.borderColor = theme.primary}
                    onBlur={(e) => e.target.style.borderColor = theme.border}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: theme.textPrimary,
                  marginBottom: '8px'
                }}>
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={editData.email}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: `1px solid ${theme.border}`,
                    borderRadius: '8px',
                    fontSize: '16px',
                    boxSizing: 'border-box',
                    backgroundColor: theme.cardBg,
                    color: theme.textPrimary,
                    outline: 'none',
                    transition: 'border-color 0.2s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor = theme.primary}
                  onBlur={(e) => e.target.style.borderColor = theme.border}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: theme.textPrimary,
                  marginBottom: '8px'
                }}>
                  Contact Number
                </label>
                <input
                  type="tel"
                  name="contactNumber"
                  value={editData.contactNumber}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: `1px solid ${theme.border}`,
                    borderRadius: '8px',
                    fontSize: '16px',
                    boxSizing: 'border-box',
                    backgroundColor: theme.cardBg,
                    color: theme.textPrimary,
                    outline: 'none',
                    transition: 'border-color 0.2s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor = theme.primary}
                  onBlur={(e) => e.target.style.borderColor = theme.border}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: theme.textPrimary,
                  marginBottom: '8px'
                }}>
                  Shipping Address
                </label>
                <textarea
                  name="shippingAddress"
                  value={editData.shippingAddress}
                  onChange={handleInputChange}
                  rows="3"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: `1px solid ${theme.border}`,
                    borderRadius: '8px',
                    fontSize: '16px',
                    boxSizing: 'border-box',
                    backgroundColor: theme.cardBg,
                    color: theme.textPrimary,
                    resize: 'vertical',
                    outline: 'none',
                    transition: 'border-color 0.2s ease',
                    fontFamily: "'Space Grotesk', Arial, sans-serif"
                  }}
                  onFocus={(e) => e.target.style.borderColor = theme.primary}
                  onBlur={(e) => e.target.style.borderColor = theme.border}
                />
              </div>

              <div style={{ marginBottom: '32px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: theme.textPrimary,
                  marginBottom: '8px'
                }}>
                  Personal Preferences
                </label>
                <textarea
                  name="personalPreference"
                  value={editData.personalPreference}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Tell us about your preferences..."
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: `1px solid ${theme.border}`,
                    borderRadius: '8px',
                    fontSize: '16px',
                    boxSizing: 'border-box',
                    backgroundColor: theme.cardBg,
                    color: theme.textPrimary,
                    resize: 'vertical',
                    outline: 'none',
                    transition: 'border-color 0.2s ease',
                    fontFamily: "'Space Grotesk', Arial, sans-serif"
                  }}
                  onFocus={(e) => e.target.style.borderColor = theme.primary}
                  onBlur={(e) => e.target.style.borderColor = theme.border}
                />
              </div>

              {/* Action Buttons */}
              <div style={{
                display: 'flex',
                gap: '16px',
                justifyContent: 'center'
              }}>
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: theme.cardBg,
                    color: theme.textSecondary,
                    border: `1px solid ${theme.border}`,
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = theme.backgroundSecondary;
                    e.target.style.borderColor = theme.primary;
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = theme.cardBg;
                    e.target.style.borderColor = theme.border;
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '12px 24px',
                    backgroundColor: theme.primary,
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = theme.primaryHover}
                  onMouseLeave={(e) => e.target.style.backgroundColor = theme.primary}
                >
                  Save Changes
                </button>
              </div>
            </form>

            {/* Account Actions */}
            <div style={{
              marginTop: '40px',
              paddingTop: '32px',
              borderTop: `1px solid ${theme.border}`
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: theme.textPrimary,
                marginBottom: '16px'
              }}>
                Account Actions
              </h3>
              
              <div style={{
                display: 'flex',
                gap: '16px',
                justifyContent: 'center'
              }}>
                <Link
                  to="/dashboard"
                  style={{
                    padding: '12px 24px',
                    backgroundColor: theme.cardBg,
                    color: theme.primary,
                    textDecoration: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '500',
                    border: `1px solid ${theme.primary}`,
                    transition: 'all 0.2s'
                  }}
                >
                  Back to Dashboard
                </Link>
                <button
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: theme.error,
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </Layout>
  );
};

export default Account; 