import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SearchIcon, ShoppingCartIcon } from '../components/ui/icons';
import { useUser } from '../context/UserContext';
import { useCart } from '../context/CartContext';
import logoIcon from '../assets/Vector - 0.svg';

const OrderConfirmation = () => {
  const { user, isLoggedIn } = useUser();
  const { cartItems, getCartItemsCount, getCartTotal } = useCart();
  const navigate = useNavigate();
  
  const [shippingAddress, setShippingAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States'
  });
  
  const [sameAsBilling, setSameAsBilling] = useState(true);
  const [billingAddress, setBillingAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States'
  });

  // Calculate order totals
  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getShippingCost = () => {
    const subtotal = calculateSubtotal();
    return subtotal >= 100 ? 0 : 10; // Free shipping over $100
  };

  const getTaxAmount = () => {
    return 0; // Tax calculation can be implemented based on location
  };

  const calculateTotal = () => {
    return calculateSubtotal() + getShippingCost() + getTaxAmount();
  };

  const formatPrice = (price) => {
    return `$${price.toFixed(2)}`;
  };

  const handleShippingAddressChange = (field, value) => {
    setShippingAddress(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleBillingAddressChange = (field, value) => {
    setBillingAddress(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Redirect if cart is empty
  if (cartItems.length === 0) {
    return (
      <div style={{
        backgroundColor: '#f8f9fa',
        minHeight: '100vh',
        fontFamily: "'Space Grotesk', Arial, sans-serif",
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          textAlign: 'center',
          backgroundColor: 'white',
          padding: '40px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h2>Your cart is empty</h2>
          <p>Please add items to your cart before proceeding to checkout.</p>
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
      </div>
    );
  }

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
          {/* Breadcrumb */}
          <div style={{
            fontSize: '14px',
            color: '#61758A',
            marginBottom: '24px'
          }}>
            <Link to="/cart" style={{ color: '#61758A', textDecoration: 'none' }}>Cart</Link>
            <span style={{ margin: '0 8px' }}>/</span>
            <span style={{ color: '#121417', fontWeight: '500' }}>Checkout</span>
          </div>

          {/* Page Title */}
          <h1 style={{
            fontSize: '32px',
            fontWeight: '700',
            color: '#121417',
            margin: '0 0 32px 0'
          }}>
            Order Confirmation
          </h1>

          {/* Items in Your Order */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '24px',
            marginBottom: '24px'
          }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#121417',
              margin: '0 0 20px 0'
            }}>
              Items in Your Order
            </h2>

            {cartItems.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '16px 0',
                  borderBottom: '1px solid #f3f4f6'
                }}
              >
                {/* Product Image */}
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  marginRight: '16px',
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
                    color: '#61758A'
                  }}>
                    Quantity: {item.quantity}
                  </div>
                </div>

                {/* Price */}
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

          {/* Shipping Address */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '24px',
            marginBottom: '24px'
          }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#121417',
              margin: '0 0 20px 0'
            }}>
              Shipping Address
            </h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px'
            }}>
              <input
                type="text"
                placeholder="Street Address"
                value={shippingAddress.street}
                onChange={(e) => handleShippingAddressChange('street', e.target.value)}
                style={{
                  gridColumn: '1 / -1',
                  padding: '12px',
                  border: '1px solid #DBE0E5',
                  borderRadius: '8px',
                  fontSize: '16px',
                  outline: 'none'
                }}
              />
              <input
                type="text"
                placeholder="City"
                value={shippingAddress.city}
                onChange={(e) => handleShippingAddressChange('city', e.target.value)}
                style={{
                  padding: '12px',
                  border: '1px solid #DBE0E5',
                  borderRadius: '8px',
                  fontSize: '16px',
                  outline: 'none'
                }}
              />
              <input
                type="text"
                placeholder="State"
                value={shippingAddress.state}
                onChange={(e) => handleShippingAddressChange('state', e.target.value)}
                style={{
                  padding: '12px',
                  border: '1px solid #DBE0E5',
                  borderRadius: '8px',
                  fontSize: '16px',
                  outline: 'none'
                }}
              />
              <input
                type="text"
                placeholder="ZIP Code"
                value={shippingAddress.zipCode}
                onChange={(e) => handleShippingAddressChange('zipCode', e.target.value)}
                style={{
                  padding: '12px',
                  border: '1px solid #DBE0E5',
                  borderRadius: '8px',
                  fontSize: '16px',
                  outline: 'none'
                }}
              />
              <input
                type="text"
                placeholder="Country"
                value={shippingAddress.country}
                onChange={(e) => handleShippingAddressChange('country', e.target.value)}
                style={{
                  padding: '12px',
                  border: '1px solid #DBE0E5',
                  borderRadius: '8px',
                  fontSize: '16px',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* Billing Address */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '24px',
            marginBottom: '24px'
          }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#121417',
              margin: '0 0 20px 0'
            }}>
              Billing Address
            </h2>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '16px'
            }}>
              <input
                type="checkbox"
                id="sameAsBilling"
                checked={sameAsBilling}
                onChange={(e) => setSameAsBilling(e.target.checked)}
                style={{
                  marginRight: '8px',
                  width: '16px',
                  height: '16px'
                }}
              />
              <label htmlFor="sameAsBilling" style={{
                fontSize: '16px',
                color: '#121417'
              }}>
                Same as shipping address
              </label>
            </div>

            {!sameAsBilling && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px'
              }}>
                <input
                  type="text"
                  placeholder="Street Address"
                  value={billingAddress.street}
                  onChange={(e) => handleBillingAddressChange('street', e.target.value)}
                  style={{
                    gridColumn: '1 / -1',
                    padding: '12px',
                    border: '1px solid #DBE0E5',
                    borderRadius: '8px',
                    fontSize: '16px',
                    outline: 'none'
                  }}
                />
                <input
                  type="text"
                  placeholder="City"
                  value={billingAddress.city}
                  onChange={(e) => handleBillingAddressChange('city', e.target.value)}
                  style={{
                    padding: '12px',
                    border: '1px solid #DBE0E5',
                    borderRadius: '8px',
                    fontSize: '16px',
                    outline: 'none'
                  }}
                />
                <input
                  type="text"
                  placeholder="State"
                  value={billingAddress.state}
                  onChange={(e) => handleBillingAddressChange('state', e.target.value)}
                  style={{
                    padding: '12px',
                    border: '1px solid #DBE0E5',
                    borderRadius: '8px',
                    fontSize: '16px',
                    outline: 'none'
                  }}
                />
                <input
                  type="text"
                  placeholder="ZIP Code"
                  value={billingAddress.zipCode}
                  onChange={(e) => handleBillingAddressChange('zipCode', e.target.value)}
                  style={{
                    padding: '12px',
                    border: '1px solid #DBE0E5',
                    borderRadius: '8px',
                    fontSize: '16px',
                    outline: 'none'
                  }}
                />
                <input
                  type="text"
                  placeholder="Country"
                  value={billingAddress.country}
                  onChange={(e) => handleBillingAddressChange('country', e.target.value)}
                  style={{
                    padding: '12px',
                    border: '1px solid #DBE0E5',
                    borderRadius: '8px',
                    fontSize: '16px',
                    outline: 'none'
                  }}
                />
              </div>
            )}
          </div>

          {/* Order Total */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '24px',
            marginBottom: '24px'
          }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#121417',
              margin: '0 0 20px 0'
            }}>
              Order Total
            </h2>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '12px'
            }}>
              <span style={{ fontSize: '16px', color: '#121417' }}>Subtotal</span>
              <span style={{ fontSize: '16px', fontWeight: '600', color: '#121417' }}>
                {formatPrice(calculateSubtotal())}
              </span>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '12px'
            }}>
              <span style={{ fontSize: '16px', color: '#121417' }}>Shipping</span>
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
              marginBottom: '16px'
            }}>
              <span style={{ fontSize: '16px', color: '#121417' }}>Tax</span>
              <span style={{ fontSize: '16px', fontWeight: '600', color: '#121417' }}>
                {formatPrice(getTaxAmount())}
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
            gap: '16px'
          }}>
            <Link
              to="/cart"
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
                flex: 1
              }}
            >
              Edit Cart
            </Link>

            <Link
              to="/payment"
              style={{
                backgroundColor: '#0D80F2',
                color: 'white',
                textDecoration: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                textAlign: 'center',
                display: 'block',
                flex: 1
              }}
            >
              Confirm and Pay
            </Link>
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

export default OrderConfirmation; 