import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';
import { authAPI } from '../api/config';
import Layout from '../components/Layout';

// Add CSS for spin animation
const spinKeyframes = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

// Inject styles
if (typeof document !== 'undefined' && !document.getElementById('userProfile-styles')) {
  const style = document.createElement('style');
  style.id = 'userProfile-styles';
  style.textContent = spinKeyframes;
  document.head.appendChild(style);
}

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

  // 密码更改状态
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });

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

  // 密码更改处理函数
  const handlePasswordFormChange = (field, value) => {
    setPasswordForm(prev => ({ ...prev, [field]: value }));
    
    // 清除对应字段的错误
    if (passwordErrors[field]) {
      setPasswordErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    // 清除消息
    if (passwordMessage.text) {
      setPasswordMessage({ type: '', text: '' });
    }
  };

  const validatePasswordForm = () => {
    const errors = {};
    
    if (!passwordForm.currentPassword) {
      errors.currentPassword = '请输入当前密码';
    }
    
    if (!passwordForm.newPassword) {
      errors.newPassword = '请输入新密码';
    } else if (passwordForm.newPassword.length < 6) {
      errors.newPassword = '新密码至少需要6个字符';
    }
    
    if (!passwordForm.confirmPassword) {
      errors.confirmPassword = '请确认新密码';
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = '新密码和确认密码不匹配';
    }
    
    if (passwordForm.currentPassword && passwordForm.newPassword && 
        passwordForm.currentPassword === passwordForm.newPassword) {
      errors.newPassword = '新密码不能与当前密码相同';
    }
    
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (!validatePasswordForm()) {
      return;
    }
    
    setIsChangingPassword(true);
    setPasswordMessage({ type: '', text: '' });
    
    try {
      await authAPI.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      
      // 成功后重置表单
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      setPasswordMessage({
        type: 'success',
        text: '密码更改成功！'
      });
      
      // 3秒后清除成功消息
      setTimeout(() => {
        setPasswordMessage({ type: '', text: '' });
      }, 3000);
      
    } catch (error) {
      console.error('Password change failed:', error);
      setPasswordMessage({
        type: 'error',
        text: error.message || '密码更改失败，请重试'
      });
    } finally {
      setIsChangingPassword(false);
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
                  placeholder="Enter your phone number"
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

          {/* Change Password Section */}
          <div style={{
            backgroundColor: theme.cardBg,
            borderRadius: '12px',
            border: `1px solid ${theme.border}`,
            overflow: 'hidden',
            boxShadow: theme.shadowLight,
            marginTop: '24px'
          }}>
            {/* Header */}
            <div style={{
              padding: '32px',
              borderBottom: `1px solid ${theme.border}`,
              backgroundColor: theme.backgroundSecondary
            }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: '700',
                color: theme.textPrimary,
                margin: '0 0 8px 0'
              }}>
                Change Password
              </h2>
              <p style={{
                fontSize: '16px',
                color: theme.textSecondary,
                margin: 0
              }}>
                Update your account password for security
              </p>
            </div>

            {/* Form Content */}
            <div style={{ padding: '32px' }}>
              <form onSubmit={handleChangePassword} style={{
                maxWidth: '500px'
              }}>
                {/* Current Password */}
                <div style={{ marginBottom: '24px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: theme.textPrimary,
                    marginBottom: '8px'
                  }}>
                    Current Password *
                  </label>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => handlePasswordFormChange('currentPassword', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      fontSize: '16px',
                      border: `1px solid ${passwordErrors.currentPassword ? theme.error : theme.border}`,
                      borderRadius: '8px',
                      backgroundColor: theme.inputBg,
                      color: theme.textPrimary,
                      outline: 'none',
                      transition: 'border-color 0.2s ease'
                    }}
                    onFocus={(e) => e.target.style.borderColor = theme.primary}
                    onBlur={(e) => e.target.style.borderColor = passwordErrors.currentPassword ? theme.error : theme.border}
                  />
                  {passwordErrors.currentPassword && (
                    <div style={{
                      fontSize: '12px',
                      color: theme.error,
                      marginTop: '4px'
                    }}>
                      {passwordErrors.currentPassword}
                    </div>
                  )}
                </div>

                {/* New Password */}
                <div style={{ marginBottom: '24px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: theme.textPrimary,
                    marginBottom: '8px'
                  }}>
                    New Password *
                  </label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => handlePasswordFormChange('newPassword', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      fontSize: '16px',
                      border: `1px solid ${passwordErrors.newPassword ? theme.error : theme.border}`,
                      borderRadius: '8px',
                      backgroundColor: theme.inputBg,
                      color: theme.textPrimary,
                      outline: 'none',
                      transition: 'border-color 0.2s ease'
                    }}
                    onFocus={(e) => e.target.style.borderColor = theme.primary}
                    onBlur={(e) => e.target.style.borderColor = passwordErrors.newPassword ? theme.error : theme.border}
                  />
                  {passwordErrors.newPassword && (
                    <div style={{
                      fontSize: '12px',
                      color: theme.error,
                      marginTop: '4px'
                    }}>
                      {passwordErrors.newPassword}
                    </div>
                  )}
                  <div style={{
                    fontSize: '12px',
                    color: theme.textMuted,
                    marginTop: '4px'
                  }}>
                    Password must be at least 6 characters long
                  </div>
                </div>

                {/* Confirm New Password */}
                <div style={{ marginBottom: '32px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: theme.textPrimary,
                    marginBottom: '8px'
                  }}>
                    Confirm New Password *
                  </label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => handlePasswordFormChange('confirmPassword', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      fontSize: '16px',
                      border: `1px solid ${passwordErrors.confirmPassword ? theme.error : theme.border}`,
                      borderRadius: '8px',
                      backgroundColor: theme.inputBg,
                      color: theme.textPrimary,
                      outline: 'none',
                      transition: 'border-color 0.2s ease'
                    }}
                    onFocus={(e) => e.target.style.borderColor = theme.primary}
                    onBlur={(e) => e.target.style.borderColor = passwordErrors.confirmPassword ? theme.error : theme.border}
                  />
                  {passwordErrors.confirmPassword && (
                    <div style={{
                      fontSize: '12px',
                      color: theme.error,
                      marginTop: '4px'
                    }}>
                      {passwordErrors.confirmPassword}
                    </div>
                  )}
                </div>

                {/* Status Message */}
                {passwordMessage.text && (
                  <div style={{
                    padding: '16px',
                    borderRadius: '8px',
                    marginBottom: '24px',
                    fontSize: '14px',
                    backgroundColor: passwordMessage.type === 'success' 
                      ? theme.success + '20' 
                      : theme.error + '20',
                    color: passwordMessage.type === 'success' 
                      ? theme.success 
                      : theme.error,
                    border: `1px solid ${passwordMessage.type === 'success' 
                      ? theme.success + '50' 
                      : theme.error + '50'}`
                  }}>
                    {passwordMessage.text}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  style={{
                    backgroundColor: isChangingPassword ? theme.textMuted : theme.primary,
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '12px 24px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: isChangingPassword ? 'not-allowed' : 'pointer',
                    transition: 'background-color 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    opacity: isChangingPassword ? 0.6 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (!isChangingPassword) e.target.style.backgroundColor = theme.primaryHover;
                  }}
                  onMouseLeave={(e) => {
                    if (!isChangingPassword) e.target.style.backgroundColor = theme.primary;
                  }}
                >
                  {isChangingPassword ? (
                    <>
                      <span style={{ 
                        display: 'inline-block',
                        width: '16px',
                        height: '16px',
                        border: '2px solid transparent',
                        borderTop: '2px solid white',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }}></span>
                      Changing Password...
                    </>
                  ) : (
                    'Change Password'
                  )}
                </button>
              </form>
            </div>
          </div>
        </main>
      </div>
    </Layout>
  );
};

export default UserProfile; 