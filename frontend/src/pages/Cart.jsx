import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Layout from '../components/Layout';
import { useUser } from '../context/UserContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { getProductImageUrl } from '../utils/imageMap';

// Add fadeIn animation styles
const fadeInStyles = `
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

// Inject styles into document head
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = fadeInStyles;
  document.head.appendChild(styleElement);
}

const Cart = () => {
  const { user, isLoggedIn } = useUser();
  const { theme } = useTheme();
  const location = useLocation();
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(false);
  const { 
    cartItems, 
    removeFromCart, 
    updateQuantity, 
    clearCart, 
    getCartTotal, 
    getCartItemsCount,
    isLoading
  } = useCart();

  // Check if user was redirected from login/register
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const fromAuth = urlParams.get('from') === 'auth';
    
    if (fromAuth && isLoggedIn && getCartItemsCount() > 0) {
      setShowWelcomeMessage(true);
      // Hide message after 5 seconds
      setTimeout(() => setShowWelcomeMessage(false), 5000);
    }
  }, [location, isLoggedIn, getCartItemsCount]);

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    updateQuantity(productId, newQuantity);
  };

  const formatPrice = (price) => {
    return `$${price.toFixed(2)}`;
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getShippingCost = () => {
    const subtotal = calculateSubtotal();
    return subtotal >= 100 ? 0 : 10; // Free shipping over $100
  };

  const calculateTotal = () => {
    return calculateSubtotal() + getShippingCost();
  };

  // Render cart status message
  const renderCartStatusMessage = () => {
    if (!isLoggedIn && cartItems.length === 0) {
      return (
        <div style={{
          backgroundColor: theme.warning + '20', // Add transparency
          border: `1px solid ${theme.warning}50`,
          borderRadius: '8px',
          padding: '16px 24px',
          marginBottom: '8px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ fontSize: '18px' }}>👤</span>
            <div>
              <div style={{
                fontSize: '14px',
                fontWeight: '500',
                color: theme.warning,
                marginBottom: '4px'
              }}>
                Shopping as Guest
              </div>
              <div style={{
                fontSize: '12px',
                color: theme.textSecondary
              }}>
                Log in to save your cart and access it from any device
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    if (isLoggedIn && cartItems.length > 0) {
      return (
        <div style={{
          backgroundColor: theme.success + '20',
          border: `1px solid ${theme.success}50`,
          borderRadius: '8px',
          padding: '16px 24px',
          marginBottom: '8px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ fontSize: '18px' }}>✅</span>
            <div>
              <div style={{
                fontSize: '14px',
                fontWeight: '500',
                color: theme.success,
                marginBottom: '4px'
              }}>
                Cart Saved to Your Account
              </div>
              <div style={{
                fontSize: '12px',
                color: theme.textSecondary
              }}>
                Your items will be here when you return
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    return null;
  };

  // Render empty cart state
  const renderEmptyCart = () => (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '80px 32px',
      textAlign: 'center'
    }}>
      <div style={{
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        backgroundColor: theme.backgroundTertiary,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '24px',
        fontSize: '32px'
      }}>
        🛒
      </div>
      <h2 style={{
        fontSize: '24px',
        fontWeight: '600',
        color: theme.textPrimary,
        margin: '0 0 12px 0'
      }}>
        {isLoggedIn ? 'Your cart is empty' : 'Guest cart is empty'}
      </h2>
      <p style={{
        fontSize: '16px',
        color: theme.textSecondary,
        margin: '0 0 32px 0',
        maxWidth: '400px'
      }}>
        {isLoggedIn 
          ? "Start shopping to add items to your cart. Your items will be saved for your next visit."
          : "Add items to your cart as a guest, or log in to save your cart permanently."
        }
      </p>
      
      <div style={{
        display: 'flex',
        gap: '12px',
        flexDirection: window.innerWidth < 480 ? 'column' : 'row'
      }}>
        <Link
          to="/product"
          style={{
            backgroundColor: theme.primary,
            color: 'white',
            textDecoration: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            display: 'inline-block',
            transition: 'background-color 0.2s ease'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = theme.primaryHover}
          onMouseLeave={(e) => e.target.style.backgroundColor = theme.primary}
        >
          Browse Products
        </Link>
        
        {!isLoggedIn && (
          <Link
            to="/login"
            style={{
              backgroundColor: 'transparent',
              color: theme.primary,
              border: `1px solid ${theme.primary}`,
              textDecoration: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              display: 'inline-block',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = theme.primary;
              e.target.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.color = theme.primary;
            }}
          >
            Log In
          </Link>
        )}
      </div>
    </div>
  );

  return (
    <Layout>
      {/* Main Content */}
      <main style={{
        display: 'flex',
        justifyContent: 'center',
        padding: '40px 20px',
        minHeight: 'calc(100vh - 200px)',
        backgroundColor: theme.background
      }}>
        <div style={{
          width: '100%',
          maxWidth: '800px'
        }}>
          {/* Cart Status Header */}
          <div style={{
            backgroundColor: theme.cardBg,
            borderRadius: '8px',
            padding: '16px 24px',
            marginBottom: '8px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            border: `1px solid ${theme.border}`,
            boxShadow: theme.shadowLight
          }}>
            <span style={{
              fontSize: '14px',
              fontWeight: '500',
              color: theme.textSecondary
            }}>
              {isLoggedIn ? `${user?.firstName || 'User'}'s Shopping Cart` : 'Guest Shopping Cart'}
            </span>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              backgroundColor: getCartItemsCount() > 0 ? theme.success : theme.textMuted,
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: '600'
            }}>
              {getCartItemsCount()}
            </div>
          </div>

          {/* Cart Status Message */}
          {renderCartStatusMessage()}

          {/* Welcome Message (when redirected from login/register) */}
          {showWelcomeMessage && (
            <div style={{
              backgroundColor: theme.info + '20',
              borderLeft: `4px solid ${theme.primary}`,
              borderRadius: '8px',
              padding: '16px 24px',
              marginBottom: '8px',
              animation: 'fadeIn 0.5s ease-in-out'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{
                  fontSize: '18px'
                }}>
                  🎉
                </span>
                <span style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: theme.primary
                }}>
                  Welcome{isLoggedIn && user ? `, ${user.firstName}` : ''}! Your cart items are ready for checkout.
                </span>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div style={{
              backgroundColor: theme.cardBg,
              borderRadius: '8px',
              padding: '40px',
              textAlign: 'center',
              border: `1px solid ${theme.border}`,
              boxShadow: theme.shadowLight
            }}>
              <div style={{
                fontSize: '16px',
                color: theme.textSecondary
              }}>
                Loading cart...
              </div>
            </div>
          )}

          {/* Main Cart Container */}
          {!isLoading && (
            <div style={{
              backgroundColor: theme.cardBg,
              borderRadius: '8px',
              overflow: 'hidden',
              border: `1px solid ${theme.border}`,
              boxShadow: theme.shadowLight
            }}>
              {/* Cart Title */}
              <div style={{
                padding: '32px 32px 24px',
                borderBottom: cartItems.length > 0 ? `1px solid ${theme.border}` : 'none'
              }}>
                <h1 style={{
                  fontSize: '28px',
                  fontWeight: '700',
                  color: theme.textPrimary,
                  margin: 0
                }}>
                  Shopping Cart
                </h1>
              </div>

              {/* Cart Items or Empty State */}
              {cartItems.length === 0 ? renderEmptyCart() : (
                <>
                  {/* Cart Items List */}
                  <div style={{ padding: '0 32px' }}>
                    {cartItems.map((item, index) => (
                      <div
                        key={item.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: '24px 0',
                          borderBottom: index < cartItems.length - 1 ? `1px solid ${theme.borderLight}` : 'none'
                        }}
                      >
                        {/* Product Image */}
                        <div style={{
                          width: '64px',
                          height: '64px',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          marginRight: '20px',
                          flexShrink: 0,
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
                                  e.target.parentNode.innerHTML = `<div style="font-size: 24px; color: ${theme.textMuted};">📦</div>`;
                                }}
                              />
                            ) : (
                              <div style={{ fontSize: '24px', color: theme.textMuted }}>📦</div>
                            );
                          })()}
                        </div>

                        {/* Product Info */}
                        <div style={{
                          flex: 1,
                          marginRight: '20px'
                        }}>
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
                            color: theme.textSecondary,
                            marginBottom: '4px'
                          }}>
                            Individual Price: {formatPrice(item.price)}
                          </div>
                          <div style={{
                            fontSize: '14px',
                            color: theme.textTertiary
                          }}>
                            {item.category || 'Electronics'}
                          </div>
                        </div>

                        {/* Quantity and Remove */}
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '16px'
                        }}>
                          {/* Quantity Controls */}
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}>
                            <button
                              onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                              style={{
                                width: '24px',
                                height: '24px',
                                border: `1px solid ${theme.border}`,
                                borderRadius: '4px',
                                backgroundColor: theme.buttonBg,
                                color: theme.textPrimary,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '14px',
                                fontWeight: '600',
                                transition: 'all 0.2s ease'
                              }}
                              onMouseEnter={(e) => e.target.style.backgroundColor = theme.backgroundTertiary}
                              onMouseLeave={(e) => e.target.style.backgroundColor = theme.buttonBg}
                            >
                              -
                            </button>
                            <span style={{
                              fontSize: '14px',
                              fontWeight: '500',
                              minWidth: '20px',
                              textAlign: 'center',
                              color: theme.textPrimary
                            }}>
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                              style={{
                                width: '24px',
                                height: '24px',
                                border: `1px solid ${theme.border}`,
                                borderRadius: '4px',
                                backgroundColor: theme.buttonBg,
                                color: theme.textPrimary,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '14px',
                                fontWeight: '600',
                                transition: 'all 0.2s ease'
                              }}
                              onMouseEnter={(e) => e.target.style.backgroundColor = theme.backgroundTertiary}
                              onMouseLeave={(e) => e.target.style.backgroundColor = theme.buttonBg}
                            >
                              +
                            </button>
                          </div>

                          {/* Remove Button */}
                          <button
                            onClick={() => removeFromCart(item.id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: theme.error,
                              cursor: 'pointer',
                              fontSize: '18px',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.backgroundColor = theme.error + '20';
                              e.target.style.transform = 'scale(1.1)';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.backgroundColor = 'transparent';
                              e.target.style.transform = 'scale(1)';
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Summary */}
                  <div style={{
                    padding: '32px',
                    borderTop: `1px solid ${theme.border}`,
                    backgroundColor: theme.backgroundSecondary
                  }}>
                    <h2 style={{
                      fontSize: '20px',
                      fontWeight: '700',
                      color: theme.textPrimary,
                      margin: '0 0 24px 0'
                    }}>
                      Order Summary
                    </h2>

                    <div style={{
                      marginBottom: '24px'
                    }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '12px'
                      }}>
                        <span style={{
                          fontSize: '16px',
                          color: theme.textPrimary
                        }}>
                          Subtotal
                        </span>
                        <span style={{
                          fontSize: '16px',
                          fontWeight: '600',
                          color: theme.textPrimary
                        }}>
                          {formatPrice(calculateSubtotal())}
                        </span>
                      </div>

                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '16px'
                      }}>
                        <span style={{
                          fontSize: '16px',
                          color: theme.textPrimary
                        }}>
                          Shipping
                        </span>
                        <span style={{
                          fontSize: '16px',
                          fontWeight: '600',
                          color: getShippingCost() === 0 ? theme.success : theme.textPrimary
                        }}>
                          {getShippingCost() === 0 ? 'Free' : formatPrice(getShippingCost())}
                        </span>
                      </div>

                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '16px 0',
                        borderTop: `1px solid ${theme.border}`,
                        borderBottom: `1px solid ${theme.border}`
                      }}>
                        <span style={{
                          fontSize: '18px',
                          fontWeight: '700',
                          color: theme.textPrimary
                        }}>
                          Total
                        </span>
                        <span style={{
                          fontSize: '18px',
                          fontWeight: '700',
                          color: theme.textPrimary
                        }}>
                          {formatPrice(calculateTotal())}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div style={{
                      display: 'flex',
                      flexDirection: 'row',
                      gap: '12px'
                    }}>
                      <Link
                        to="/product"
                        style={{
                          backgroundColor: 'transparent',
                          color: theme.primary,
                          border: `1px solid ${theme.primary}`,
                          textDecoration: 'none',
                          padding: '12px 24px',
                          borderRadius: '8px',
                          fontSize: '16px',
                          fontWeight: '600',
                          textAlign: 'center',
                          display: 'block',
                          flex: 1,
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = theme.primary;
                          e.target.style.color = 'white';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = 'transparent';
                          e.target.style.color = theme.primary;
                        }}
                      >
                        Continue Shopping
                      </Link>

                      {isLoggedIn ? (
                        <Link
                          to="/order-confirmation"
                          style={{
                            backgroundColor: theme.primary,
                            color: 'white',
                            textDecoration: 'none',
                            padding: '12px 24px',
                            borderRadius: '8px',
                            fontSize: '16px',
                            fontWeight: '600',
                            textAlign: 'center',
                            display: 'block',
                            flex: 1,
                            transition: 'background-color 0.2s ease'
                          }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = theme.primaryHover}
                          onMouseLeave={(e) => e.target.style.backgroundColor = theme.primary}
                        >
                          Proceed to Checkout
                        </Link>
                      ) : (
                        <Link
                          to="/login"
                          style={{
                            backgroundColor: theme.primary,
                            color: 'white',
                            textDecoration: 'none',
                            padding: '12px 24px',
                            borderRadius: '8px',
                            fontSize: '16px',
                            fontWeight: '600',
                            textAlign: 'center',
                            display: 'block',
                            flex: 1,
                            transition: 'background-color 0.2s ease'
                          }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = theme.primaryHover}
                          onMouseLeave={(e) => e.target.style.backgroundColor = theme.primary}
                        >
                          Log In to Checkout
                        </Link>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </main>
    </Layout>
  );
};

export default Cart;