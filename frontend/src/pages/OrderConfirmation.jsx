import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useCart } from '../context/CartContext';
import { getProductImageUrl } from '../utils/imageMap';
import Layout from '../components/Layout';

const OrderConfirmation = () => {
  const { user, isLoggedIn } = useUser();
  const { cartItems, getCartItemsCount, getCartTotal } = useCart();
  const navigate = useNavigate();
  
  const [shippingAddress, setShippingAddress] = useState({
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Australia'
  });
  
  const [sameAsBilling, setSameAsBilling] = useState(true);
  const [billingAddress, setBillingAddress] = useState({
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Australia'
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

  // Validate shipping address - all fields are required
  const validateShippingAddress = () => {
    return shippingAddress.street && 
           shippingAddress.city && 
           shippingAddress.state && 
           shippingAddress.postalCode;
  };

  // Handle continue to payment with validation
  const handleContinueToPayment = () => {
    if (!validateShippingAddress()) {
      alert('please fill in the shipping address information');
      return;
    }
    
    // Store shipping address in localStorage
    localStorage.setItem('orderShippingAddress', JSON.stringify(shippingAddress));
    
    // Only store billing address if it's different from shipping
    if (!sameAsBilling) {
      localStorage.setItem('orderBillingAddress', JSON.stringify(billingAddress));
    } else {
      // Remove billing address from localStorage when using same as shipping
      localStorage.removeItem('orderBillingAddress');
    }
    
    navigate('/payment');
  };

  // Redirect if cart is empty
  if (cartItems.length === 0) {
    return (
      <Layout>
        <div style={{
          backgroundColor: '#f8f9fa',
          fontFamily: "'Space Grotesk', Arial, sans-serif",
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px 20px'
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
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={{
        backgroundColor: '#f8f9fa',
        fontFamily: "'Space Grotesk', Arial, sans-serif"
      }}>
        {/* Breadcrumb */}
        <div style={{
          backgroundColor: 'white',
          borderBottom: '1px solid #e5e8eb'
        }}>
          <div style={{
            padding: '20px 40px',
            fontSize: '14px',
            color: '#607589',
            maxWidth: '1200px',
            margin: '0 auto'
          }}>
            <Link to="/" style={{ color: '#607589', textDecoration: 'none' }}>Home</Link>
            <span style={{ margin: '0 8px' }}>/</span>
            <Link to="/cart" style={{ color: '#607589', textDecoration: 'none' }}>Cart</Link>
            <span style={{ margin: '0 8px' }}>/</span>
            <span style={{ color: '#121417' }}>Order Confirmation</span>
          </div>
        </div>

        {/* Main Content */}
        <div style={{
          display: 'flex',
          gap: '40px',
          padding: '40px 40px 80px 40px',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          {/* Order Details Form */}
          <div style={{
            flex: '2',
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '32px',
            border: '1px solid #e5e8eb'
          }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#121417',
              marginBottom: '24px'
            }}>
              Order Confirmation
            </h2>

            {/* Shipping Address */}
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#121417',
                marginBottom: '16px'
              }}>
                Shipping Address
              </h3>

              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#121417',
                  marginBottom: '8px'
                }}>
                  Street Address *
                </label>
                <input
                  type="text"
                  value={shippingAddress.street}
                  onChange={(e) => handleShippingAddressChange('street', e.target.value)}
                  placeholder="please enter the street address"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: `1px solid ${!shippingAddress.street ? '#dc3545' : '#e5e8eb'}`,
                    borderRadius: '8px',
                    fontSize: '16px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#121417',
                    marginBottom: '8px'
                  }}>
                    City *
                  </label>
                  <input
                    type="text"
                    value={shippingAddress.city}
                    onChange={(e) => handleShippingAddressChange('city', e.target.value)}
                    placeholder="please enter the city"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: `1px solid ${!shippingAddress.city ? '#dc3545' : '#e5e8eb'}`,
                      borderRadius: '8px',
                      fontSize: '16px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#121417',
                    marginBottom: '8px'
                  }}>
                    State *
                  </label>
                  <input
                    type="text"
                    value={shippingAddress.state}
                    onChange={(e) => handleShippingAddressChange('state', e.target.value)}
                    placeholder="please enter the state"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: `1px solid ${!shippingAddress.state ? '#dc3545' : '#e5e8eb'}`,
                      borderRadius: '8px',
                      fontSize: '16px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#121417',
                    marginBottom: '8px'
                  }}>
                    Postal Code *
                  </label>
                  <input
                    type="text"
                    value={shippingAddress.postalCode}
                    onChange={(e) => handleShippingAddressChange('postalCode', e.target.value)}
                    placeholder="please enter the postal code"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: `1px solid ${!shippingAddress.postalCode ? '#dc3545' : '#e5e8eb'}`,
                      borderRadius: '8px',
                      fontSize: '16px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Billing Address */}
            <div style={{ marginBottom: '32px' }}>
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
                  style={{ marginRight: '8px' }}
                />
                <label htmlFor="sameAsBilling" style={{
                  fontSize: '14px',
                  color: '#121417'
                }}>
                  Billing address is the same as shipping address
                </label>
              </div>

              {!sameAsBilling && (
                <div>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#121417',
                    marginBottom: '16px'
                  }}>
                    Billing Address
                  </h3>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#121417',
                      marginBottom: '8px'
                    }}>
                      Street Address
                    </label>
                    <input
                      type="text"

                      value={billingAddress.street}
                      onChange={(e) => handleBillingAddressChange('street', e.target.value)}
                      placeholder="please enter the street address"
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #e5e8eb',
                        borderRadius: '8px',
                        fontSize: '16px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#121417',
                        marginBottom: '8px'
                      }}>
                        City
                      </label>
                      <input
                        type="text"
                        value={billingAddress.city}
                        onChange={(e) => handleBillingAddressChange('city', e.target.value)}
                        placeholder="please enter the city"
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: '1px solid #e5e8eb',
                          borderRadius: '8px',
                          fontSize: '16px',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#121417',
                        marginBottom: '8px'
                      }}>
                        State
                      </label>
                      <input
                        type="text"
                        value={billingAddress.state}
                        onChange={(e) => handleBillingAddressChange('state', e.target.value)}
                        placeholder="please enter the state"
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: '1px solid #e5e8eb',
                          borderRadius: '8px',
                          fontSize: '16px',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#121417',
                        marginBottom: '8px'
                      }}>
                        Postal Code
                      </label>
                      <input
                        type="text"
                        value={billingAddress.postalCode}
                        onChange={(e) => handleBillingAddressChange('postalCode', e.target.value)}
                        placeholder="please enter the postal code"
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: '1px solid #e5e8eb',
                          borderRadius: '8px',
                          fontSize: '16px',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Continue to Payment Button */}
            <button
              onClick={handleContinueToPayment}
              disabled={!validateShippingAddress()}
              style={{
                width: '100%',
                padding: '16px',
                backgroundColor: validateShippingAddress() ? '#0D80F2' : '#e5e8eb',
                color: validateShippingAddress() ? 'white' : '#a0a3a7',
                border: 'none',
                borderRadius: '8px',
                fontSize: '18px',
                fontWeight: '700',
                cursor: validateShippingAddress() ? 'pointer' : 'not-allowed',
                transition: 'background-color 0.2s',
                opacity: validateShippingAddress() ? 1 : 0.6
              }}
            >
            {validateShippingAddress() ? 'Continue to Payment' : 'Please fill in the shipping address'}
            </button>
          </div>

          {/* Order Summary */}
          <div style={{
            flex: '1',
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '32px',
            border: '1px solid #e5e8eb',
            height: 'fit-content'
          }}>
            <h3 style={{
              fontSize: '20px',
              fontWeight: '700',
              color: '#121417',
              marginBottom: '24px'
            }}>
              Order Summary
            </h3>

            {/* Items */}
            <div style={{ marginBottom: '24px' }}>
              {cartItems.map(item => (
                <div key={item.id} style={{
                  display: 'flex',
                  gap: '12px',
                  padding: '12px 0',
                  borderBottom: '1px solid #f0f2f5'
                }}>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    color: '#607589'
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
                            objectFit: 'contain',
                            borderRadius: '8px'
                          }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentNode.innerHTML = '<div style="font-size: 18px; color: #607589;">📦</div>';
                          }}
                        />
                      ) : (
                        <div style={{ fontSize: '18px', color: '#607589' }}>📦</div>
                      );
                    })()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#121417',
                      marginBottom: '4px'
                    }}>
                      {item.name}
                    </div>
                    <div style={{
                      fontSize: '14px',
                      color: '#607589'
                    }}>
                      Qty: {item.quantity} × {formatPrice(item.price)}
                    </div>
                  </div>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#121417'
                  }}>
                    {formatPrice(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '8px'
              }}>
                <span style={{ fontSize: '14px', color: '#607589' }}>Subtotal:</span>
                <span style={{ fontSize: '14px', color: '#121417' }}>{formatPrice(calculateSubtotal())}</span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '8px'
              }}>
                <span style={{ fontSize: '14px', color: '#607589' }}>Shipping:</span>
                <span style={{ fontSize: '14px', color: '#121417' }}>
                  {getShippingCost() === 0 ? 'Free' : formatPrice(getShippingCost())}
                </span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '16px'
              }}>
                <span style={{ fontSize: '14px', color: '#607589' }}>Tax:</span>
                <span style={{ fontSize: '14px', color: '#121417' }}>{formatPrice(getTaxAmount())}</span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingTop: '16px',
                borderTop: '2px solid #e5e8eb'
              }}>
                <span style={{ fontSize: '18px', fontWeight: '700', color: '#121417' }}>Total:</span>
                <span style={{ fontSize: '18px', fontWeight: '700', color: '#121417' }}>{formatPrice(calculateTotal())}</span>
              </div>
            </div>

            {/* Security Info */}
            <div style={{
              backgroundColor: '#f8f9fa',
              padding: '16px',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '12px', color: '#607589', lineHeight: '1.4' }}>
                Your information is secure and encrypted
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default OrderConfirmation; 