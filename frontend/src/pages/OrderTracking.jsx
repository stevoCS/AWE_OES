import React, { useState, useEffect } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { SearchIcon, ShoppingCartIcon } from '../components/ui/icons';
import { useUser } from '../context/UserContext';
import { useCart } from '../context/CartContext';
import { useOrders } from '../context/OrderContext';
import { ordersAPI } from '../api/config';
import { getProductImageUrl } from '../utils/imageMap';
import Layout from '../components/Layout';
import logoIcon from '../assets/Vector - 0.svg';
import { useTheme } from '../context/ThemeContext';

// Add CSS for spin animation
const spinKeyframes = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

// Inject styles
if (typeof document !== 'undefined' && !document.getElementById('orderTracking-styles')) {
  const style = document.createElement('style');
  style.id = 'orderTracking-styles';
  style.textContent = spinKeyframes;
  document.head.appendChild(style);
}

const OrderTracking = () => {
  const { user, isLoggedIn } = useUser();
  const { getCartItemsCount } = useCart();
  const { getOrderById, orders, loadOrdersFromBackend } = useOrders();
  const { orderNumber } = useParams();
  const [searchParams] = useSearchParams();
  const { theme } = useTheme();
  const [searchOrderId, setSearchOrderId] = useState('');
  const [currentOrder, setCurrentOrder] = useState(null);
  const [searchError, setSearchError] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Get order ID from URL params or search params
  const orderIdToSearch = orderNumber || searchParams.get('orderId');

  // Real-time order fetching function
  const fetchLatestOrderStatus = async (orderNum) => {
    if (!orderNum || !isLoggedIn) return null;
    
    try {
      console.log('OrderTracking - Fetching latest status for order:', orderNum);
      const response = await ordersAPI.getOrderByNumber(orderNum);
      
      if (response.success && response.data) {
        console.log('OrderTracking - Raw backend data:', response.data);
        
        // Map backend status to frontend status
        const statusMapping = {
          'pending': 'Processing',
          'paid': 'Processing', 
          'processing': 'Processing',
          'shipped': 'Shipped',
          'delivered': 'Delivered',
          'cancelled': 'Cancelled',
          'refunded': 'Cancelled'
        };

        // Map backend item structure to frontend structure with better error handling
        const mappedItems = (response.data.items || []).map((item, index) => {
          console.log(`Mapping item ${index}:`, item);
          
          // Create a better image mapping based on product name
          let imageHint = null;
          const productName = (item.product_name || '').toLowerCase();
          
          if (productName.includes('laptop') || productName.includes('ultrabook')) {
            imageHint = '/src/assets/laptop.png';
          } else if (productName.includes('phone')) {
            imageHint = '/src/assets/Phone.png';
          } else if (productName.includes('speaker')) {
            imageHint = '/src/assets/Speaker.png';
          } else if (productName.includes('watch')) {
            imageHint = '/src/assets/smartwatch.png';
          } else if (productName.includes('mouse')) {
            imageHint = '/src/assets/Wireless mouse.png';
          } else if (productName.includes('charger')) {
            imageHint = '/src/assets/Well charger.png';
          } else if (productName.includes('vr') || productName.includes('headset')) {
            imageHint = '/src/assets/VR Headset.png';
          } else if (productName.includes('keyboard')) {
            imageHint = '/src/assets/Keyboard.png';
          }

          const mappedItem = {
            id: item.product_id || `item-${index}`,
            name: item.product_name || 'Unknown Product',
            price: Number(item.product_price) || 0,
            quantity: Number(item.quantity) || 1,
            // Add additional properties for image mapping
            productId: item.product_id,
            images: imageHint ? [imageHint] : [],
            image: imageHint
          };
          
          console.log(`Mapped item ${index}:`, mappedItem);
          return mappedItem;
        });

        // Safely extract numeric values with fallbacks
        const totalAmount = Number(response.data.total_amount) || 0;
        const subtotalAmount = Number(response.data.subtotal) || 0;
        const taxAmount = Number(response.data.tax_amount) || 0;
        const shippingAmount = Number(response.data.shipping_fee) || 0;
        
        // Calculate subtotal from items if not provided
        const calculatedSubtotal = subtotalAmount || mappedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        const backendOrder = {
          id: response.data.order_number,
          orderNumber: response.data.order_number,
          date: new Date(response.data.created_at).toLocaleDateString(),
          total: totalAmount,
          status: statusMapping[response.data.status] || 'Processing',
          estimatedDelivery: response.data.expected_delivery_date ? 
            new Date(response.data.expected_delivery_date).toLocaleDateString() : 
            new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
          items: mappedItems,
          createdAt: response.data.created_at,
          shippingAddress: {
            fullName: response.data.shipping_address?.recipient_name || 'Customer',
            phone: response.data.shipping_address?.phone || '',
            street: response.data.shipping_address?.address_line1 || '',
            city: response.data.shipping_address?.city || '',
            state: response.data.shipping_address?.state || '',
            postalCode: response.data.shipping_address?.postal_code || '',
            country: response.data.shipping_address?.country || 'Australia'
          },
          paymentMethod: response.data.payment_method || 'Credit Card',
          subtotal: calculatedSubtotal,
          tax: taxAmount,
          shipping: shippingAmount
        };
        
        console.log('OrderTracking - Final mapped order:', backendOrder);
        return backendOrder;
      }
    } catch (error) {
      console.warn('OrderTracking - Failed to fetch latest status:', error);
    }
    return null;
  };

  useEffect(() => {
    console.log('OrderTracking - useEffect triggered');
    console.log('OrderTracking - orderIdToSearch:', orderIdToSearch);
    console.log('OrderTracking - Available orders:', orders);
    
    if (orderIdToSearch) {
      // First try to get from local context (like OrderDetail.jsx does)
      const localOrder = getOrderById(orderIdToSearch);
      console.log('OrderTracking - Found local order:', localOrder);
      
      if (localOrder) {
        // Use local order data (this is the working approach from OrderDetail.jsx)
        setCurrentOrder(localOrder);
        setSearchOrderId(orderIdToSearch);
        console.log('OrderTracking - Using local order data (like OrderDetail.jsx)');
      } else {
        // Only fetch from backend if local order not found
        console.log('OrderTracking - Local order not found, trying backend...');
        if (isLoggedIn) {
          fetchLatestOrderStatus(orderIdToSearch).then(latestOrder => {
            if (latestOrder) {
              setCurrentOrder(latestOrder);
              console.log('OrderTracking - Order fetched from backend');
            }
          });
        }
      }
    }
  }, [orderIdToSearch, getOrderById, orders, isLoggedIn]);

  const handleSearch = async () => {
    console.log('OrderTracking - Searching for order ID:', searchOrderId.trim());
    
    if (searchOrderId.trim()) {
      setIsRefreshing(true);
      setSearchError('');
      
      // First try local orders (like OrderDetail.jsx)
      const localOrder = getOrderById(searchOrderId.trim());
      console.log('OrderTracking - Found local order:', localOrder);
      
      if (localOrder) {
        // Use local order data (this is what works in OrderDetail.jsx)
        setCurrentOrder(localOrder);
        console.log('OrderTracking - Using local order data (success!)');
        setIsRefreshing(false);
        return;
      }
      
      // Only try backend if local order not found and user is logged in
      if (isLoggedIn) {
        console.log('OrderTracking - Local order not found, trying backend...');
        const latestOrder = await fetchLatestOrderStatus(searchOrderId.trim());
        if (latestOrder) {
          setCurrentOrder(latestOrder);
          console.log('OrderTracking - Using backend order data');
        } else {
          setSearchError('Order not found. Please check your order ID and try again.');
        }
      } else {
        setSearchError('Order not found. Please check your order ID and try again.');
      }
      
      setIsRefreshing(false);
    }
  };

  // Auto-refresh function
  const refreshOrderStatus = async () => {
    if (!currentOrder || !isLoggedIn) return;
    
    setIsRefreshing(true);
    console.log('OrderTracking - Refreshing order status...');
    
    // First check local data again
    const localOrder = getOrderById(currentOrder.orderNumber);
    if (localOrder) {
      console.log('OrderTracking - Refreshed with local data');
      setCurrentOrder(localOrder);
    }
    
    // Then try to get latest from backend
    const latestOrder = await fetchLatestOrderStatus(currentOrder.orderNumber);
    if (latestOrder) {
      console.log('OrderTracking - Updated with backend data');
      setCurrentOrder(latestOrder);
      
      // Optionally: update the OrderContext with latest data
      // This would require adding an updateOrder method to OrderContext
    }
    
    setIsRefreshing(false);
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
                padding: '48px',
                textAlign: 'left',
                boxShadow: theme.shadow,
                border: `1px solid ${theme.border}`
              }}>
                {/* Order Summary */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '32px'
                }}>
                  <div>
                    <div style={{
                      fontSize: '20px',
                      fontWeight: '600',
                      color: theme.textPrimary,
                      marginBottom: '8px'
                    }}>
                      Order #{currentOrder.orderNumber}
                    </div>
                    <div style={{
                      fontSize: '16px',
                      color: theme.textSecondary
                    }}>
                      Placed on {currentOrder.date}
                    </div>
                  </div>
                  <div style={{
                    fontSize: '16px',
                    color: theme.textSecondary
                  }}>
                    Total: {formatPrice(currentOrder.total)}
                  </div>
                </div>

                {/* Order Status */}
                <div style={{ marginBottom: '32px' }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '24px'
                  }}>
                    <h2 style={{
                      fontSize: '20px',
                      fontWeight: '600',
                      color: theme.textPrimary,
                      margin: 0
                    }}>
                      Order Status
                    </h2>
                    {isLoggedIn && (
                      <button
                        onClick={refreshOrderStatus}
                        disabled={isRefreshing}
                        style={{
                          backgroundColor: isRefreshing ? theme.border : theme.primary,
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '8px 16px',
                          fontSize: '14px',
                          fontWeight: '500',
                          cursor: isRefreshing ? 'not-allowed' : 'pointer',
                          transition: 'background-color 0.2s ease',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                        onMouseEnter={(e) => {
                          if (!isRefreshing) e.target.style.backgroundColor = theme.primaryHover;
                        }}
                        onMouseLeave={(e) => {
                          if (!isRefreshing) e.target.style.backgroundColor = theme.primary;
                        }}
                      >
                        {isRefreshing ? (
                          <>
                            <span style={{ 
                              display: 'inline-block',
                              width: '12px',
                              height: '12px',
                              border: '2px solid transparent',
                              borderTop: '2px solid white',
                              borderRadius: '50%',
                              animation: 'spin 1s linear infinite'
                            }}></span>
                            Refreshing...
                          </>
                        ) : (
                          <>🔄 Refresh Status</>
                        )}
                      </button>
                    )}
                  </div>
                  {renderStatusProgress()}
                </div>

                {/* Order Items */}
                <div style={{
                  marginBottom: '32px'
                }}>
                  <h2 style={{
                    fontSize: '20px',
                    fontWeight: '600',
                    color: theme.textPrimary,
                    marginBottom: '16px'
                  }}>
                    Order Items
                  </h2>
                  {currentOrder.items && currentOrder.items.length > 0 ? (
                    currentOrder.items.map((item, index) => (
                      <div key={item.id || index} style={{
                        display: 'flex',
                        alignItems: 'center',
                        marginBottom: '16px',
                        padding: '16px',
                        backgroundColor: theme.backgroundSecondary,
                        borderRadius: '8px',
                        border: `1px solid ${theme.border}`
                      }}>
                        <div style={{
                          width: '80px',
                          height: '80px',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          marginRight: '16px',
                          backgroundColor: theme.placeholderBg,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {(() => {
                            console.log('Rendering image for item:', item);
                            const imageUrl = getProductImageUrl(item);
                            console.log('Image URL found:', imageUrl);
                            return imageUrl ? (
                              <img
                                src={imageUrl}
                                alt={item.name || 'Product'}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'contain'
                                }}
                                onError={(e) => {
                                  console.log('Image failed to load:', imageUrl);
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
                          <div style={{
                            fontSize: '16px',
                            fontWeight: '600',
                            color: theme.textPrimary,
                            marginBottom: '4px'
                          }}>
                            {item.name || 'Unknown Product'}
                          </div>
                          <div style={{
                            fontSize: '14px',
                            color: theme.textSecondary,
                            marginBottom: '4px'
                          }}>
                            Quantity: {item.quantity || 1}
                          </div>
                          <div style={{
                            fontSize: '14px',
                            color: theme.textSecondary
                          }}>
                            Unit Price: {formatPrice(item.price || 0)}
                          </div>
                        </div>
                        <div style={{
                          fontSize: '16px',
                          fontWeight: '600',
                          color: theme.textPrimary,
                          textAlign: 'right'
                        }}>
                          {formatPrice((item.price || 0) * (item.quantity || 1))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{
                      textAlign: 'center',
                      padding: '32px',
                      color: theme.textSecondary
                    }}>
                      No items found in this order.
                    </div>
                  )}
                </div>

                {/* Shipping Address */}
                <div style={{
                  marginBottom: '32px'
                }}>
                  <h2 style={{
                    fontSize: '20px',
                    fontWeight: '600',
                    color: theme.textPrimary,
                    marginBottom: '16px'
                  }}>
                    Shipping Address
                  </h2>
                  <div style={{
                    fontSize: '16px',
                    color: theme.textSecondary
                  }}>
                    {currentOrder.shippingAddress.fullName}<br />
                    {currentOrder.shippingAddress.street}<br />
                    {currentOrder.shippingAddress.city}, {currentOrder.shippingAddress.state} {currentOrder.shippingAddress.postalCode}<br />
                    {currentOrder.shippingAddress.country}<br />
                    Phone: {currentOrder.shippingAddress.phone}
                  </div>
                </div>

                {/* Payment Method */}
                <div style={{
                  marginBottom: '32px'
                }}>
                  <h2 style={{
                    fontSize: '20px',
                    fontWeight: '600',
                    color: theme.textPrimary,
                    marginBottom: '16px'
                  }}>
                    Payment Method
                  </h2>
                  <div style={{
                    fontSize: '16px',
                    color: theme.textSecondary
                  }}>
                    {currentOrder.paymentMethod}
                  </div>
                </div>

                {/* Order Summary */}
                <div>
                  <h2 style={{
                    fontSize: '20px',
                    fontWeight: '600',
                    color: theme.textPrimary,
                    marginBottom: '16px'
                  }}>
                    Order Summary
                  </h2>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '16px',
                    color: theme.textSecondary,
                    marginBottom: '8px'
                  }}>
                    <div>Subtotal:</div>
                    <div>{formatPrice(currentOrder.subtotal || 0)}</div>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '16px',
                    color: theme.textSecondary,
                    marginBottom: '8px'
                  }}>
                    <div>Tax:</div>
                    <div>{formatPrice(currentOrder.tax || 0)}</div>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '16px',
                    color: theme.textSecondary,
                    marginBottom: '16px'
                  }}>
                    <div>Shipping:</div>
                    <div>{currentOrder.shipping === 0 ? 'Free' : formatPrice(currentOrder.shipping || 0)}</div>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '20px',
                    fontWeight: '600',
                    color: theme.textPrimary,
                    paddingTop: '16px',
                    borderTop: `2px solid ${theme.primary}`
                  }}>
                    <div>Total:</div>
                    <div>{formatPrice(currentOrder.total || 0)}</div>
                  </div>
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