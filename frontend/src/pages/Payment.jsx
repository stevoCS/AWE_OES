import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SearchIcon, ShoppingCartIcon } from '../components/ui/icons';
import { useUser } from '../context/UserContext';
import { useCart } from '../context/CartContext';
import { useOrders } from '../context/OrderContext';
import logoIcon from '../assets/Vector - 0.svg';

const Payment = () => {
  const { user, isLoggedIn } = useUser();
  const { cartItems, getCartItemsCount, clearCart } = useCart();
  const { addOrder } = useOrders();
  const navigate = useNavigate();
  
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    nameOnCard: '',
    saveCard: false
  });
  
  const [billingAddress, setBillingAddress] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US'
  });
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card'); // 'card', 'paypal', 'apple_pay'

  // Calculate order totals
  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getShippingCost = () => {
    const subtotal = calculateSubtotal();
    return subtotal >= 100 ? 0 : 15; // Free shipping over $100
  };

  const getTaxAmount = () => {
    const subtotal = calculateSubtotal();
    return subtotal * 0.08; // 8% tax rate
  };

  const calculateTotal = () => {
    return calculateSubtotal() + getShippingCost() + getTaxAmount();
  };

  const formatPrice = (price) => {
    return `$${price.toFixed(2)}`;
  };

  const handleInputChange = (field, value) => {
    setPaymentData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleBillingChange = (field, value) => {
    setBillingAddress(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCardNumberChange = (value) => {
    // Format card number with spaces every 4 digits
    const formattedValue = value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
    if (formattedValue.length <= 19) { // 16 digits + 3 spaces
      handleInputChange('cardNumber', formattedValue);
    }
  };

  const validateCardNumber = (cardNumber) => {
    const cleanNumber = cardNumber.replace(/\s/g, '');
    return cleanNumber.length >= 13 && cleanNumber.length <= 19;
  };

  const validateExpiry = (month, year) => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    const expYear = parseInt(year);
    const expMonth = parseInt(month);
    
    if (expYear < currentYear) return false;
    if (expYear === currentYear && expMonth < currentMonth) return false;
    return true;
  };

  const simulatePayment = async (method) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate payment processing
        // 90% success rate for testing
        const success = Math.random() > 0.1;
        console.log(`Simulating ${method} payment:`, success ? 'success' : 'failed');
        resolve(success);
      }, 2000 + Math.random() * 1000); // 2-3 second processing time
    });
  };

  const handlePayNow = async () => {
    // Validation
    if (paymentMethod === 'card') {
      if (!paymentData.cardNumber || !paymentData.expiryMonth || !paymentData.expiryYear || !paymentData.cvv || !paymentData.nameOnCard) {
        alert('Please fill in all payment fields');
        return;
      }

      if (!validateCardNumber(paymentData.cardNumber)) {
        alert('Please enter a valid card number');
        return;
      }

      if (!validateExpiry(paymentData.expiryMonth, paymentData.expiryYear)) {
        alert('Please enter a valid expiry date');
        return;
      }

      if (paymentData.cvv.length < 3) {
        alert('Please enter a valid CVV');
        return;
      }
    }

    // Billing address validation
    if (!billingAddress.fullName || !billingAddress.email || !billingAddress.address) {
      alert('Please fill in required billing information');
      return;
    }

    setIsProcessing(true);

    try {
      const paymentSuccess = await simulatePayment(paymentMethod);
      
      if (paymentSuccess) {
        // Create order
        const orderNumber = 'AWE' + Date.now().toString().slice(-8).toUpperCase();
        const orderDate = new Date();
        const estimatedDelivery = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        
        const orderToSave = {
          orderNumber: orderNumber,
          orderDate: orderDate.toLocaleDateString(),
          estimatedDelivery: estimatedDelivery.toLocaleDateString(),
          total: calculateTotal(),
          subtotal: calculateSubtotal(),
          shipping: getShippingCost(),
          tax: getTaxAmount(),
          paymentMethod: paymentMethod,
          status: 'confirmed',
          shippingAddress: billingAddress,
          items: cartItems.map(item => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            image: item.image || '/api/placeholder/150/150'
          }))
        };
        
        console.log('Payment - Creating order:', orderToSave);
        addOrder(orderToSave);
        
        // Clear shopping cart
        await clearCart();
        
        // Navigate to success page
        navigate(`/payment-success?orderNumber=${orderNumber}`);
      } else {
        navigate('/payment-failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      navigate('/payment-failed');
    } finally {
      setIsProcessing(false);
    }
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
          <h2 style={{ color: '#121417', marginBottom: '16px' }}>Your cart is empty</h2>
          <p style={{ color: '#607589', marginBottom: '24px' }}>Please add items to your cart before proceeding to payment.</p>
          <Link
            to="/product"
            style={{
              backgroundColor: '#0D80F2',
              color: 'white',
              textDecoration: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              display: 'inline-block'
            }}
          >
            Browse Products
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
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '32px'
        }}>
          {/* User Login/Dashboard Link */}
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
        <Link to="/cart" style={{ color: '#607589', textDecoration: 'none' }}>Cart</Link>
        <span style={{ margin: '0 8px' }}>/</span>
        <span style={{ color: '#121417' }}>Payment</span>
      </div>

      {/* Main Content */}
      <div style={{
        display: 'flex',
        gap: '40px',
        padding: '40px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Payment Form */}
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
            Payment Information
          </h2>

          {/* Payment Method Selection */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#121417',
              marginBottom: '16px'
            }}>
              Payment Method
            </h3>
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
              {[
                { id: 'card', label: 'Credit/Debit Card', icon: '💳' },
                { id: 'paypal', label: 'PayPal', icon: '🅿️' },
                { id: 'apple_pay', label: 'Apple Pay', icon: '🍎' }
              ].map(method => (
                <label key={method.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 16px',
                  border: `2px solid ${paymentMethod === method.id ? '#0D80F2' : '#e5e8eb'}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  backgroundColor: paymentMethod === method.id ? '#f0f8ff' : 'white',
                  transition: 'all 0.2s'
                }}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method.id}
                    checked={paymentMethod === method.id}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    style={{ display: 'none' }}
                  />
                  <span style={{ fontSize: '20px' }}>{method.icon}</span>
                  <span style={{ fontSize: '14px', fontWeight: '500' }}>{method.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Card Details - Show only if card is selected */}
          {paymentMethod === 'card' && (
            <div style={{ marginBottom: '32px' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr',
                gap: '16px',
                marginBottom: '16px'
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#121417',
                    marginBottom: '8px'
                  }}>
                    Card Number *
                  </label>
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    value={paymentData.cardNumber}
                    onChange={(e) => handleCardNumberChange(e.target.value)}
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

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: '16px',
                marginBottom: '16px'
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#121417',
                    marginBottom: '8px'
                  }}>
                    Expiry Month *
                  </label>
                  <select
                    value={paymentData.expiryMonth}
                    onChange={(e) => handleInputChange('expiryMonth', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #e5e8eb',
                      borderRadius: '8px',
                      fontSize: '16px',
                      backgroundColor: 'white'
                    }}
                  >
                    <option value="">Month</option>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                      <option key={month} value={month.toString().padStart(2, '0')}>
                        {month.toString().padStart(2, '0')}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#121417',
                    marginBottom: '8px'
                  }}>
                    Expiry Year *
                  </label>
                  <select
                    value={paymentData.expiryYear}
                    onChange={(e) => handleInputChange('expiryYear', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #e5e8eb',
                      borderRadius: '8px',
                      fontSize: '16px',
                      backgroundColor: 'white'
                    }}
                  >
                    <option value="">Year</option>
                    {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map(year => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#121417',
                    marginBottom: '8px'
                  }}>
                    CVV *
                  </label>
                  <input
                    type="text"
                    placeholder="123"
                    maxLength="4"
                    value={paymentData.cvv}
                    onChange={(e) => handleInputChange('cvv', e.target.value)}
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

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#121417',
                  marginBottom: '8px'
                }}>
                  Name on Card *
                </label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={paymentData.nameOnCard}
                  onChange={(e) => handleInputChange('nameOnCard', e.target.value)}
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
          )}

          {/* Alternative Payment Methods */}
          {paymentMethod === 'paypal' && (
            <div style={{
              padding: '32px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              textAlign: 'center',
              marginBottom: '32px'
            }}>
              <p style={{ fontSize: '16px', color: '#607589', marginBottom: '16px' }}>
                You will be redirected to PayPal to complete your payment.
              </p>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🅿️</div>
              <p style={{ fontSize: '14px', color: '#607589' }}>
                Safe and secure payment with PayPal
              </p>
            </div>
          )}

          {paymentMethod === 'apple_pay' && (
            <div style={{
              padding: '32px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              textAlign: 'center',
              marginBottom: '32px'
            }}>
              <p style={{ fontSize: '16px', color: '#607589', marginBottom: '16px' }}>
                Use Touch ID or Face ID to pay with Apple Pay.
              </p>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🍎</div>
              <p style={{ fontSize: '14px', color: '#607589' }}>
                Quick and secure payment with Apple Pay
              </p>
            </div>
          )}

          {/* Billing Address */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#121417',
              marginBottom: '16px'
            }}>
              Billing Address
            </h3>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
              marginBottom: '16px'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#121417',
                  marginBottom: '8px'
                }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  value={billingAddress.fullName}
                  onChange={(e) => handleBillingChange('fullName', e.target.value)}
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

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#121417',
                  marginBottom: '8px'
                }}>
                  Email *
                </label>
                <input
                  type="email"
                  value={billingAddress.email}
                  onChange={(e) => handleBillingChange('email', e.target.value)}
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

            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#121417',
                marginBottom: '8px'
              }}>
                Address *
              </label>
              <input
                type="text"
                placeholder="123 Main Street"
                value={billingAddress.address}
                onChange={(e) => handleBillingChange('address', e.target.value)}
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

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: '16px'
            }}>
              <div>
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
                  onChange={(e) => handleBillingChange('city', e.target.value)}
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

              <div>
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
                  onChange={(e) => handleBillingChange('state', e.target.value)}
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

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#121417',
                  marginBottom: '8px'
                }}>
                  ZIP Code
                </label>
                <input
                  type="text"
                  value={billingAddress.zipCode}
                  onChange={(e) => handleBillingChange('zipCode', e.target.value)}
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

          {/* Pay Button */}
          <button
            onClick={handlePayNow}
            disabled={isProcessing}
            style={{
              width: '100%',
              padding: '16px',
              backgroundColor: isProcessing ? '#e5e8eb' : '#0D80F2',
              color: isProcessing ? '#607589' : 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '18px',
              fontWeight: '700',
              cursor: isProcessing ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s'
            }}
          >
            {isProcessing ? 'Processing...' : `Pay ${formatPrice(calculateTotal())}`}
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
                  {item.image ? (
                    <img 
                      src={item.image} 
                      alt={item.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        borderRadius: '8px'
                      }}
                    />
                  ) : (
                    'No Image'
                  )}
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
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>🔒</div>
            <div style={{ fontSize: '12px', color: '#607589', lineHeight: '1.4' }}>
              Your payment information is secure and encrypted
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment; 