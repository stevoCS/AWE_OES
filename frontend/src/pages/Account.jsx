import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SearchIcon, ShoppingCartIcon } from '../components/ui/icons';
import { Button } from '../components/ui/button';
import { useUser } from '../context/UserContext';
import './Login.css'; // Reuse the style of the login page.
import logoIcon from '../assets/Vector - 0.svg';

export const Account = () => {
  const { user, logout, updateUser, isLoggedIn } = useUser();
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
    <div style={{
      backgroundColor: '#f8f9fa',
      minHeight: '100vh',
      fontFamily: "'Space Grotesk', Arial, sans-serif"
    }}>
      {/* Header */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 40px',
        backgroundColor: 'white',
        borderBottom: '1px solid #e5e8eb',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '32px'
        }}>
          <Link to="/" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            textDecoration: 'none',
            color: 'inherit'
          }}>
            <img src={logoIcon} alt="AWE Electronics Logo" style={{ width: '32px', height: '32px' }} />
            <span style={{
              fontWeight: '700',
              fontSize: '18px',
              color: '#121417'
            }}>
              AWE Electronics
            </span>
          </Link>

          <nav style={{
            display: 'flex',
            alignItems: 'center',
            gap: '36px'
          }}>
            <Link to="/new-arrivals" style={{
              fontWeight: '500',
              fontSize: '14px',
              color: '#121417',
              textDecoration: 'none'
            }}>
              New Arrivals
            </Link>
            <Link to="/best-sellers" style={{
              fontWeight: '500',
              fontSize: '14px',
              color: '#121417',
              textDecoration: 'none'
            }}>
              Best Sellers
            </Link>
          </nav>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '32px',
          flex: 1,
          justifyContent: 'flex-end'
        }}>
          {/* Search Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#f0f2f5',
            borderRadius: '8px',
            minWidth: '160px',
            maxWidth: '256px'
          }}>
            <div style={{
              padding: '0 16px',
              height: '40px',
              display: 'flex',
              alignItems: 'center'
            }}>
              <SearchIcon style={{ width: '20px', height: '20px', color: '#607589' }} />
            </div>
            <input
              type="text"
              placeholder="Search"
              style={{
                border: 'none',
                backgroundColor: 'transparent',
                outline: 'none',
                padding: '8px 16px 8px 0',
                flex: 1,
                height: '40px',
                fontSize: '14px',
                color: '#607589'
              }}
            />
          </div>

          {/* Cart Button */}
          <Button variant="ghost" style={{
            padding: '8px',
            backgroundColor: '#f0f2f5',
            borderRadius: '8px'
          }}>
            <ShoppingCartIcon style={{ width: '17px', height: '17px', color: '#111416' }} />
          </Button>

          {/* User Avatar */}
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #0D80F2, #0a68c4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: '600',
            fontSize: '16px'
          }}>
            {user.firstName?.charAt(0)?.toUpperCase() || 'U'}
          </div>
        </div>
      </header>

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
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '40px',
          position: 'relative',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
        }}>
          {/* Account Management Title */}
          <h1 style={{
            fontSize: '32px',
            fontWeight: '700',
            color: '#121417',
            margin: '0 0 60px 0',
            textAlign: 'left'
          }}>
            Account Management
          </h1>

          {/* Personal Information Section */}
          <div style={{
            display: 'flex',
            gap: '60px',
            alignItems: 'flex-start'
          }}>
            {/* Left Column - Form Fields */}
            <div style={{
              flex: '1',
              maxWidth: '400px'
            }}>
              <h2 style={{
                fontSize: '22px',
                fontWeight: '700',
                color: '#121417',
                margin: '0 0 30px 0'
              }}>
                Personal Information
              </h2>

              {/* Success Message */}
              {message && (
                <div style={{ 
                  color: '#16a34a', 
                  fontSize: '14px', 
                  marginBottom: '20px',
                  padding: '12px',
                  backgroundColor: '#f0fdf4',
                  borderRadius: '8px',
                  border: '1px solid #bbf7d0'
                }}>
                  {message}
                </div>
              )}

              <form onSubmit={handleSave}>
                {/* Full Name Field */}
                <div style={{ marginBottom: '24px' }}>
                  <label style={{
                    fontSize: '16px',
                    fontWeight: '500',
                    color: '#121417',
                    display: 'block',
                    marginBottom: '8px'
                  }}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={`${editData.firstName} ${editData.lastName}`.trim()}
                    onChange={(e) => {
                      const names = e.target.value.split(' ');
                      const firstName = names[0] || '';
                      const lastName = names.slice(1).join(' ') || '';
                      setEditData(prev => ({
                        ...prev,
                        firstName,
                        lastName
                      }));
                    }}
                    placeholder="Enter your full name"
                    style={{
                      width: '100%',
                      padding: '15px',
                      border: '1px solid #DBE0E5',
                      borderRadius: '8px',
                      backgroundColor: 'white',
                      fontSize: '16px',
                      outline: 'none',
                      boxSizing: 'border-box',
                      transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#0D80F2'}
                    onBlur={(e) => e.target.style.borderColor = '#DBE0E5'}
                  />
                </div>

                {/* Email Address Field */}
                <div style={{ marginBottom: '24px' }}>
                  <label style={{
                    fontSize: '16px',
                    fontWeight: '500',
                    color: '#121417',
                    display: 'block',
                    marginBottom: '8px'
                  }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={editData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email address"
                    style={{
                      width: '100%',
                      padding: '15px',
                      border: '1px solid #DBE0E5',
                      borderRadius: '8px',
                      backgroundColor: 'white',
                      fontSize: '16px',
                      outline: 'none',
                      boxSizing: 'border-box',
                      transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#0D80F2'}
                    onBlur={(e) => e.target.style.borderColor = '#DBE0E5'}
                  />
                </div>

                {/* Contact Number Field */}
                <div style={{ marginBottom: '24px' }}>
                  <label style={{
                    fontSize: '16px',
                    fontWeight: '500',
                    color: '#121417',
                    display: 'block',
                    marginBottom: '8px'
                  }}>
                    Contact Number
                  </label>
                  <input
                    type="tel"
                    name="contactNumber"
                    value={editData.contactNumber}
                    onChange={handleInputChange}
                    placeholder="Enter your phone number"
                    style={{
                      width: '100%',
                      padding: '15px',
                      border: '1px solid #DBE0E5',
                      borderRadius: '8px',
                      backgroundColor: 'white',
                      fontSize: '16px',
                      outline: 'none',
                      boxSizing: 'border-box',
                      transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#0D80F2'}
                    onBlur={(e) => e.target.style.borderColor = '#DBE0E5'}
                  />
                </div>

                {/* Shipping Address Field */}
                <div style={{ marginBottom: '24px' }}>
                  <label style={{
                    fontSize: '16px',
                    fontWeight: '500',
                    color: '#121417',
                    display: 'block',
                    marginBottom: '8px'
                  }}>
                    Shipping Address
                  </label>
                  <textarea
                    name="shippingAddress"
                    value={editData.shippingAddress}
                    onChange={handleInputChange}
                    placeholder="Enter your shipping address"
                    rows="3"
                    style={{
                      width: '100%',
                      padding: '15px',
                      border: '1px solid #DBE0E5',
                      borderRadius: '8px',
                      backgroundColor: 'white',
                      fontSize: '16px',
                      outline: 'none',
                      resize: 'vertical',
                      boxSizing: 'border-box',
                      transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#0D80F2'}
                    onBlur={(e) => e.target.style.borderColor = '#DBE0E5'}
                  />
                </div>

                {/* Personal Preference Field */}
                <div style={{ marginBottom: '40px' }}>
                  <label style={{
                    fontSize: '16px',
                    fontWeight: '500',
                    color: '#121417',
                    display: 'block',
                    marginBottom: '8px'
                  }}>
                    Personal Preference
                  </label>
                  <select
                    name="personalPreference"
                    value={editData.personalPreference}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '15px',
                      border: '1px solid #DBE0E5',
                      borderRadius: '8px',
                      backgroundColor: 'white',
                      fontSize: '16px',
                      outline: 'none',
                      boxSizing: 'border-box',
                      transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#0D80F2'}
                    onBlur={(e) => e.target.style.borderColor = '#DBE0E5'}
                  >
                    <option value="">Select your preference</option>
                    <option value="electronics">Electronics</option>
                    <option value="gaming">Gaming</option>
                    <option value="mobile">Mobile Devices</option>
                    <option value="audio">Audio Equipment</option>
                    <option value="accessories">Accessories</option>
                  </select>
                </div>

                {/* Save Button */}
                <button
                  type="submit"
                  style={{
                    backgroundColor: '#0D80F2',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '12px 24px',
                    fontSize: '16px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#0a68c4'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#0D80F2'}
                >
                  Save
                </button>
              </form>
            </div>

            {/* Right Column - Profile Picture */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'flex-start',
              paddingTop: '80px'
            }}>
              <div style={{
                width: '200px',
                height: '200px',
                borderRadius: '50%',
                backgroundColor: '#f0f0f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden'
              }}>
                {/* Profile Image Placeholder */}
                <div style={{
                  width: '150px',
                  height: '150px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #8B4513, #A0522D)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '48px'
                }}>
                  🐵
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        backgroundColor: 'white',
        borderTop: '1px solid #e5e8eb',
        padding: '40px 20px',
        textAlign: 'center'
      }}>
        <div style={{
          maxWidth: '800px',
          margin: '0 auto'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '60px',
            marginBottom: '20px'
          }}>
            <Link to="/about-us" style={{
              color: '#61758A',
              textDecoration: 'none',
              fontSize: '16px'
            }}>
              About Us
            </Link>
            <Link to="/customer-support" style={{
              color: '#61758A',
              textDecoration: 'none',
              fontSize: '16px'
            }}>
              Customer Support
            </Link>
            <Link to="/terms-of-service" style={{
              color: '#61758A',
              textDecoration: 'none',
              fontSize: '16px'
            }}>
              Terms of Service
            </Link>
          </div>
          <div style={{
            color: '#61758A',
            fontSize: '16px'
          }}>
            © 2025 AWE Electronics. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Account; 