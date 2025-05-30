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
  
  const [isProcessing, setIsProcessing] = useState(false);

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

  const handleInputChange = (field, value) => {
    setPaymentData(prev => ({
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

  const simulatePayment = () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Always return success for testing
        const success = true; // Changed from Math.random() > 0.3 to always true
        resolve(success);
      }, 2000);
    });
  };

  const handlePayNow = async () => {
    // Basic validation
    if (!paymentData.cardNumber || !paymentData.expiryMonth || !paymentData.expiryYear || !paymentData.cvv || !paymentData.nameOnCard) {
      alert('Please fill in all payment fields');
      return;
    }

    setIsProcessing(true);

    try {
      const paymentSuccess = await simulatePayment();
      
      if (paymentSuccess) {
        // Create order before clearing cart
        const orderNumber = 'AWE' + Math.random().toString().substr(2, 8).toUpperCase();
        const orderToSave = {
          orderNumber: orderNumber,
          orderDate: new Date().toLocaleDateString(),
          estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
          total: calculateTotal(),
          items: cartItems.map(item => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            image: item.image
          }))
        };
        
        console.log('Payment - Saving order before clearing cart:', orderToSave);
        addOrder(orderToSave);
        
        // Clear cart after saving order
        clearCart();
        
        // Navigate with order number as URL parameter
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
          <h2>Your cart is empty</h2>
          <p>Please add items to your cart before proceeding to payment.</p>
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
            <Link to="/order-confirmation" style={{ color: '#61758A', textDecoration: 'none' }}>Checkout</Link>
            <span style={{ margin: '0 8px' }}>/</span>
            <span style={{ color: '#121417', fontWeight: '500' }}>Payment</span>
          </div>

          {/* Page Title */}
          <h1 style={{
            fontSize: '32px',
            fontWeight: '700',
            color: '#121417',
            margin: '0 0 32px 0'
          }}>
            Payment
          </h1>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 300px',
            gap: '32px',
            alignItems: 'start'
          }}>
            {/* Payment Form */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '32px'
            }}>
              {/* Payment Method Selection */}
              <div style={{ marginBottom: '32px' }}>
                <h2 style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  color: '#121417',
                  margin: '0 0 16px 0'
                }}>
                  Payment Method
                </h2>
                
                <div style={{
                  border: '2px solid #0D80F2',
                  borderRadius: '8px',
                  padding: '16px',
                  backgroundColor: '#f0f7ff'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <input
                      type="radio"
                      id="creditCard"
                      name="paymentMethod"
                      checked={true}
                      readOnly
                      style={{ margin: 0 }}
                    />
                    <label htmlFor="creditCard" style={{
                      fontSize: '16px',
                      fontWeight: '500',
                      color: '#121417'
                    }}>
                      Credit/Debit Card
                    </label>
                  </div>
                </div>
              </div>

              {/* Card Information */}
              <div style={{ marginBottom: '32px' }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#121417',
                  margin: '0 0 16px 0'
                }}>
                  Card Information
                </h3>

                <div style={{
                  display: 'grid',
                  gap: '16px'
                }}>
                  {/* Card Number */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#121417',
                      marginBottom: '8px'
                    }}>
                      Card Number
                    </label>
                    <input
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      value={paymentData.cardNumber}
                      onChange={(e) => handleCardNumberChange(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #DBE0E5',
                        borderRadius: '8px',
                        fontSize: '16px',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  {/* Expiry and CVV */}
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
                        Expiry Month
                      </label>
                      <select
                        value={paymentData.expiryMonth}
                        onChange={(e) => handleInputChange('expiryMonth', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: '1px solid #DBE0E5',
                          borderRadius: '8px',
                          fontSize: '16px',
                          outline: 'none',
                          backgroundColor: 'white'
                        }}
                      >
                        <option value="">MM</option>
                        {Array.from({ length: 12 }, (_, i) => (
                          <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                            {String(i + 1).padStart(2, '0')}
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
                        Expiry Year
                      </label>
                      <select
                        value={paymentData.expiryYear}
                        onChange={(e) => handleInputChange('expiryYear', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: '1px solid #DBE0E5',
                          borderRadius: '8px',
                          fontSize: '16px',
                          outline: 'none',
                          backgroundColor: 'white'
                        }}
                      >
                        <option value="">YYYY</option>
                        {Array.from({ length: 10 }, (_, i) => (
                          <option key={i} value={2025 + i}>
                            {2025 + i}
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
                        CVV
                      </label>
                      <input
                        type="text"
                        placeholder="123"
                        maxLength="4"
                        value={paymentData.cvv}
                        onChange={(e) => handleInputChange('cvv', e.target.value.replace(/\D/g, ''))}
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: '1px solid #DBE0E5',
                          borderRadius: '8px',
                          fontSize: '16px',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  </div>

                  {/* Name on Card */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#121417',
                      marginBottom: '8px'
                    }}>
                      Name on Card
                    </label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      value={paymentData.nameOnCard}
                      onChange={(e) => handleInputChange('nameOnCard', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #DBE0E5',
                        borderRadius: '8px',
                        fontSize: '16px',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  {/* Save Card Checkbox */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginTop: '8px'
                  }}>
                    <input
                      type="checkbox"
                      id="saveCard"
                      checked={paymentData.saveCard}
                      onChange={(e) => handleInputChange('saveCard', e.target.checked)}
                      style={{
                        width: '16px',
                        height: '16px'
                      }}
                    />
                    <label htmlFor="saveCard" style={{
                      fontSize: '14px',
                      color: '#61758A'
                    }}>
                      Save this card for future purchases
                    </label>
                  </div>
                </div>
              </div>

              {/* Processing Payment Message */}
              {isProcessing && (
                <div style={{
                  backgroundColor: '#f0f7ff',
                  border: '1px solid #0D80F2',
                  borderRadius: '8px',
                  padding: '16px',
                  marginBottom: '24px',
                  textAlign: 'center'
                }}>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: '500',
                    color: '#0D80F2',
                    marginBottom: '8px'
                  }}>
                    Processing Payment...
                  </div>
                  <div style={{
                    fontSize: '14px',
                    color: '#61758A'
                  }}>
                    Please do not close this page or press the back button.
                  </div>
                </div>
              )}

              {/* Pay Button */}
              <button
                onClick={handlePayNow}
                disabled={isProcessing}
                style={{
                  width: '100%',
                  backgroundColor: isProcessing ? '#94a3b8' : '#0D80F2',
                  color: 'white',
                  border: 'none',
                  padding: '16px 24px',
                  borderRadius: '8px',
                  fontSize: '18px',
                  fontWeight: '700',
                  cursor: isProcessing ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.2s'
                }}
              >
                {isProcessing ? 'Processing...' : `Pay Now - ${formatPrice(calculateTotal())}`}
              </button>
            </div>

            {/* Order Summary */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '24px'
            }}>
              <h2 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#121417',
                margin: '0 0 20px 0'
              }}>
                Order Summary
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

export default Payment; 