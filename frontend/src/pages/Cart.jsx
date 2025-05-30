import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { SearchIcon, ShoppingCartIcon } from '../components/ui/icons';
import { useUser } from '../context/UserContext';
import { useCart } from '../context/CartContext';
import logoIcon from '../assets/Vector - 0.svg';

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
  const location = useLocation();
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(false);
  const { 
    cartItems, 
    removeFromCart, 
    updateQuantity, 
    clearCart, 
    getCartTotal, 
    getCartItemsCount 
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
              Welcome, {user.firstName}
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

          {/* Cart Icon (Active) */}
          <div style={{
            position: 'relative',
            padding: '8px',
            backgroundColor: '#0D80F2',
            borderRadius: '8px'
          }}>
            <ShoppingCartIcon style={{ width: '17px', height: '17px', color: 'white' }} />
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
          maxWidth: '800px'
        }}>
          {/* Cart Status Header */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '16px 24px',
            marginBottom: '8px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{
              fontSize: '14px',
              fontWeight: '500',
              color: '#61758A'
            }}>
              {isLoggedIn ? 'User Shopping Cart' : 'Guest Shopping Cart'}
            </span>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              backgroundColor: '#16a34a',
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

          {/* Welcome Message (when redirected from login/register) */}
          {showWelcomeMessage && (
            <div style={{
              backgroundColor: '#e1f5fe',
              borderLeft: '4px solid #0D80F2',
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
                  color: '#0D80F2'
                }}>
                  Welcome{isLoggedIn && user ? `, ${user.firstName}` : ''}! Your cart items are ready for checkout.
                </span>
              </div>
            </div>
          )}

          {/* Main Cart Container */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            overflow: 'hidden'
          }}>
            {/* Cart Title */}
            <div style={{
              padding: '32px 32px 24px',
              borderBottom: cartItems.length > 0 ? '1px solid #e5e8eb' : 'none'
            }}>
              <h1 style={{
                fontSize: '28px',
                fontWeight: '700',
                color: '#121417',
                margin: 0
              }}>
                Shopping cart
              </h1>
            </div>

            {/* Cart Items or Empty State */}
            {cartItems.length === 0 ? (
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
                  backgroundColor: '#f0f2f5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '24px'
                }}>
                  <ShoppingCartIcon style={{ width: '40px', height: '40px', color: '#61758A' }} />
                </div>
                <h2 style={{
                  fontSize: '24px',
                  fontWeight: '600',
                  color: '#121417',
                  margin: '0 0 12px 0'
                }}>
                  Your cart is empty
                </h2>
                <p style={{
                  fontSize: '16px',
                  color: '#61758A',
                  margin: '0 0 32px 0'
                }}>
                  Looks like you haven't added any items to your cart yet.
                </p>
                <Link
                  to="/"
                  style={{
                    backgroundColor: '#0D80F2',
                    color: 'white',
                    textDecoration: 'none',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '600'
                  }}
                >
                  Continue Shopping
                </Link>
              </div>
            ) : (
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
                        borderBottom: index < cartItems.length - 1 ? '1px solid #f3f4f6' : 'none'
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
                        backgroundColor: '#f8f9fa',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <img
                          src={item.image}
                          alt={item.name}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain'
                          }}
                        />
                      </div>

                      {/* Product Info */}
                      <div style={{
                        flex: 1,
                        marginRight: '20px'
                      }}>
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
                          color: '#61758A',
                          marginBottom: '4px'
                        }}>
                          Individual Price: {formatPrice(item.price)}
                        </div>
                        <div style={{
                          fontSize: '14px',
                          color: '#61758A'
                        }}>
                          {item.category} - {item.name.includes('32GB') ? '32GB' : 
                           item.name.includes('256GB') ? '256GB' : 
                           item.name.includes('2TB') ? '2TB' : 'Standard'} - {
                           item.name.includes('BLACK') || item.name.includes('Black') ? 'Black' : 
                           item.name.includes('Grey') ? 'Grey' : 
                           item.name.includes('White') ? 'White' : 'Default'}
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
                              border: '1px solid #DBE0E5',
                              borderRadius: '4px',
                              backgroundColor: 'white',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '14px',
                              fontWeight: '600'
                            }}
                          >
                            -
                          </button>
                          <span style={{
                            fontSize: '14px',
                            fontWeight: '500',
                            minWidth: '20px',
                            textAlign: 'center'
                          }}>
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            style={{
                              width: '24px',
                              height: '24px',
                              border: '1px solid #DBE0E5',
                              borderRadius: '4px',
                              backgroundColor: 'white',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '14px',
                              fontWeight: '600'
                            }}
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
                            color: '#dc2626',
                            cursor: 'pointer',
                            fontSize: '18px',
                            padding: '4px 8px',
                            borderRadius: '4px'
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
                  borderTop: '1px solid #e5e8eb',
                  backgroundColor: '#f8f9fa'
                }}>
                  <h2 style={{
                    fontSize: '20px',
                    fontWeight: '700',
                    color: '#121417',
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
                        color: '#121417'
                      }}>
                        Subtotal
                      </span>
                      <span style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        color: '#121417'
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
                        color: '#121417'
                      }}>
                        Shipping
                      </span>
                      <span style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        color: getShippingCost() === 0 ? '#16a34a' : '#121417'
                      }}>
                        {getShippingCost() === 0 ? 'Free' : formatPrice(getShippingCost())}
                      </span>
                    </div>

                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '16px 0',
                      borderTop: '1px solid #e5e8eb',
                      borderBottom: '1px solid #e5e8eb'
                    }}>
                      <span style={{
                        fontSize: '18px',
                        fontWeight: '700',
                        color: '#121417'
                      }}>
                        Total
                      </span>
                      <span style={{
                        fontSize: '18px',
                        fontWeight: '700',
                        color: '#121417'
                      }}>
                        {formatPrice(calculateTotal())}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}>
                    <Link
                      to="/"
                      style={{
                        backgroundColor: 'transparent',
                        color: '#0D80F2',
                        border: '1px solid #0D80F2',
                        textDecoration: 'none',
                        padding: '12px 24px',
                        borderRadius: '8px',
                        fontSize: '16px',
                        fontWeight: '600',
                        textAlign: 'center',
                        display: 'block'
                      }}
                    >
                      Continue Shopping
                    </Link>

                    {isLoggedIn ? (
                      <Link
                        to="/order-confirmation"
                        style={{
                          backgroundColor: '#0D80F2',
                          color: 'white',
                          textDecoration: 'none',
                          padding: '12px 24px',
                          borderRadius: '8px',
                          fontSize: '16px',
                          fontWeight: '600',
                          textAlign: 'center',
                          display: 'block'
                        }}
                      >
                        Proceed to Checkout
                      </Link>
                    ) : (
                      <Link
                        to="/login"
                        style={{
                          backgroundColor: '#0D80F2',
                          color: 'white',
                          textDecoration: 'none',
                          padding: '12px 24px',
                          borderRadius: '8px',
                          fontSize: '16px',
                          fontWeight: '600',
                          textAlign: 'center',
                          display: 'block'
                        }}
                      >
                        Log in/Sign Up to Checkout
                      </Link>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        backgroundColor: 'white',
        borderTop: '1px solid #e5e8eb',
        padding: '40px 20px',
        textAlign: 'center',
        marginTop: '40px'
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

export default Cart; 