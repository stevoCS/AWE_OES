import React, { useState, useEffect } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { SearchIcon, ShoppingCartIcon } from '../components/ui/icons';
import { useUser } from '../context/UserContext';
import { useCart } from '../context/CartContext';
import { useOrders } from '../context/OrderContext';
import { getProductImageUrl } from '../utils/imageMap';
import Layout from '../components/Layout';
import logoIcon from '../assets/Vector - 0.svg';
import { useTheme } from '../context/ThemeContext';

const OrderTracking = () => {
  const { user, isLoggedIn } = useUser();
  const { getCartItemsCount } = useCart();
  const { getOrderById, orders } = useOrders();
  const { orderNumber } = useParams();
  const [searchParams] = useSearchParams();
  const { theme } = useTheme();
  const [searchOrderId, setSearchOrderId] = useState('');
  const [currentOrder, setCurrentOrder] = useState(null);
  const [searchError, setSearchError] = useState('');

  // Get order ID from URL params or search params
  const orderIdToSearch = orderNumber || searchParams.get('orderId');

  useEffect(() => {
    console.log('OrderTracking - useEffect triggered');
    console.log('OrderTracking - orderIdToSearch:', orderIdToSearch);
    console.log('OrderTracking - Available orders:', orders);
    
    if (orderIdToSearch) {
      const order = getOrderById(orderIdToSearch);
      console.log('OrderTracking - Found order in useEffect:', order);
      setCurrentOrder(order);
      setSearchOrderId(orderIdToSearch);
    }
  }, [orderIdToSearch, getOrderById, orders]);

  const handleSearch = () => {
    console.log('OrderTracking - Searching for order ID:', searchOrderId.trim()); // Debug log
    console.log('OrderTracking - Available orders:', orders); // Debug log
    
    if (searchOrderId.trim()) {
      const order = getOrderById(searchOrderId.trim());
      console.log('OrderTracking - Found order:', order); // Debug log
      setCurrentOrder(order);
      
      if (!order) {
        console.log('OrderTracking - Order not found, available order IDs:', orders.map(o => o.orderNumber)); // Debug log
        setSearchError('Order not found. Please check your order ID and try again.');
      } else {
        setSearchError('');
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Generate tracking ID
  const generateTrackingId = (orderNumber) => {
    return `TRK-${orderNumber.slice(-6)}-AUS`;
  };

  // Order status progression
  const getOrderStatusStep = (status) => {
    const statusMap = {
      'Processing': 1,
      'Prepared': 2, 
      'Shipped': 3,
      'Out for Delivery': 4,
      'Delivered': 5
    };
    return statusMap[status] || 1;
  };

  const orderStatuses = [
    { step: 1, label: 'Ordered', icon: '✓' },
    { step: 2, label: 'Prepared', icon: '📦' },
    { step: 3, label: 'Out for Delivery', icon: '🚚' },
    { step: 4, label: 'Delivered', icon: '✅' }
  ];

  const renderStatusProgress = () => {
    const currentStep = getOrderStatusStep(currentOrder?.status || 'Processing');
    
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '32px',
        padding: '0 20px'
      }}>
        {orderStatuses.map((status, index) => (
          <div key={status.step} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            {/* Status Circle */}
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: currentStep >= status.step ? theme.success : theme.border,
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              fontWeight: '600',
              marginBottom: '8px'
            }}>
              {currentStep >= status.step ? status.icon : status.step}
            </div>
            
            {/* Status Label */}
            <div style={{
              textAlign: 'center',
              marginLeft: '8px'
            }}>
              <div style={{
                fontSize: '14px',
                fontWeight: '500',
                color: currentStep >= status.step ? theme.success : theme.textMuted
              }}>
                {status.label}
              </div>
            </div>

            {/* Connecting Line */}
            {index < orderStatuses.length - 1 && (
              <div style={{
                flex: 1,
                height: '2px',
                backgroundColor: currentStep > status.step ? theme.success : theme.border,
                margin: '0 16px'
              }}></div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const formatPrice = (price) => {
    return `$${price.toFixed(2)}`;
  };

  return (
    <Layout>
      <div style={{
        backgroundColor: theme.background,
        minHeight: 'calc(100vh - 120px)',
        fontFamily: "'Space Grotesk', Arial, sans-serif",
        padding: '40px 20px'
      }}>
        {/* Breadcrumb */}
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          fontSize: '14px',
          color: theme.textSecondary,
          marginBottom: '24px'
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
          <span style={{ color: theme.textPrimary }}>Order Details</span>
        </div>

        {/* Main Content */}
        <main style={{
          display: 'flex',
          justifyContent: 'center'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '800px'
          }}>
            <h1 style={{
              fontSize: '32px',
              fontWeight: '700',
              color: theme.textPrimary,
              textAlign: 'center',
              marginBottom: '32px'
            }}>
              Track Your Order
            </h1>

            {!currentOrder ? (
              /* Search Interface */
              <div style={{
                backgroundColor: theme.cardBg,
                borderRadius: '12px',
                padding: '48px',
                textAlign: 'center',
                boxShadow: theme.shadow,
                border: `1px solid ${theme.border}`
              }}>
                <div style={{
                  maxWidth: '400px',
                  margin: '0 auto'
                }}>
                  <input
                    type="text"
                    placeholder="Order ID"
                    value={searchOrderId}
                    onChange={(e) => {
                      setSearchOrderId(e.target.value);
                      setSearchError(''); // Clear error when user types
                    }}
                    onKeyPress={handleKeyPress}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: `1px solid ${theme.border}`,
                      borderRadius: '8px',
                      fontSize: '16px',
                      marginBottom: '16px',
                      outline: 'none',
                      boxSizing: 'border-box',
                      backgroundColor: theme.inputBg,
                      color: theme.textPrimary,
                      transition: 'border-color 0.2s ease'
                    }}
                    onFocus={(e) => e.target.style.borderColor = theme.primary}
                    onBlur={(e) => e.target.style.borderColor = theme.border}
                  />
                  <button
                    onClick={handleSearch}
                    style={{
                      backgroundColor: theme.primary,
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '12px 24px',
                      fontSize: '16px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      width: '100%',
                      transition: 'background-color 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = theme.primaryHover}
                    onMouseLeave={(e) => e.target.style.backgroundColor = theme.primary}
                  >
                    Track Order
                  </button>
                  
                  {searchError && (
                    <div style={{
                      marginTop: '16px',
                      padding: '12px',
                      backgroundColor: theme.error + '20',
                      color: theme.error,
                      borderRadius: '8px',
                      fontSize: '14px',
                      border: `1px solid ${theme.error}50`
                    }}>
                      {searchError}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Order Details */
              <div style={{
                backgroundColor: theme.cardBg,
                borderRadius: '12px',
                padding: '40px',
                boxShadow: theme.shadow,
                border: `1px solid ${theme.border}`
              }}>
                {/* Order Header */}
                <div style={{
                  textAlign: 'center',
                  marginBottom: '32px',
                  paddingBottom: '32px',
                  borderBottom: `1px solid ${theme.border}`
                }}>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '16px',
                    marginBottom: '16px'
                  }}>
                    <div>
                      <span style={{ fontSize: '14px', color: theme.textSecondary, fontWeight: '500' }}>Order ID: </span>
                      <span style={{ fontSize: '14px', color: theme.textPrimary, fontWeight: '600' }}>{currentOrder.orderNumber}</span>
                    </div>
                    <div>
                      <span style={{ fontSize: '14px', color: theme.textSecondary, fontWeight: '500' }}>Tracking ID: </span>
                      <span style={{ fontSize: '14px', color: theme.textPrimary, fontWeight: '600' }}>{generateTrackingId(currentOrder.orderNumber)}</span>
                    </div>
                  </div>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '16px'
                  }}>
                    <div>
                      <span style={{ fontSize: '14px', color: theme.textSecondary, fontWeight: '500' }}>Estimated Delivery: </span>
                      <span style={{ fontSize: '14px', color: theme.textPrimary, fontWeight: '600' }}>{currentOrder.estimatedDelivery}</span>
                    </div>
                    <div>
                      <span style={{ fontSize: '14px', color: theme.textSecondary, fontWeight: '500' }}>Order Date: </span>
                      <span style={{ fontSize: '14px', color: theme.textPrimary, fontWeight: '600' }}>{currentOrder.date}</span>
                    </div>
                  </div>
                </div>

                {/* Order Status Progress */}
                <div style={{ marginBottom: '40px' }}>
                  <h2 style={{
                    fontSize: '20px',
                    fontWeight: '600',
                    color: theme.textPrimary,
                    marginBottom: '24px'
                  }}>
                    Order Status
                  </h2>
                  {renderStatusProgress()}
                </div>

                {/* Order Summary */}
                <div style={{ marginBottom: '32px' }}>
                  <h2 style={{
                    fontSize: '20px',
                    fontWeight: '600',
                    color: theme.textPrimary,
                    marginBottom: '24px'
                  }}>
                    Order Summary
                  </h2>

                  {/* Order Items */}
                  <div style={{ marginBottom: '24px' }}>
                    {currentOrder.items && currentOrder.items.map((item, index) => (
                      <div key={item.id || index} style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '16px 0',
                        borderBottom: index < currentOrder.items.length - 1 ? `1px solid ${theme.borderLight}` : 'none'
                      }}>
                        <div style={{
                          width: '60px',
                          height: '60px',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          marginRight: '16px',
                          backgroundColor: theme.placeholderBg,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {(() => {
                            const imageUrl = getProductImageUrl(item);
                            return imageUrl ? (
                              <img
                                src={imageUrl}
                                alt={item.name}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'contain'
                                }}
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.parentNode.innerHTML = `<div style="font-size: 20px; color: ${theme.textMuted};">📦</div>`;
                                }}
                              />
                            ) : (
                              <div style={{
                                fontSize: '20px',
                                color: theme.textMuted
                              }}>📦</div>
                            );
                          })()}
                        </div>

                        <div style={{ flex: 1 }}>
                          <h3 style={{
                            fontSize: '16px',
                            fontWeight: '600',
                            color: theme.textPrimary,
                            margin: '0 0 4px 0'
                          }}>
                            {item.name}
                          </h3>
                          <div style={{
                            fontSize: '14px',
                            color: theme.textSecondary
                          }}>
                            Quantity: {item.quantity}
                          </div>
                        </div>

                        <div style={{
                          fontSize: '16px',
                          fontWeight: '600',
                          color: theme.textPrimary
                        }}>
                          {formatPrice(item.price * item.quantity)}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Total */}
                  <div style={{
                    backgroundColor: theme.backgroundSecondary,
                    borderRadius: '8px',
                    padding: '16px'
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '8px'
                    }}>
                      <span style={{ fontSize: '14px', color: theme.textSecondary }}>Subtotal</span>
                      <span style={{ fontSize: '14px', color: theme.textPrimary }}>{formatPrice(currentOrder.total - 10)}</span>
                    </div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '8px'
                    }}>
                      <span style={{ fontSize: '14px', color: theme.textSecondary }}>Shipping</span>
                      <span style={{ fontSize: '14px', color: theme.success }}>Free</span>
                    </div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '8px'
                    }}>
                      <span style={{ fontSize: '14px', color: theme.textSecondary }}>Tax</span>
                      <span style={{ fontSize: '14px', color: theme.textPrimary }}>$0</span>
                    </div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      paddingTop: '8px',
                      borderTop: `1px solid ${theme.border}`,
                      fontWeight: '600'
                    }}>
                      <span style={{ fontSize: '16px', color: theme.textPrimary }}>Total</span>
                      <span style={{ fontSize: '16px', color: theme.textPrimary }}>{formatPrice(currentOrder.total)}</span>
                    </div>
                  </div>
                </div>

                {/* Back Button */}
                <div style={{ textAlign: 'center' }}>
                  <Link
                    to="/dashboard"
                    style={{
                      backgroundColor: theme.primary,
                      color: 'white',
                      textDecoration: 'none',
                      padding: '12px 32px',
                      borderRadius: '8px',
                      fontSize: '16px',
                      fontWeight: '600',
                      transition: 'background-color 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = theme.primaryHover}
                    onMouseLeave={(e) => e.target.style.backgroundColor = theme.primary}
                  >
                    Back to Dashboard
                  </Link>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </Layout>
  );
};

export default OrderTracking; 