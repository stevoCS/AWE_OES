import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';
import Layout from '../components/Layout';

const UserProfile = () => {
  const { user, updateUser, isLoggedIn } = useUser();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bio: user?.bio || ''
  });
  
  const [avatar, setAvatar] = useState(user?.avatar || null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
    }
  }, [isLoggedIn, navigate]);

  // Sync form data with user changes (important for preserving data across logins)
  React.useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        bio: user.bio || ''
      });
      setAvatar(user.avatar || null);
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setMessage({ type: 'error', text: 'Please select a valid image file.' });
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'Image size should be less than 5MB.' });
        return;
      }

      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatar(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Prepare updated data
      const updatedData = {
        ...formData,
        avatar: avatar
      };

      console.log('Updating user with data:', updatedData);
      
      // Update user context
      if (updateUser) {
        const result = await updateUser(updatedData);
        
        if (result.success) {
          setMessage({ type: 'success', text: 'Profile updated successfully!' });
          
          // Redirect back to dashboard after 2 seconds
          setTimeout(() => {
            navigate('/dashboard');
          }, 2000);
        } else {
          throw new Error(result.error || 'Failed to update profile');
        }
      } else {
        throw new Error('Update function not available');
      }
      
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to update profile. Please try again.' });
    } finally {
      setIsLoading(false);
    }
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
          padding: '20px 0',
          maxWidth: '1200px',
          margin: '0 auto',
          paddingLeft: '40px',
          paddingRight: '40px',
          fontSize: '14px',
          color: theme.textSecondary
        }}>
          <Link 
            to="/" 
            style={{ 
              color: theme.textSecondary, 
              textDecoration: 'none',
              transition: 'color 0.2s ease'
            }}
            onMouseEnter={(e) => e.target.style.color = theme.primary}
            onMouseLeave={(e) => e.target.style.color = theme.textSecondary}
          >
            Home
          </Link>
          <span style={{ margin: '0 8px' }}>/</span>
          <Link 
            to="/dashboard" 
            style={{ 
              color: theme.textSecondary, 
              textDecoration: 'none',
              transition: 'color 0.2s ease'
            }}
            onMouseEnter={(e) => e.target.style.color = theme.primary}
            onMouseLeave={(e) => e.target.style.color = theme.textSecondary}
          >
            Dashboard
          </Link>
          <span style={{ margin: '0 8px' }}>/</span>
          <span style={{ color: theme.textPrimary }}>Profile Settings</span>
        </div>

        {/* Main Content */}
        <main style={{
          maxWidth: '800px',
          margin: '0 auto',
          padding: '0 40px 40px'
        }}>
          <div style={{
            backgroundColor: theme.cardBg,
            borderRadius: '12px',
            border: `1px solid ${theme.border}`,
            overflow: 'hidden',
            boxShadow: theme.shadowLight
          }}>
            {/* Header */}
            <div style={{
              padding: '32px',
              borderBottom: `1px solid ${theme.border}`,
              backgroundColor: theme.backgroundSecondary
            }}>
              <h1 style={{
                fontSize: '28px',
                fontWeight: '700',
                color: theme.textPrimary,
                margin: '0 0 8px 0'
              }}>
                Edit Profile
              </h1>
              <p style={{
                fontSize: '16px',
                color: theme.textSecondary,
                margin: 0
              }}>
                Update your personal information and profile picture
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ padding: '32px' }}>
              {/* Success/Error Message */}
              {message.text && (
                <div style={{
                  marginBottom: '24px',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  backgroundColor: message.type === 'success' ? theme.success + '20' : theme.error + '20',
                  color: message.type === 'success' ? theme.success : theme.error,
                  border: `1px solid ${message.type === 'success' ? theme.success : theme.error}50`,
                  fontSize: '14px'
                }}>
                  {message.text}
                </div>
              )}

              {/* Avatar Section */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '24px',
                marginBottom: '32px',
                paddingBottom: '32px',
                borderBottom: `1px solid ${theme.border}`
              }}>
                <div style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  backgroundColor: avatar ? 'transparent' : theme.primary,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '48px',
                  fontWeight: '600',
                  backgroundImage: avatar ? `url(${avatar})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  border: `3px solid ${theme.border}`,
                  overflow: 'hidden'
                }}>
                  {!avatar && (user.firstName ? user.firstName.charAt(0).toUpperCase() : 'U')}
                </div>
                
                <div>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: theme.textPrimary,
                    margin: '0 0 8px 0'
                  }}>
                    Profile Picture
                  </h3>
                  <p style={{
                    fontSize: '14px',
                    color: theme.textSecondary,
                    margin: '0 0 16px 0'
                  }}>
                    JPG, GIF or PNG. Max size 5MB.
                  </p>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    style={{ display: 'none' }}
                  />
                  
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      backgroundColor: theme.primary,
                      color: 'white',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = theme.primaryHover}
                    onMouseLeave={(e) => e.target.style.backgroundColor = theme.primary}
                  >
                    Change Picture
                  </button>
                </div>
              </div>

              {/* Form Fields */}
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
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: `1px solid ${theme.border}`,
                      borderRadius: '8px',
                      fontSize: '16px',
                      backgroundColor: theme.inputBg,
                      color: theme.textPrimary,
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
                    Last Name *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: `1px solid ${theme.border}`,
                      borderRadius: '8px',
                      fontSize: '16px',
                      backgroundColor: theme.inputBg,
                      color: theme.textPrimary,
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
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: `1px solid ${theme.border}`,
                    borderRadius: '8px',
                    fontSize: '16px',
                    backgroundColor: theme.inputBg,
                    color: theme.textPrimary,
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
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+1 (555) 123-4567"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: `1px solid ${theme.border}`,
                    borderRadius: '8px',
                    fontSize: '16px',
                    backgroundColor: theme.inputBg,
                    color: theme.textPrimary,
                    transition: 'border-color 0.2s ease'
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
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder="Tell us a little about yourself..."
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: `1px solid ${theme.border}`,
                    borderRadius: '8px',
                    fontSize: '16px',
                    backgroundColor: theme.inputBg,
                    color: theme.textPrimary,
                    resize: 'vertical',
                    fontFamily: 'inherit',
                    transition: 'border-color 0.2s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor = theme.primary}
                  onBlur={(e) => e.target.style.borderColor = theme.border}
                />
              </div>

              {/* Action Buttons */}
              <div style={{
                display: 'flex',
                gap: '16px',
                justifyContent: 'flex-end'
              }}>
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  style={{
                    backgroundColor: 'transparent',
                    color: theme.textSecondary,
                    border: `1px solid ${theme.border}`,
                    padding: '12px 24px',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = theme.backgroundSecondary;
                    e.target.style.color = theme.textPrimary;
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.color = theme.textSecondary;
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    backgroundColor: isLoading ? theme.textMuted : theme.primary,
                    color: 'white',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    opacity: isLoading ? 0.6 : 1,
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!isLoading) {
                      e.target.style.backgroundColor = theme.primaryHover;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isLoading) {
                      e.target.style.backgroundColor = theme.primary;
                    }
                  }}
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </Layout>
  );
};

export default UserProfile; 