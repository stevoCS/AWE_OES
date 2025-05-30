import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SearchIcon, ShoppingCartIcon } from '../components/ui/icons';
import { Button } from '../components/ui/button';
import { useUser } from '../context/UserContext';
import { useOrders } from '../context/OrderContext';
import { useCart } from '../context/CartContext';
import logoIcon from '../assets/Vector - 0.svg';

export const UserDashboard = () => {
  const { user, logout, isLoggedIn } = useUser();
  const { orders } = useOrders();
  const { getCartItemsCount } = useCart();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  // If user is not logged in, redirect to login page
  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
    }
  }, [isLoggedIn, navigate]);

  const handleSignOut = () => {
    logout();
    navigate('/');
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
      'confirmed': { bg: '#dcfce7', color: '#16a34a', text: 'Confirmed' },
      'processing': { bg: '#fef3c7', color: '#d97706', text: 'Processing' },
      'shipped': { bg: '#dbeafe', color: '#2563eb', text: 'Shipped' },
      'delivered': { bg: '#dcfce7', color: '#16a34a', text: 'Delivered' },
      'cancelled': { bg: '#fef2f2', color: '#dc2626', text: 'Cancelled' }
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
            <Link to="/product" style={{
              fontWeight: '500',
              fontSize: '14px',
              color: '#121417',
              textDecoration: 'none'
            }}>
              All Products
            </Link>
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
          gap: '24px'
        }}>
          {/* Search Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#f0f2f5',
            borderRadius: '8px',
            minWidth: '200px'
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
              placeholder="Search products..."
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
          <Link to="/cart" style={{
            position: 'relative',
            padding: '8px',
            backgroundColor: '#f0f2f5',
            borderRadius: '8px',
            textDecoration: 'none'
          }}>
            <ShoppingCartIcon style={{ width: '17px', height: '17px', color: '#111416' }} />
            {getCartItemsCount() > 0 && (
              <span style={{
                position: 'absolute',
                top: '-6px',
                right: '-6px',
                backgroundColor: '#dc2626',
                color: 'white',
                borderRadius: '50%',
                width: '20px',
                height: '20px',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '600'
              }}>
                {getCartItemsCount()}
              </span>
            )}
          </Link>

          {/* User Menu */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: '#0D80F2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '16px',
              fontWeight: '600'
            }}>
              {user.firstName ? user.firstName.charAt(0).toUpperCase() : 'U'}
            </div>
            <span style={{
              fontSize: '14px',
              fontWeight: '500',
              color: '#121417'
            }}>
              {user.firstName} {user.lastName}
            </span>
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <div style={{
        padding: '20px 40px',
        fontSize: '14px',
        color: '#607589',
        backgroundColor: 'white',
        borderBottom: '1px solid #e5e8eb'
      }}>
        <Link to="/" style={{ color: '#607589', textDecoration: 'none' }}>Home</Link>
        <span style={{ margin: '0 8px' }}>/</span>
        <span style={{ color: '#121417' }}>Dashboard</span>
      </div>

      {/* Main Content */}
      <div style={{
        display: 'flex',
        gap: '32px',
        padding: '40px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Sidebar */}
        <div style={{
          width: '240px',
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '24px',
          border: '1px solid #e5e8eb',
          height: 'fit-content'
        }}>
          <div style={{
            marginBottom: '24px',
            textAlign: 'center'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: '#0D80F2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '32px',
              fontWeight: '600',
              margin: '0 auto 16px auto'
            }}>
              {user.firstName ? user.firstName.charAt(0).toUpperCase() : 'U'}
            </div>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#121417',
              margin: '0 0 4px 0'
            }}>
              {user.firstName} {user.lastName}
            </h3>
            <p style={{
              fontSize: '14px',
              color: '#607589',
              margin: 0
            }}>
              {user.email}
            </p>
          </div>

          <nav>
            {[
              { id: 'overview', label: 'Overview', icon: '📊' },
              { id: 'orders', label: 'Order History', icon: '📦' },
              { id: 'profile', label: 'Profile Settings', icon: '👤' },
              { id: 'addresses', label: 'Addresses', icon: '📍' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  marginBottom: '8px',
                  backgroundColor: activeTab === tab.id ? '#f0f8ff' : 'transparent',
                  border: activeTab === tab.id ? '1px solid #0D80F2' : '1px solid transparent',
                  borderRadius: '8px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: activeTab === tab.id ? '#0D80F2' : '#121417',
                  transition: 'all 0.2s'
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
            borderTop: '1px solid #e5e8eb'
          }}>
            <button
              onClick={handleSignOut}
              style={{
                width: '100%',
                padding: '12px 16px',
                backgroundColor: '#fee',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                color: '#dc2626',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                justifyContent: 'center'
              }}
            >
              <span>🚪</span>
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
                color: '#121417',
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
                  backgroundColor: 'white',
                  padding: '24px',
                  borderRadius: '8px',
                  border: '1px solid #e5e8eb'
                }}>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>📦</div>
                  <div style={{
                    fontSize: '24px',
                    fontWeight: '700',
                    color: '#121417',
                    marginBottom: '4px'
                  }}>
                    {stats.totalOrders}
                  </div>
                  <div style={{ fontSize: '14px', color: '#607589' }}>
                    Total Orders
                  </div>
                </div>

                <div style={{
                  backgroundColor: 'white',
                  padding: '24px',
                  borderRadius: '8px',
                  border: '1px solid #e5e8eb'
                }}>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>💰</div>
                  <div style={{
                    fontSize: '24px',
                    fontWeight: '700',
                    color: '#121417',
                    marginBottom: '4px'
                  }}>
                    ${stats.totalSpent.toFixed(2)}
                  </div>
                  <div style={{ fontSize: '14px', color: '#607589' }}>
                    Total Spent
                  </div>
                </div>

                <div style={{
                  backgroundColor: 'white',
                  padding: '24px',
                  borderRadius: '8px',
                  border: '1px solid #e5e8eb'
                }}>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔄</div>
                  <div style={{
                    fontSize: '24px',
                    fontWeight: '700',
                    color: '#121417',
                    marginBottom: '4px'
                  }}>
                    {stats.pendingOrders}
                  </div>
                  <div style={{ fontSize: '14px', color: '#607589' }}>
                    Active Orders
                  </div>
                </div>
              </div>

              {/* Recent Orders */}
              <div style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                border: '1px solid #e5e8eb',
                overflow: 'hidden'
              }}>
                <div style={{
                  padding: '24px',
                  borderBottom: '1px solid #e5e8eb'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <h2 style={{
                      fontSize: '20px',
                      fontWeight: '600',
                      color: '#121417',
                      margin: 0
                    }}>
                      Recent Orders
                    </h2>
                    <button
                      onClick={() => setActiveTab('orders')}
                      style={{
                        backgroundColor: 'transparent',
                        border: 'none',
                        color: '#0D80F2',
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
                          backgroundColor: '#f8f9fa',
                          borderRadius: '8px'
                        }}>
                          <div>
                            <div style={{
                              fontSize: '16px',
                              fontWeight: '500',
                              color: '#121417',
                              marginBottom: '4px'
                            }}>
                              Order {order.orderNumber}
                            </div>
                            <div style={{
                              fontSize: '14px',
                              color: '#607589'
                            }}>
                              {order.orderDate} • ${order.total.toFixed(2)}
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            {renderStatusBadge(order.status)}
                            <Link
                              to={`/order/${order.orderNumber}`}
                              style={{
                                color: '#0D80F2',
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
                      color: '#607589'
                    }}>
                      <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
                      <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>No orders yet</h3>
                      <p style={{ marginBottom: '24px' }}>Start shopping to see your orders here!</p>
                      <Link
                        to="/product"
                        style={{
                          backgroundColor: '#0D80F2',
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
                color: '#121417',
                marginBottom: '24px'
              }}>
                Order History
              </h1>

              <div style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                border: '1px solid #e5e8eb',
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
                      backgroundColor: '#f8f9fa',
                      borderBottom: '1px solid #e5e8eb',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#121417'
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
                        borderBottom: '1px solid #e5e8eb',
                        alignItems: 'center'
                      }}>
                        <div>
                          <div style={{
                            fontSize: '16px',
                            fontWeight: '500',
                            color: '#121417',
                            marginBottom: '4px'
                          }}>
                            {order.orderNumber}
                          </div>
                          <div style={{
                            fontSize: '14px',
                            color: '#607589'
                          }}>
                            {order.items.length} item{order.items.length > 1 ? 's' : ''}
                          </div>
                        </div>
                        <div style={{
                          fontSize: '14px',
                          color: '#607589'
                        }}>
                          {order.orderDate}
                        </div>
                        <div>
                          {renderStatusBadge(order.status)}
                        </div>
                        <div style={{
                          fontSize: '16px',
                          fontWeight: '600',
                          color: '#121417'
                        }}>
                          ${order.total.toFixed(2)}
                        </div>
                        <Link
                          to={`/order/${order.orderNumber}`}
                          style={{
                            color: '#0D80F2',
                            textDecoration: 'none',
                            fontSize: '14px',
                            fontWeight: '500'
                          }}
                        >
                          View
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{
                    textAlign: 'center',
                    padding: '60px',
                    color: '#607589'
                  }}>
                    <div style={{ fontSize: '64px', marginBottom: '24px' }}>📦</div>
                    <h3 style={{ fontSize: '24px', marginBottom: '12px' }}>No orders yet</h3>
                    <p style={{ marginBottom: '32px', fontSize: '16px' }}>
                      When you place your first order, it will appear here.
                    </p>
                    <Link
                      to="/product"
                      style={{
                        backgroundColor: '#0D80F2',
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
                color: '#121417',
                marginBottom: '24px'
              }}>
                Profile Settings
              </h1>

              <div style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                border: '1px solid #e5e8eb',
                padding: '32px'
              }}>
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
                      color: '#121417',
                      marginBottom: '8px'
                    }}>
                      First Name
                    </label>
                    <input
                      type="text"
                      value={user.firstName}
                      readOnly
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #e5e8eb',
                        borderRadius: '8px',
                        fontSize: '16px',
                        backgroundColor: '#f8f9fa',
                        color: '#607589'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#121417',
                      marginBottom: '8px'
                    }}>
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={user.lastName}
                      readOnly
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #e5e8eb',
                        borderRadius: '8px',
                        fontSize: '16px',
                        backgroundColor: '#f8f9fa',
                        color: '#607589'
                      }}
                    />
                  </div>

                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#121417',
                      marginBottom: '8px'
                    }}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={user.email}
                      readOnly
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #e5e8eb',
                        borderRadius: '8px',
                        fontSize: '16px',
                        backgroundColor: '#f8f9fa',
                        color: '#607589'
                      }}
                    />
                  </div>
                </div>

                <div style={{
                  marginTop: '32px',
                  padding: '24px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '24px', marginBottom: '16px' }}>🔧</div>
                  <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>Profile editing coming soon</h3>
                  <p style={{ color: '#607589', margin: 0 }}>
                    We're working on allowing you to update your profile information.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Addresses Tab */}
          {activeTab === 'addresses' && (
            <div>
              <h1 style={{
                fontSize: '28px',
                fontWeight: '700',
                color: '#121417',
                marginBottom: '24px'
              }}>
                Saved Addresses
              </h1>

              <div style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                border: '1px solid #e5e8eb',
                padding: '32px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '24px' }}>📍</div>
                <h3 style={{ fontSize: '20px', marginBottom: '12px' }}>No saved addresses</h3>
                <p style={{ color: '#607589', marginBottom: '24px' }}>
                  Add addresses for faster checkout in future orders.
                </p>
                <button style={{
                  backgroundColor: '#0D80F2',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}>
                  Add New Address
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard; 