import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useOrders } from '../context/OrderContext';
import { useTheme } from '../context/ThemeContext';
import { getProductImageUrl } from '../utils/imageMap';
import Layout from '../components/Layout';

const OrderDetail = () => {
  const { orderId } = useParams();
  const { user, isLoggedIn } = useUser();
  const { getOrderById } = useOrders();
  const { theme } = useTheme();
  const navigate = useNavigate();
  
  const order = getOrderById(orderId);

  // Redirect if not logged in
  if (!isLoggedIn) {
    navigate('/login?redirect=dashboard');
    return null;
  }

  // Order not found
  if (!order) {
    return (
      <Layout>
        <div style={{
          backgroundColor: theme.background,
          minHeight: 'calc(100vh - 140px)',
          fontFamily: "'Space Grotesk', Arial, sans-serif",
          padding: '40px 20px'
        }}>
          <div style={{
            maxWidth: '800px',
            margin: '0 auto',
            textAlign: 'center',
            backgroundColor: theme.cardBg,
            padding: '40px',
            borderRadius: '8px',
            border: `1px solid ${theme.border}`
          }}>
            <h2 style={{ color: theme.textPrimary, marginBottom: '16px' }}>
              Order Not Found
            </h2>
            <p style={{ color: theme.textSecondary, marginBottom: '24px' }}>
              The order you're looking for doesn't exist or you don't have permission to view it.
            </p>
            <Link
              to="/dashboard"
              style={{
                backgroundColor: theme.primary,
                color: 'white',
                textDecoration: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600'
              }}
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const formatPrice = (price) => {
    return `$${price?.toFixed(2) || '0.00'}`;
  };

  const renderStatusBadge = (status) => {
    const statusColors = {
      'Processing': { bg: '#fff3cd', color: '#856404', border: '#ffeaa7' },
      'Prepared': { bg: '#d1ecf1', color: '#0c5460', border: '#bee5eb' },
      'Shipped': { bg: '#d4edda', color: '#155724', border: '#c3e6cb' },
      'Out for Delivery': { bg: '#cff4fc', color: '#055160', border: '#b6f0fc' },
      'Delivered': { bg: '#d1e7dd', color: '#0f5132', border: '#badbcc' },
      'Cancelled': { bg: '#f8d7da', color: '#721c24', border: '#f5c6cb' }
    };

    const colors = statusColors[status] || statusColors['Processing'];

    return (
      <span style={{
        backgroundColor: colors.bg,
        color: colors.color,
        border: `1px solid ${colors.border}`,
        padding: '4px 12px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '500'
      }}>
        {status}
      </span>
    );
  };

  // Order status timeline component
  const renderOrderStatusTimeline = () => {
    const statusSteps = [
      {
        key: 'Processing',
        title: 'Order Received',
        description: 'Order confirmed and being processed',
        icon: '✅',
        date: order.date
      },
      {
        key: 'Prepared',
        title: 'Order Prepared',
        description: 'Items packed and ready for shipment',
        icon: '📦',
        date: order.status === 'Processing' ? null : order.date // Mock date for demo
      },
      {
        key: 'Shipped',
        title: 'Shipped',
        description: 'Package is on its way',
        icon: '🚚',
        date: ['Shipped', 'Out for Delivery', 'Delivered'].includes(order.status) ? order.date : null
      },
      {
        key: 'Out for Delivery',
        title: 'Out for Delivery',
        description: 'Package is out for delivery',
        icon: '🚛',
        date: ['Out for Delivery', 'Delivered'].includes(order.status) ? order.date : null
      },
      {
        key: 'Delivered',
        title: 'Delivered',
        description: 'Package delivered successfully',
        icon: '🎉',
        date: order.status === 'Delivered' ? order.date : null
      }
    ];

    // Find current step index
    const currentStepIndex = statusSteps.findIndex(step => step.key === order.status);
    const isOrderCancelled = order.status === 'Cancelled';

    return (
      <div style={{
        backgroundColor: theme.cardBg,
        borderRadius: '8px',
        padding: '32px',
        marginBottom: '24px',
        border: `1px solid ${theme.border}`
      }}>
        <h2 style={{
          fontSize: '20px',
          fontWeight: '600',
          color: theme.textPrimary,
          marginBottom: '24px'
        }}>
          Order Status
        </h2>

        {isOrderCancelled ? (
          // Cancelled status display
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            backgroundColor: '#f8d7da',
            borderRadius: '8px',
            border: '1px solid #f5c6cb'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>❌</div>
            <h3 style={{ color: '#721c24', marginBottom: '8px' }}>Order Cancelled</h3>
            <p style={{ color: '#721c24', margin: 0 }}>
              This order has been cancelled. If you have any questions, please contact support.
            </p>
          </div>
        ) : (
          // Normal status timeline
          <div style={{ position: 'relative' }}>
            {/* Progress line */}
            <div style={{
              position: 'absolute',
              left: '24px',
              top: '32px',
              bottom: '32px',
              width: '2px',
              backgroundColor: theme.border,
              zIndex: 1
            }}>
              {/* Active progress line */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${currentStepIndex >= 0 ? ((currentStepIndex + 1) / statusSteps.length) * 100 : 0}%`,
                backgroundColor: theme.success,
                transition: 'height 0.3s ease'
              }} />
            </div>

            {/* Status steps */}
            {statusSteps.map((step, index) => {
              const isCompleted = index <= currentStepIndex;
              const isCurrent = index === currentStepIndex;
              const isUpcoming = index > currentStepIndex;

              return (
                <div key={step.key} style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '20px',
                  marginBottom: index < statusSteps.length - 1 ? '32px' : '0',
                  position: 'relative',
                  zIndex: 2
                }}>
                  {/* Status icon */}
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    backgroundColor: isCompleted ? theme.success : 
                                   isCurrent ? theme.warning : 
                                   theme.backgroundSecondary,
                    border: `3px solid ${isCompleted ? theme.success : 
                                        isCurrent ? theme.warning : 
                                        theme.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    transition: 'all 0.3s ease',
                    boxShadow: isCurrent ? `0 0 0 4px ${theme.warning}20` : 'none'
                  }}>
                    {isCompleted ? '✅' : isCurrent ? step.icon : '⏳'}
                  </div>

                  {/* Status content */}
                  <div style={{ flex: 1, paddingTop: '4px' }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '4px'
                    }}>
                      <h3 style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        color: isCompleted || isCurrent ? theme.textPrimary : theme.textMuted,
                        margin: 0
                      }}>
                        {step.title}
                      </h3>
                      {step.date && (
                        <span style={{
                          fontSize: '12px',
                          color: theme.textSecondary,
                          backgroundColor: theme.backgroundSecondary,
                          padding: '2px 8px',
                          borderRadius: '12px'
                        }}>
                          {step.date}
                        </span>
                      )}
                    </div>
                    <p style={{
                      fontSize: '14px',
                      color: isCompleted || isCurrent ? theme.textSecondary : theme.textMuted,
                      margin: 0,
                      opacity: isUpcoming ? 0.6 : 1
                    }}>
                      {step.description}
                    </p>
                    {isCurrent && (
                      <div style={{
                        marginTop: '8px',
                        padding: '8px 12px',
                        backgroundColor: theme.warning + '20',
                        borderRadius: '6px',
                        border: `1px solid ${theme.warning}50`
                      }}>
                        <div style={{
                          fontSize: '12px',
                          fontWeight: '500',
                          color: theme.warning,
                          marginBottom: '4px'
                        }}>
                          Current Status
                        </div>
                        {order.status === 'Processing' && (
                          <div style={{ fontSize: '12px', color: theme.textSecondary }}>
                            Your order is being processed and will be prepared for shipment soon.
                          </div>
                        )}
                        {order.status === 'Prepared' && (
                          <div style={{ fontSize: '12px', color: theme.textSecondary }}>
                            Your order has been packed and is ready for pickup by the shipping carrier.
                          </div>
                        )}
                        {order.status === 'Shipped' && (
                          <div style={{ fontSize: '12px', color: theme.textSecondary }}>
                            Your package is on its way! Expected delivery: {order.estimatedDelivery}
                          </div>
                        )}
                        {order.status === 'Out for Delivery' && (
                          <div style={{ fontSize: '12px', color: theme.textSecondary }}>
                            Your package is out for delivery and should arrive today!
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Estimated delivery info */}
            {!isOrderCancelled && order.estimatedDelivery && (
              <div style={{
                marginTop: '24px',
                padding: '16px',
                backgroundColor: theme.primary + '10',
                borderRadius: '8px',
                border: `1px solid ${theme.primary}30`,
                textAlign: 'center'
              }}>
                <div style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: theme.primary,
                  marginBottom: '4px'
                }}>
                  📅 Estimated Delivery
                </div>
                <div style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: theme.textPrimary
                }}>
                  {order.estimatedDelivery}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <Layout>
      <div style={{
        backgroundColor: theme.background,
        minHeight: '100vh',
        fontFamily: "'Space Grotesk', Arial, sans-serif",
        paddingBottom: '60px'
      }}>
        {/* Breadcrumb */}
        <div style={{
          backgroundColor: theme.cardBg,
          borderBottom: `1px solid ${theme.border}`
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '20px 40px',
            fontSize: '14px',
            color: theme.textSecondary
          }}>
            <Link to="/" style={{ color: theme.textSecondary, textDecoration: 'none' }}>Home</Link>
            <span style={{ margin: '0 8px' }}>/</span>
            <Link to="/dashboard" style={{ color: theme.textSecondary, textDecoration: 'none' }}>Dashboard</Link>
            <span style={{ margin: '0 8px' }}>/</span>
            <span style={{ color: theme.textPrimary }}>Order {order.orderNumber}</span>
          </div>
        </div>

        {/* Main Content */}
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '40px',
          paddingBottom: '80px'
        }}>
          {/* Order Header */}
          <div style={{
            backgroundColor: theme.cardBg,
            borderRadius: '8px',
            padding: '32px',
            marginBottom: '24px',
            border: `1px solid ${theme.border}`
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '24px'
            }}>
              <div>
                <h1 style={{
                  fontSize: '32px',
                  fontWeight: '700',
                  color: theme.textPrimary,
                  marginBottom: '8px'
                }}>
                  Order {order.orderNumber}
                </h1>
                <p style={{
                  fontSize: '16px',
                  color: theme.textSecondary,
                  margin: 0
                }}>
                  Placed on {order.date}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                {renderStatusBadge(order.status)}
                <div style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: theme.textPrimary,
                  marginTop: '8px'
                }}>
                  Total: {formatPrice(order.total)}
                </div>
              </div>
            </div>

            {/* Order Summary Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '24px'
            }}>
              <div>
                <h3 style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: theme.textSecondary,
                  marginBottom: '8px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Order Date
                </h3>
                <p style={{ fontSize: '16px', color: theme.textPrimary, margin: 0 }}>
                  {order.date}
                </p>
              </div>
              <div>
                <h3 style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: theme.textSecondary,
                  marginBottom: '8px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Payment Method
                </h3>
                <p style={{ fontSize: '16px', color: theme.textPrimary, margin: 0 }}>
                  {order.paymentMethod === 'card' ? 'Credit/Debit Card' : 
                   order.paymentMethod === 'paypal' ? 'PayPal' : 
                   order.paymentMethod === 'apple_pay' ? 'Apple Pay' : 'Credit Card'}
                </p>
              </div>
              <div>
                <h3 style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: theme.textSecondary,
                  marginBottom: '8px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Items
                </h3>
                <p style={{ fontSize: '16px', color: theme.textPrimary, margin: 0 }}>
                  {order.items?.length || 0} items
                </p>
              </div>
            </div>
          </div>

          {/* Order Status Timeline */}
          {renderOrderStatusTimeline()}

          {/* Content Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr',
            gap: '24px'
          }}>
            {/* Order Items */}
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
                <h2 style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  color: theme.textPrimary,
                  margin: 0
                }}>
                  Items Ordered
                </h2>
              </div>
              <div style={{ padding: '24px' }}>
                {order.items?.map((item, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    gap: '16px',
                    padding: '16px 0',
                    borderBottom: index < order.items.length - 1 ? `1px solid ${theme.border}` : 'none'
                  }}>
                    <div style={{
                      width: '80px',
                      height: '80px',
                      backgroundColor: theme.backgroundSecondary,
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden'
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
                              e.target.parentNode.innerHTML = '<div style="font-size: 24px; color: #607589;">📦</div>';
                            }}
                          />
                        ) : (
                          <div style={{ fontSize: '24px', color: theme.textMuted }}>📦</div>
                        );
                      })()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        color: theme.textPrimary,
                        marginBottom: '8px'
                      }}>
                        {item.name}
                      </h3>
                      <p style={{
                        fontSize: '14px',
                        color: theme.textSecondary,
                        marginBottom: '8px'
                      }}>
                        Quantity: {item.quantity}
                      </p>
                      <p style={{
                        fontSize: '14px',
                        color: theme.textSecondary,
                        margin: 0
                      }}>
                        Unit Price: {formatPrice(item.price)}
                      </p>
                    </div>
                    <div style={{
                      textAlign: 'right'
                    }}>
                      <div style={{
                        fontSize: '18px',
                        fontWeight: '600',
                        color: theme.textPrimary
                      }}>
                        {formatPrice(item.price * item.quantity)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary and Address */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Order Summary */}
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
                  <h2 style={{
                    fontSize: '20px',
                    fontWeight: '600',
                    color: theme.textPrimary,
                    margin: 0
                  }}>
                    Order Summary
                  </h2>
                </div>
                <div style={{ padding: '24px' }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '12px'
                  }}>
                    <span style={{ fontSize: '14px', color: theme.textSecondary }}>Subtotal:</span>
                    <span style={{ fontSize: '14px', color: theme.textPrimary }}>{formatPrice(order.subtotal)}</span>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '12px'
                  }}>
                    <span style={{ fontSize: '14px', color: theme.textSecondary }}>Shipping:</span>
                    <span style={{ fontSize: '14px', color: theme.textPrimary }}>
                      {order.shipping === 0 ? 'Free' : formatPrice(order.shipping)}
                    </span>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '16px'
                  }}>
                    <span style={{ fontSize: '14px', color: theme.textSecondary }}>Tax:</span>
                    <span style={{ fontSize: '14px', color: theme.textPrimary }}>{formatPrice(order.tax)}</span>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    paddingTop: '16px',
                    borderTop: `2px solid ${theme.border}`
                  }}>
                    <span style={{ fontSize: '18px', fontWeight: '700', color: theme.textPrimary }}>Total:</span>
                    <span style={{ fontSize: '18px', fontWeight: '700', color: theme.textPrimary }}>{formatPrice(order.total)}</span>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              {order.shippingAddress && (
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
                    <h2 style={{
                      fontSize: '20px',
                      fontWeight: '600',
                      color: theme.textPrimary,
                      margin: 0
                    }}>
                      Shipping Address
                    </h2>
                  </div>
                  <div style={{ padding: '24px' }}>
                    <div style={{
                      fontSize: '16px',
                      color: theme.textPrimary,
                      lineHeight: '1.5'
                    }}>
                      {order.shippingAddress.fullName && (
                        <div style={{ fontWeight: '600', marginBottom: '8px' }}>
                          {order.shippingAddress.fullName}
                        </div>
                      )}
                      <div>{order.shippingAddress.street}</div>
                      <div>
                        {[order.shippingAddress.city, order.shippingAddress.state, order.shippingAddress.postalCode]
                          .filter(Boolean)
                          .join(', ')}
                      </div>
                      <div>{order.shippingAddress.country}</div>
                      {order.shippingAddress.phone && (
                        <div style={{ marginTop: '8px', fontSize: '14px', color: theme.textSecondary }}>
                          Phone: {order.shippingAddress.phone}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Billing Address (if different) */}
              {order.billingAddress && order.shippingAddress && 
               JSON.stringify(order.billingAddress) !== JSON.stringify(order.shippingAddress) && (
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
                    <h2 style={{
                      fontSize: '20px',
                      fontWeight: '600',
                      color: theme.textPrimary,
                      margin: 0
                    }}>
                      Billing Address
                    </h2>
                  </div>
                  <div style={{ padding: '24px' }}>
                    <div style={{
                      fontSize: '16px',
                      color: theme.textPrimary,
                      lineHeight: '1.5'
                    }}>
                      {order.billingAddress.fullName && (
                        <div style={{ fontWeight: '600', marginBottom: '8px' }}>
                          {order.billingAddress.fullName}
                        </div>
                      )}
                      <div>{order.billingAddress.street}</div>
                      <div>
                        {[order.billingAddress.city, order.billingAddress.state, order.billingAddress.postalCode]
                          .filter(Boolean)
                          .join(', ')}
                      </div>
                      <div>{order.billingAddress.country}</div>
                      {order.billingAddress.phone && (
                        <div style={{ marginTop: '8px', fontSize: '14px', color: theme.textSecondary }}>
                          Phone: {order.billingAddress.phone}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            gap: '16px',
            justifyContent: 'center',
            marginTop: '40px',
            paddingTop: '40px',
            borderTop: `1px solid ${theme.border}`
          }}>
            <Link
              to="/dashboard"
              style={{
                backgroundColor: theme.backgroundSecondary,
                color: theme.textPrimary,
                textDecoration: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                border: `1px solid ${theme.border}`,
                transition: 'all 0.2s ease'
              }}
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default OrderDetail; 