import React, { useState, useEffect } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { SearchIcon, ShoppingCartIcon } from '../components/ui/icons';
import { useUser } from '../context/UserContext';
import { useCart } from '../context/CartContext';
import { useOrders } from '../context/OrderContext';
import logoIcon from '../assets/Vector - 0.svg';

const OrderTracking = () => {
  const { user, isLoggedIn } = useUser();
  const { getCartItemsCount } = useCart();
  const { getOrderById, orders } = useOrders();
  const { orderId } = useParams();
  const [searchParams] = useSearchParams();
  const [searchOrderId, setSearchOrderId] = useState('');
  const [currentOrder, setCurrentOrder] = useState(null);
  const [searchError, setSearchError] = useState('');

  // Get order ID from URL params or search params
  const orderIdToSearch = orderId || searchParams.get('orderId');

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
              backgroundColor: currentStep >= status.step ? '#16a34a' : '#e5e7eb',
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
                color: currentStep >= status.step ? '#16a34a' : '#6b7280'
              }}>
                {status.label}
              </div>
            </div>

            {/* Connecting Line */}
            {index < orderStatuses.length - 1 && (
              <div style={{
                flex: 1,
                height: '2px',
                backgroundColor: currentStep > status.step ? '#16a34a' : '#e5e7eb',
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

          {/* User Status Display */}
          {isLoggedIn ? (
            <Link to="/dashboard" style={{
              fontSize: '14px',
              fontWeight: '500',
              color: '#121417',
              textDecoration: 'none',
              padding: '8px 16px',
              borderRadius: '8px',
              backgroundColor: '#f0f2f5'
            }}>
              Hi, {user.firstName}
            </Link>
          ) : (
            <Link to="/login" style={{
              fontSize: '14px',
              fontWeight: '500',
              color: '#121417',
              textDecoration: 'none',
              padding: '8px 16px',
              borderRadius: '8px',
              backgroundColor: '#f0f2f5'
            }}>
              Log in
            </Link>
          )}

          {/* Cart Icon */}
          <Link to="/cart" style={{
            position: 'relative',
            padding: '8px',
            backgroundColor: '#f0f2f5',
            borderRadius: '8px',
            textDecoration: 'none'
          }}>
            <ShoppingCartIcon style={{ width: '17px', height: '17px', color: '#121417' }} />
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
          maxWidth: '800px'
        }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: '700',
            color: '#121417',
            margin: '0 0 32px 0',
            textAlign: 'center'
          }}>
            Track your order
          </h1>

          {!currentOrder ? (
            /* Search Interface */
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '48px',
              textAlign: 'center',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
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
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '16px',
                    marginBottom: '16px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
                <button
                  onClick={handleSearch}
                  style={{
                    backgroundColor: '#0D80F2',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '12px 32px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    width: '100%'
                  }}
                >
                  SEARCH
                </button>
                
                {/* Error Message */}
                {searchError && (
                  <div style={{
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fecaca',
                    color: '#dc2626',
                    padding: '12px',
                    borderRadius: '8px',
                    marginTop: '16px',
                    fontSize: '14px'
                  }}>
                    {searchError}
                  </div>
                )}
                
                <p style={{
                  fontSize: '14px',
                  color: '#6b7280',
                  marginTop: '16px',
                  lineHeight: 1.5
                }}>
                  Enter your Order ID to view its current status or browse your past orders below.
                </p>
              </div>
            </div>
          ) : (
            /* Order Details */
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '40px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
            }}>
              {/* Order Info */}
              <div style={{
                marginBottom: '32px',
                paddingBottom: '24px',
                borderBottom: '1px solid #e5e7eb'
              }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '16px',
                  marginBottom: '16px'
                }}>
                  <div>
                    <span style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>Order ID: </span>
                    <span style={{ fontSize: '14px', color: '#121417', fontWeight: '600' }}>{currentOrder.orderNumber}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>Tracking ID: </span>
                    <span style={{ fontSize: '14px', color: '#121417', fontWeight: '600' }}>{generateTrackingId(currentOrder.orderNumber)}</span>
                  </div>
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '16px'
                }}>
                  <div>
                    <span style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>Estimated Delivery: </span>
                    <span style={{ fontSize: '14px', color: '#121417', fontWeight: '600' }}>{currentOrder.estimatedDelivery}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>Order Date: </span>
                    <span style={{ fontSize: '14px', color: '#121417', fontWeight: '600' }}>{currentOrder.date}</span>
                  </div>
                </div>
              </div>

              {/* Order Status Progress */}
              <div style={{ marginBottom: '40px' }}>
                <h2 style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  color: '#121417',
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
                  color: '#121417',
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
                      borderBottom: index < currentOrder.items.length - 1 ? '1px solid #f3f4f6' : 'none'
                    }}>
                      <div style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        marginRight: '16px',
                        backgroundColor: '#f8f9fa',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'contain'
                            }}
                          />
                        ) : (
                          <div style={{
                            fontSize: '24px',
                            color: '#9ca3af'
                          }}>📦</div>
                        )}
                      </div>

                      <div style={{ flex: 1 }}>
                        <h3 style={{
                          fontSize: '16px',
                          fontWeight: '600',
                          color: '#121417',
                          margin: '0 0 4px 0'
                        }}>
                          {item.name}
                        </h3>
                        <div style={{
                          fontSize: '14px',
                          color: '#6b7280'
                        }}>
                          Quantity: {item.quantity}
                        </div>
                      </div>

                      <div style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        color: '#121417'
                      }}>
                        {formatPrice(item.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Total */}
                <div style={{
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px',
                  padding: '16px'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '8px'
                  }}>
                    <span style={{ fontSize: '14px', color: '#6b7280' }}>Subtotal</span>
                    <span style={{ fontSize: '14px', color: '#121417' }}>{formatPrice(currentOrder.total - 10)}</span>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '8px'
                  }}>
                    <span style={{ fontSize: '14px', color: '#6b7280' }}>Shipping</span>
                    <span style={{ fontSize: '14px', color: '#16a34a' }}>Free</span>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '8px'
                  }}>
                    <span style={{ fontSize: '14px', color: '#6b7280' }}>Tax</span>
                    <span style={{ fontSize: '14px', color: '#121417' }}>$0</span>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    paddingTop: '8px',
                    borderTop: '1px solid #e5e7eb',
                    fontWeight: '600'
                  }}>
                    <span style={{ fontSize: '16px', color: '#121417' }}>Total</span>
                    <span style={{ fontSize: '16px', color: '#121417' }}>{formatPrice(currentOrder.total)}</span>
                  </div>
                </div>
              </div>

              {/* Back Button */}
              <div style={{ textAlign: 'center' }}>
                <Link
                  to="/dashboard"
                  style={{
                    backgroundColor: '#0D80F2',
                    color: 'white',
                    textDecoration: 'none',
                    padding: '12px 32px',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '600'
                  }}
                >
                  Back
                </Link>
              </div>
            </div>
          )}
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

export default OrderTracking; 