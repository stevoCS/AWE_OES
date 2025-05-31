import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SearchIcon, ShoppingCartIcon } from '../components/ui/icons';
import { Button } from '../components/ui/button';
import { useUser } from '../context/UserContext';
import { useOrders } from '../context/OrderContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import logoIcon from '../assets/Vector - 0.svg';
import Layout from '../components/Layout';

export const UserDashboard = () => {
  const { user, logout, isLoggedIn } = useUser();
  const { orders } = useOrders();
  const { getCartItemsCount } = useCart();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  // If user is not logged in, redirect to login page
  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
    }
  }, [isLoggedIn, navigate]);

  const handleSignOut = () => {
    console.log('UserDashboard - handleSignOut called');
    console.log('UserDashboard - logout function:', logout);
    console.log('UserDashboard - user before logout:', user);
    console.log('UserDashboard - isLoggedIn before logout:', isLoggedIn);
    
    try {
      logout();
      console.log('UserDashboard - logout function executed');
      console.log('UserDashboard - user after logout:', user);
      console.log('UserDashboard - isLoggedIn after logout:', isLoggedIn);
      
      // Force navigation to home and refresh page
      console.log('UserDashboard - forcing navigation to home');
      navigate('/', { replace: true });
      
      // Add delay and force page reload to ensure state update
      setTimeout(() => {
        console.log('UserDashboard - forcing page reload');
        window.location.href = '/';
      }, 100);
      
    } catch (error) {
      console.error('UserDashboard - Error during sign out:', error);
      // Even if error occurs, try to redirect
      window.location.href = '/';
    }
  };

  // Format date for better display
  const formatOrderDate = (dateString) => {
    try {
      const date = new Date(dateString);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return dateString; // Return original if parsing fails
      }
      
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      // Format options
      const dateOptions = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      };
      
      const timeOptions = { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      };
      
      // If within last 7 days, show relative day
      if (diffDays === 0) {
        return `Today, ${date.toLocaleTimeString('en-US', timeOptions)}`;
      } else if (diffDays === 1) {
        return `Yesterday, ${date.toLocaleTimeString('en-US', timeOptions)}`;
      } else if (diffDays <= 7) {
        const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
        return `${dayName}, ${date.toLocaleTimeString('en-US', timeOptions)}`;
      } else {
        // For older dates, show date + time
        return `${date.toLocaleDateString('en-US', dateOptions)}, ${date.toLocaleTimeString('en-US', timeOptions)}`;
      }
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString; // Return original if formatting fails
    }
  };

  // Calculate user statistics
  const getUserStats = () => {
    const totalOrders = orders.length;
    const totalSpent = orders.reduce((sum, order) => sum + (order.total || 0), 0);
    const recentOrders = orders.slice(0, 3);
    const pendingOrders = orders.filter(order => order.status === 'confirmed' || order.status === 'processing').length;
    
    return {
      totalOrders,
      totalSpent,
      recentOrders,
      pendingOrders
    };
  };

  const stats = getUserStats();

  // Render order status badge
  const renderStatusBadge = (status) => {
    const statusConfig = {
      'confirmed': { bg: theme.success + '20', color: theme.success, text: 'Confirmed' },
      'processing': { bg: theme.warning + '20', color: theme.warning, text: 'Processing' },
      'shipped': { bg: theme.primary + '20', color: theme.primary, text: 'Shipped' },
      'delivered': { bg: theme.success + '20', color: theme.success, text: 'Delivered' },
      'cancelled': { bg: theme.error + '20', color: theme.error, text: 'Cancelled' }
    };

    const config = statusConfig[status] || statusConfig['confirmed'];
    
    return (
      <span style={{
        backgroundColor: config.bg,
        color: config.color,
        padding: '4px 8px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: '500'
      }}>
        {config.text}
      </span>
    );
  };

  if (!user) return null;

  return (
    <Layout>
      <div style={{
        backgroundColor: theme.background,
        minHeight: 'calc(100vh - 120px)',
        fontFamily: "'Space Grotesk', Arial, sans-serif"
      }}>
        {/* Main Content */}
        <main style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '40px 20px'
        }}>
          <div style={{
            display: 'flex',
            gap: '32px',
            padding: '40px',
            maxWidth: '1200px',
            margin: '0 auto',
            minHeight: 'calc(100vh - 200px)'
          }}>
            {/* Sidebar */}
            <div style={{
              width: '240px',
              backgroundColor: theme.cardBg,
              borderRadius: '8px',
              padding: '24px',
              border: `1px solid ${theme.border}`,
              height: 'fit-content',
              boxShadow: theme.shadowLight
            }}>
              <div style={{
                marginBottom: '24px',
                textAlign: 'center'
              }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  backgroundColor: user.avatar ? 'transparent' : theme.primary,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '32px',
                  fontWeight: '600',
                  margin: '0 auto 16px auto',
                  backgroundImage: user.avatar ? `url(${user.avatar})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  border: `2px solid ${theme.border}`
                }}>
                  {!user.avatar && (user.firstName ? user.firstName.charAt(0).toUpperCase() : 'U')}
                </div>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: theme.textPrimary,
                  margin: '0 0 4px 0'
                }}>
                  {user.firstName} {user.lastName}
                </h3>
                <p style={{
                  fontSize: '14px',
                  color: theme.textSecondary,
                  margin: 0
                }}>
                  {user.email}
                </p>
              </div>

              <nav>
                {[
                  { id: 'overview', label: 'Overview'},
                  { id: 'orders', label: 'Order History'},
                  { id: 'profile', label: 'Profile Settings'}
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      marginBottom: '8px',
                      backgroundColor: activeTab === tab.id ? theme.primary + '20' : 'transparent',
                      border: activeTab === tab.id ? `1px solid ${theme.primary}` : '1px solid transparent',
                      borderRadius: '8px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: activeTab === tab.id ? theme.primary : theme.textPrimary,
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      if (activeTab !== tab.id) {
                        e.target.style.backgroundColor = theme.backgroundSecondary;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (activeTab !== tab.id) {
                        e.target.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <span>{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </nav>

              <div style={{
                marginTop: '24px',
                paddingTop: '24px',
                borderTop: `1px solid ${theme.border}`
              }}>
                <button
                  onClick={handleSignOut}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    backgroundColor: theme.error + '20',
                    border: `1px solid ${theme.error}50`,
                    borderRadius: '8px',
                    color: theme.error,
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = theme.error + '30';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = theme.error + '20';
                  }}
                >
                  Sign Out
                </button>
              </div>
            </div>

            {/* Main Content Area */}
            <div style={{ flex: 1 }}>
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div>
                  <h1 style={{
                    fontSize: '28px',
                    fontWeight: '700',
                    color: theme.textPrimary,
                    marginBottom: '24px'
                  }}>
                    Welcome back, {user.firstName}!
                  </h1>

                  {/* Stats Cards */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '24px',
                    marginBottom: '32px'
                  }}>
                    <div style={{
                      backgroundColor: theme.cardBg,
                      padding: '24px',
                      borderRadius: '8px',
                      border: `1px solid ${theme.border}`
                    }}>
                      <div style={{ fontSize: '32px', marginBottom: '8px' }}></div>
                      <div style={{
                        fontSize: '24px',
                        fontWeight: '700',
                        color: theme.textPrimary,
                        marginBottom: '4px'
                      }}>
                        {stats.totalOrders}
                      </div>
                      <div style={{ fontSize: '14px', color: theme.textSecondary }}>
                        Total Orders
                      </div>
                    </div>

                    <div style={{
                      backgroundColor: theme.cardBg,
                      padding: '24px',
                      borderRadius: '8px',
                      border: `1px solid ${theme.border}`
                    }}>
                      <div style={{ fontSize: '32px', marginBottom: '8px' }}></div>
                      <div style={{
                        fontSize: '24px',
                        fontWeight: '700',
                        color: theme.textPrimary,
                        marginBottom: '4px'
                      }}>
                        ${stats.totalSpent.toFixed(2)}
                      </div>
                      <div style={{ fontSize: '14px', color: theme.textSecondary }}>
                        Total Spent
                      </div>
                    </div>

                    <div style={{
                      backgroundColor: theme.cardBg,
                      padding: '24px',
                      borderRadius: '8px',
                      border: `1px solid ${theme.border}`
                    }}>
                      <div style={{ fontSize: '32px', marginBottom: '8px' }}></div>
                      <div style={{
                        fontSize: '24px',
                        fontWeight: '700',
                        color: theme.textPrimary,
                        marginBottom: '4px'
                      }}>
                        {stats.pendingOrders}
                      </div>
                      <div style={{ fontSize: '14px', color: theme.textSecondary }}>
                        Active Orders
                      </div>
                    </div>
                  </div>

                  {/* Recent Orders */}
                  <div style={{
                    backgroundColor: theme.cardBg,
                    borderRadius: '8px',
                    border: `1px solid ${theme.border}`,
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      padding: '24px',
                      borderBottom: `1px solid ${theme.border}`
                    }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <h2 style={{
                          fontSize: '20px',
                          fontWeight: '600',
                          color: theme.textPrimary,
                          margin: 0
                        }}>
                          Recent Orders
                        </h2>
                        <button
                          onClick={() => setActiveTab('orders')}
                          style={{
                            backgroundColor: 'transparent',
                            border: 'none',
                            color: theme.primary,
                            fontSize: '14px',
                            fontWeight: '500',
                            cursor: 'pointer'
                          }}
                        >
                          View All
                        </button>
                      </div>
                    </div>

                    <div style={{ padding: '24px' }}>
                      {stats.recentOrders.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                          {stats.recentOrders.map(order => (
                            <div key={order.orderNumber} style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              padding: '16px',
                              backgroundColor: theme.backgroundSecondary,
                              borderRadius: '8px'
                            }}>
                              <div>
                                <div style={{
                                  fontSize: '16px',
                                  fontWeight: '500',
                                  color: theme.textPrimary,
                                  marginBottom: '4px'
                                }}>
                                  Order {order.orderNumber}
                                </div>
                                <div style={{
                                  fontSize: '14px',
                                  color: theme.textSecondary
                                }}>
                                  {formatOrderDate(order.orderDate)} • ${order.total.toFixed(2)}
                                </div>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                {renderStatusBadge(order.status)}
                                <Link
                                  to={`/order-detail/${order.orderNumber}`}
                                  style={{
                                    color: theme.primary,
                                    textDecoration: 'none',
                                    fontSize: '14px',
                                    fontWeight: '500'
                                  }}
                                >
                                  View Details
                                </Link>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{
                          textAlign: 'center',
                          padding: '40px',
                          color: theme.textSecondary
                        }}>
                          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
                          <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>No orders yet</h3>
                          <p style={{ marginBottom: '24px' }}>Start shopping to see your orders here!</p>
                          <Link
                            to="/product"
                            style={{
                              backgroundColor: theme.primary,
                              color: 'white',
                              textDecoration: 'none',
                              padding: '12px 24px',
                              borderRadius: '8px',
                              fontSize: '14px',
                              fontWeight: '500',
                              display: 'inline-block'
                            }}
                          >
                            Browse Products
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Orders Tab */}
              {activeTab === 'orders' && (
                <div>
                  <h1 style={{
                    fontSize: '28px',
                    fontWeight: '700',
                    color: theme.textPrimary,
                    marginBottom: '24px'
                  }}>
                    Order History
                  </h1>

                  <div style={{
                    backgroundColor: theme.cardBg,
                    borderRadius: '8px',
                    border: `1px solid ${theme.border}`,
                    overflow: 'hidden'
                  }}>
                    {orders.length > 0 ? (
                      <div>
                        {/* Table Header */}
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 120px 120px 120px 100px',
                          gap: '16px',
                          padding: '16px 24px',
                          backgroundColor: theme.backgroundSecondary,
                          borderBottom: `1px solid ${theme.border}`,
                          fontSize: '14px',
                          fontWeight: '600',
                          color: theme.textPrimary
                        }}>
                          <div>Order Details</div>
                          <div>Date</div>
                          <div>Status</div>
                          <div>Total</div>
                          <div>Actions</div>
                        </div>

                        {/* Table Body */}
                        {orders.map(order => (
                          <div key={order.orderNumber} style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 120px 120px 120px 100px',
                            gap: '16px',
                            padding: '16px 24px',
                            borderBottom: `1px solid ${theme.border}`,
                            alignItems: 'center'
                          }}>
                            <div>
                              <div style={{
                                fontSize: '16px',
                                fontWeight: '500',
                                color: theme.textPrimary,
                                marginBottom: '4px'
                              }}>
                                {order.orderNumber}
                              </div>
                              <div style={{
                                fontSize: '14px',
                                color: theme.textSecondary
                              }}>
                                {order.items.length} item{order.items.length > 1 ? 's' : ''}
                              </div>
                            </div>
                            <div style={{
                              fontSize: '14px',
                              color: theme.textSecondary
                            }}>
                              {formatOrderDate(order.orderDate)}
                            </div>
                            <div>
                              {renderStatusBadge(order.status)}
                            </div>
                            <div style={{
                              fontSize: '16px',
                              fontWeight: '600',
                              color: theme.textPrimary
                            }}>
                              ${order.total.toFixed(2)}
                            </div>
                            <Link
                              to={`/order-detail/${order.orderNumber}`}
                              style={{
                                color: theme.primary,
                                textDecoration: 'none',
                                fontSize: '14px',
                                fontWeight: '500'
                              }}
                            >
                              View Details
                            </Link>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{
                        textAlign: 'center',
                        padding: '60px',
                        color: theme.textSecondary
                      }}>
                        <div style={{ fontSize: '64px', marginBottom: '24px' }}>📦</div>
                        <h3 style={{ fontSize: '24px', marginBottom: '12px' }}>No orders yet</h3>
                        <p style={{ marginBottom: '32px', fontSize: '16px' }}>
                          When you place your first order, it will appear here.
                        </p>
                        <Link
                          to="/product"
                          style={{
                            backgroundColor: theme.primary,
                            color: 'white',
                            textDecoration: 'none',
                            padding: '16px 32px',
                            borderRadius: '8px',
                            fontSize: '16px',
                            fontWeight: '600',
                            display: 'inline-block'
                          }}
                        >
                          Start Shopping
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div>
                  <h1 style={{
                    fontSize: '28px',
                    fontWeight: '700',
                    color: theme.textPrimary,
                    marginBottom: '24px'
                  }}>
                    Profile Settings
                  </h1>

                  <div style={{
                    backgroundColor: theme.cardBg,
                    borderRadius: '8px',
                    border: `1px solid ${theme.border}`,
                    overflow: 'hidden'
                  }}>
                    {/* Profile Header */}
                    <div style={{
                      padding: '32px',
                      borderBottom: `1px solid ${theme.border}`,
                      backgroundColor: theme.backgroundSecondary
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '24px'
                      }}>
                        {/* Avatar */}
                        <div style={{
                          width: '100px',
                          height: '100px',
                          borderRadius: '50%',
                          backgroundColor: user.avatar ? 'transparent' : theme.primary,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '36px',
                          fontWeight: '600',
                          backgroundImage: user.avatar ? `url(${user.avatar})` : 'none',
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          border: `3px solid ${theme.border}`
                        }}>
                          {!user.avatar && (user.firstName ? user.firstName.charAt(0).toUpperCase() : 'U')}
                        </div>
                        
                        {/* User Info */}
                        <div style={{ flex: 1 }}>
                          <h2 style={{
                            fontSize: '24px',
                            fontWeight: '600',
                            color: theme.textPrimary,
                            margin: '0 0 8px 0'
                          }}>
                            {user.firstName} {user.lastName}
                          </h2>
                          <p style={{
                            fontSize: '16px',
                            color: theme.textSecondary,
                            margin: '0 0 16px 0'
                          }}>
                            {user.email}
                          </p>
                          <button
                            onClick={() => navigate('/profile')}
                            style={{
                              backgroundColor: theme.primary,
                              color: 'white',
                              border: 'none',
                              padding: '12px 24px',
                              borderRadius: '8px',
                              fontSize: '14px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              transition: 'background-color 0.2s'
                            }}
                            onMouseOver={(e) => e.target.style.backgroundColor = theme.primary + '20'}
                            onMouseOut={(e) => e.target.style.backgroundColor = theme.primary}
                          >
                            Edit Profile
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Profile Details */}
                    <div style={{ padding: '32px' }}>
                      <h3 style={{
                        fontSize: '18px',
                        fontWeight: '600',
                        color: theme.textPrimary,
                        margin: '0 0 24px 0'
                      }}>
                        Personal Information
                      </h3>
                      
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '24px',
                        marginBottom: '32px'
                      }}>
                        <div>
                          <label style={{
                            display: 'block',
                            fontSize: '14px',
                            fontWeight: '500',
                            color: theme.textSecondary,
                            marginBottom: '8px'
                          }}>
                            First Name
                          </label>
                          <div style={{
                            padding: '12px 16px',
                            backgroundColor: theme.backgroundSecondary,
                            borderRadius: '8px',
                            fontSize: '16px',
                            color: theme.textPrimary,
                            border: `1px solid ${theme.border}`
                          }}>
                            {user.firstName || 'Not provided'}
                          </div>
                        </div>
                        
                        <div>
                          <label style={{
                            display: 'block',
                            fontSize: '14px',
                            fontWeight: '500',
                            color: theme.textSecondary,
                            marginBottom: '8px'
                          }}>
                            Last Name
                          </label>
                          <div style={{
                            padding: '12px 16px',
                            backgroundColor: theme.backgroundSecondary,
                            borderRadius: '8px',
                            fontSize: '16px',
                            color: theme.textPrimary,
                            border: `1px solid ${theme.border}`
                          }}>
                            {user.lastName || 'Not provided'}
                          </div>
                        </div>
                      </div>

                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '24px',
                        marginBottom: '32px'
                      }}>
                        <div>
                          <label style={{
                            display: 'block',
                            fontSize: '14px',
                            fontWeight: '500',
                            color: theme.textSecondary,
                            marginBottom: '8px'
                          }}>
                            Email Address
                          </label>
                          <div style={{
                            padding: '12px 16px',
                            backgroundColor: theme.backgroundSecondary,
                            borderRadius: '8px',
                            fontSize: '16px',
                            color: theme.textPrimary,
                            border: `1px solid ${theme.border}`
                          }}>
                            {user.email}
                          </div>
                        </div>
                        
                        <div>
                          <label style={{
                            display: 'block',
                            fontSize: '14px',
                            fontWeight: '500',
                            color: theme.textSecondary,
                            marginBottom: '8px'
                          }}>
                            Phone Number
                          </label>
                          <div style={{
                            padding: '12px 16px',
                            backgroundColor: theme.backgroundSecondary,
                            borderRadius: '8px',
                            fontSize: '16px',
                            color: theme.textPrimary,
                            border: `1px solid ${theme.border}`
                          }}>
                            {user.phone || 'Not provided'}
                          </div>
                        </div>
                      </div>

                      {/* Bio */}
                      <div>
                        <label style={{
                          display: 'block',
                          fontSize: '14px',
                          fontWeight: '500',
                          color: theme.textSecondary,
                          marginBottom: '8px'
                        }}>
                          Bio
                        </label>
                        <div style={{
                          padding: '12px 16px',
                          backgroundColor: theme.backgroundSecondary,
                          borderRadius: '8px',
                          fontSize: '16px',
                          color: theme.textPrimary,
                          border: `1px solid ${theme.border}`,
                          minHeight: '80px'
                        }}>
                          {user.bio || 'No bio provided yet. Tell us about yourself!'}
                        </div>
                      </div>

                      {/* Account Information */}
                      <div style={{
                        marginTop: '32px',
                        paddingTop: '32px',
                        borderTop: `1px solid ${theme.border}`
                      }}>
                        <h3 style={{
                          fontSize: '18px',
                          fontWeight: '600',
                          color: theme.textPrimary,
                          margin: '0 0 24px 0'
                        }}>
                          Account Information
                        </h3>
                        
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr',
                          gap: '24px'
                        }}>
                          <div>
                            <label style={{
                              display: 'block',
                              fontSize: '14px',
                              fontWeight: '500',
                              color: theme.textSecondary,
                              marginBottom: '8px'
                            }}>
                              Member Since
                            </label>
                            <div style={{
                              padding: '12px 16px',
                              backgroundColor: theme.backgroundSecondary,
                              borderRadius: '8px',
                              fontSize: '16px',
                              color: theme.textPrimary,
                              border: `1px solid ${theme.border}`
                            }}>
                              {user.joinDate || 'January 2025'}
                            </div>
                          </div>
                          
                          <div>
                            <label style={{
                              display: 'block',
                              fontSize: '14px',
                              fontWeight: '500',
                              color: theme.textSecondary,
                              marginBottom: '8px'
                            }}>
                              Account Status
                            </label>
                            <div style={{
                              padding: '12px 16px',
                              backgroundColor: theme.backgroundSecondary,
                              borderRadius: '8px',
                              fontSize: '16px',
                              color: theme.textPrimary,
                              border: `1px solid ${theme.border}`,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px'
                            }}>
                              <span style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                backgroundColor: theme.success
                              }}></span>
                              Active
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </Layout>
  );
};

export default UserDashboard; 