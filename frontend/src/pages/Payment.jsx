import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useCart } from '../context/CartContext';
import { useOrders } from '../context/OrderContext';
import { useTheme } from '../context/ThemeContext';
import { getProductImageUrl } from '../utils/imageMap';
import Layout from '../components/Layout';

const Payment = () => {
  const { user, isLoggedIn } = useUser();
  const { cartItems, getCartItemsCount, clearCart, getCartTotal } = useCart();
  const { addOrder } = useOrders();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [paymentData, setPaymentData] = useState({
    paymentMethod: 'credit_card',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  });
  
  // Address data from OrderConfirmation page
  const [shippingAddress, setShippingAddress] = useState(null);
  const [billingAddress, setBillingAddress] = useState(null);
  const [useShippingAsBilling, setUseShippingAsBilling] = useState(true);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card'); // 'card', 'paypal', 'apple_pay'
  const [error, setError] = useState('');
  const [paymentSuccessful, setPaymentSuccessful] = useState(false);

  // Load address data from OrderConfirmation page
  useEffect(() => {
    const savedShippingAddress = localStorage.getItem('orderShippingAddress');
    const savedBillingAddress = localStorage.getItem('orderBillingAddress');
    
    console.log('Payment - Loading addresses from localStorage');
    console.log('Shipping Address:', savedShippingAddress);
    console.log('Billing Address:', savedBillingAddress);
    
    if (savedShippingAddress) {
      const shippingData = JSON.parse(savedShippingAddress);
      setShippingAddress(shippingData);
      console.log('Payment - Parsed shipping address:', shippingData);
    }
    
    if (savedBillingAddress) {
      const billingData = JSON.parse(savedBillingAddress);
      setBillingAddress(billingData);
      setUseShippingAsBilling(false);
      console.log('Payment - Parsed billing address:', billingData);
      console.log('Payment - Set useShippingAsBilling to false');
    } else {
      // If no separate billing address, use shipping as billing
      setUseShippingAsBilling(true);
      console.log('Payment - No separate billing address, using shipping as billing');
    }
  }, []);

  // Update billing address when useShippingAsBilling changes
  useEffect(() => {
    if (useShippingAsBilling && shippingAddress) {
      setBillingAddress(shippingAddress);
    }
  }, [useShippingAsBilling, shippingAddress]);

  // Helper function to check if two addresses are different
  const areAddressesDifferent = (addr1, addr2) => {
    if (!addr1 || !addr2) return false;
    return addr1.street !== addr2.street ||
           addr1.city !== addr2.city ||
           addr1.state !== addr2.state ||
           addr1.postalCode !== addr2.postalCode ||
           addr1.country !== addr2.country;
  };

  // Redirect if not logged in or cart is empty
  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login?redirect=payment');
      return;
    }
    
    // Don't redirect if payment is being processed or payment was successful
    if (cartItems.length === 0 && !isProcessing && !paymentSuccessful) {
      navigate('/cart');
      return;
    }
  }, [isLoggedIn, cartItems.length, navigate, isProcessing, paymentSuccessful]);

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

  // Generate unique order number
  const generateOrderNumber = () => {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2); // Get last 2 digits of year
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Month, zero-padded
    const day = date.getDate().toString().padStart(2, '0'); // Day, zero-padded
    const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0'); // 4-digit random number
    return `AWE${year}${month}${day}${random}`;
  };

  // Common input style for theme support
  const getInputStyle = () => ({
    width: '100%',
    padding: '12px',
    border: `1px solid ${theme?.border || '#e5e8eb'}`,
    borderRadius: '8px',
    fontSize: '16px',
    boxSizing: 'border-box',
    backgroundColor: theme?.cardBg || 'white',
    color: theme?.textPrimary || '#121417',
    outline: 'none',
    transition: 'border-color 0.2s ease'
  });

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

  const validateCardNumber = (cardNumber) => {
    const cleanNumber = cardNumber.replace(/\s/g, '');
    
    // Test card numbers - always valid
    const testCardNumbers = [
      '4242424242424242', // Visa test card
    ];
    
    if (testCardNumbers.includes(cleanNumber)) {
      return true;
    }
    
    // Basic length check for real card numbers
    return cleanNumber.length >= 13 && cleanNumber.length <= 19;
  };

  // Luhn算法验证银行卡号
  const luhnValidate = (cardNumber) => {
    const cleanNumber = cardNumber.replace(/\s/g, '');
    
    // 检查是否只包含数字
    if (!/^\d+$/.test(cleanNumber)) {
      return false;
    }
    
    // 检查长度（13-19位）
    if (cleanNumber.length < 13 || cleanNumber.length > 19) {
      return false;
    }
    
    // Luhn算法验证
    let sum = 0;
    let shouldDouble = false;
    
    // 从右到左遍历
    for (let i = cleanNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cleanNumber.charAt(i));
      
      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      
      sum += digit;
      shouldDouble = !shouldDouble;
    }
    
    return (sum % 10) === 0;
  };

  // 获取卡片类型和相关规则
  const getCardInfo = (cardNumber) => {
    const cleanNumber = cardNumber.replace(/\s/g, '');
    
    // 卡片类型识别规则
    const cardTypes = {
      visa: {
        pattern: /^4/,
        lengths: [13, 16, 19],
        name: 'Visa'
      },
      mastercard: {
        pattern: /^5[1-5]|^2[2-7]/,
        lengths: [16],
        name: 'Mastercard'
      },
      amex: {
        pattern: /^3[47]/,
        lengths: [15],
        name: 'American Express'
      },
      discover: {
        pattern: /^6(?:011|5)/,
        lengths: [16],
        name: 'Discover'
      },
      jcb: {
        pattern: /^35/,
        lengths: [16],
        name: 'JCB'
      }
    };
    
    for (const [key, type] of Object.entries(cardTypes)) {
      if (type.pattern.test(cleanNumber) && type.lengths.includes(cleanNumber.length)) {
        return { type: key, name: type.name, valid: true };
      }
    }
    
    return { type: 'unknown', name: 'Unknown', valid: false };
  };

  const validateExpiry = (expiryDate) => {
    if (!expiryDate || expiryDate.length !== 5) return false;
    
    const [month, year] = expiryDate.split('/');
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100;
    const currentMonth = currentDate.getMonth() + 1;
    
    const cardMonth = parseInt(month);
    const cardYear = parseInt(year);
    
    if (cardMonth < 1 || cardMonth > 12) return false;
    if (cardYear < currentYear) return false;
    if (cardYear === currentYear && cardMonth < currentMonth) return false;
    
    return true;
  };

  const simulatePayment = async (method) => {
    console.log('Payment - Starting payment simulation...');
    
    // Simulate payment processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 基于银行卡算法的验证逻辑
    if (method === 'card') {
      const cleanCardNumber = paymentData.cardNumber.replace(/\s/g, '');
      const cvv = paymentData.cvv;
      const cardholderName = paymentData.cardholderName.trim();
      const expiryDate = paymentData.expiryDate;
      
      console.log('Payment - Validating card details...');
      
      // 1. 验证卡号是否符合Luhn算法
      const isLuhnValid = luhnValidate(cleanCardNumber);
      console.log('Payment - Luhn validation:', isLuhnValid);
      
      if (!isLuhnValid) {
        console.log('Payment - Card number failed Luhn validation');
        return false;
      }
      
      // 2. 验证卡片类型
      const cardInfo = getCardInfo(cleanCardNumber);
      console.log('Payment - Card type:', cardInfo);
      
      if (!cardInfo.valid) {
        console.log('Payment - Invalid card type or format');
        return false;
      }
      
      // 3. 验证有效期
      if (!validateExpiry(expiryDate)) {
        console.log('Payment - Invalid expiry date');
        return false;
      }
      
      // 4. 验证CVV长度（美国运通15位卡号需要4位CVV，其他3位）
      const expectedCvvLength = cardInfo.type === 'amex' ? 4 : 3;
      if (cvv.length !== expectedCvvLength) {
        console.log('Payment - Invalid CVV length for card type');
        return false;
      }
      
      // 5. 验证持卡人姓名
      if (!cardholderName || cardholderName.length < 2) {
        console.log('Payment - Invalid cardholder name');
        return false;
      }
      
      // 6. 特殊测试场景（保留一些测试功能）
      // CVV特殊值触发失败
      const failureCVVs = ['000', '999'];
      if (failureCVVs.includes(cvv)) {
        console.log('Payment - Test failure CVV detected:', cvv);
        return false;
      }
      
      // 持卡人姓名包含特定关键词触发失败
      if (cardholderName.toLowerCase().includes('fail') || 
          cardholderName.toLowerCase().includes('decline')) {
        console.log('Payment - Test failure name detected:', cardholderName);
        return false;
      }
      
      // 7. 基于卡号末位数字的逻辑
      const lastDigit = parseInt(cleanCardNumber.slice(-1));
      
      // 如果卡号末位是0或5，模拟余额不足
      if (lastDigit === 0 || lastDigit === 5) {
        console.log('Payment - Simulated insufficient funds (last digit:', lastDigit, ')');
        return false;
      }
      
      // 如果卡号末位是1或6，模拟银行拒绝
      if (lastDigit === 1 || lastDigit === 6) {
        console.log('Payment - Simulated bank decline (last digit:', lastDigit, ')');
        return false;
      }
      
      console.log('Payment - All validations passed, payment approved');
      return true;
    }
    
    // 对于非卡片支付方式，90%成功率
    const success = Math.random() > 0.1;
    console.log('Payment - Non-card payment result:', success ? 'success' : 'failure');
    
    return success;
  };

  const handlePayNow = async () => {
    try {
      setIsProcessing(true);
      setError('');

      // Validate shipping address exists
      if (!shippingAddress) {
        alert('Please fill in the shipping address information');
        navigate('/order-confirmation');
        return;
      }

      // Validate payment information based on method
      if (paymentMethod === 'card') {
        if (!paymentData.cardholderName || !paymentData.cardNumber || !paymentData.expiryDate || !paymentData.cvv) {
          setError('Please fill in all required payment information');
          return;
        }

        if (!validateCardNumber(paymentData.cardNumber)) {
          setError('Please enter a valid card number');
          return;
        }

        if (!validateExpiry(paymentData.expiryDate)) {
          setError('Please enter a valid expiry date');
          return;
        }

        if (paymentData.cvv.length < 3) {
          setError('Please enter a valid CVV');
          return;
        }
      }

      console.log('Payment - Processing payment...');
      
      const paymentSuccessful = await simulatePayment(paymentMethod);
      
      if (paymentSuccessful) {
        console.log('Payment - Payment successful, creating order...');
        setPaymentSuccessful(true);
        
        // Generate unique order number
        const orderNumber = generateOrderNumber();
        const orderDate = new Date().toISOString();
        
        // Create comprehensive order data with proper address structure
        const orderData = {
          id: orderNumber,
          orderNumber: orderNumber,
          date: new Date().toLocaleDateString(),
          orderDate: orderDate,
          items: cartItems.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.images?.[0] || ''
          })),
          // Structured address data for backend compatibility
          shippingAddress: {
            fullName: user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Customer',
            phone: user?.phone || '',
            street: shippingAddress.street,
            city: shippingAddress.city,
            state: shippingAddress.state,
            postalCode: shippingAddress.postalCode,
            country: shippingAddress.country || 'Australia'
          },
          billingAddress: {
            fullName: user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Customer',
            phone: user?.phone || '',
            street: (billingAddress || shippingAddress).street,
            city: (billingAddress || shippingAddress).city,
            state: (billingAddress || shippingAddress).state,
            postalCode: (billingAddress || shippingAddress).postalCode,
            country: (billingAddress || shippingAddress).country || 'Australia'
          },
          paymentMethod: paymentMethod,
          subtotal: calculateSubtotal(),
          shipping: getShippingCost(),
          tax: getTaxAmount(),
          total: calculateTotal(),
          status: 'Processing',
          estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
          userId: user?.id || user?.email,
          createdAt: orderDate
        };

        console.log('Payment - Creating order with data:', orderData);

        // Add order to context
        await addOrder(orderData);
        
        // Clear cart
        await clearCart();
        
        // Clear saved addresses
        localStorage.removeItem('orderShippingAddress');
        localStorage.removeItem('orderBillingAddress');
        
        console.log('Payment - Order created successfully, redirecting to success page with order:', orderNumber);
        // Navigate to success page with order number
        navigate(`/payment-success?orderNumber=${orderNumber}`);
        return;
      } else {
        console.log('Payment - Payment failed, redirecting to failure page');
        navigate('/payment-failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('支付处理失败，请重试。');
      navigate('/payment-failed');
    } finally {
      // Only reset isProcessing if payment was not successful
      if (!paymentSuccessful) {
        setIsProcessing(false);
      }
    }
  };

  return (
    <Layout>
      <div style={{
        backgroundColor: theme?.background || '#f8f9fa',
        fontFamily: "'Space Grotesk', Arial, sans-serif"
      }}>
        {/* Breadcrumb */}
        <div style={{
          backgroundColor: theme?.cardBg || 'white',
          borderBottom: `1px solid ${theme?.border || '#e5e8eb'}`
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '20px 40px',
            fontSize: '14px',
            color: theme?.textSecondary || '#607589'
          }}>
            <Link to="/" style={{ color: theme?.textSecondary || '#607589', textDecoration: 'none' }}>Home</Link>
            <span style={{ margin: '0 8px' }}>/</span>
            <Link to="/cart" style={{ color: theme?.textSecondary || '#607589', textDecoration: 'none' }}>Cart</Link>
            <span style={{ margin: '0 8px' }}>/</span>
            <Link to="/order-confirmation" style={{ color: theme?.textSecondary || '#607589', textDecoration: 'none' }}>Order Confirmation</Link>
            <span style={{ margin: '0 8px' }}>/</span>
            <span style={{ color: theme?.textPrimary || '#121417' }}>Payment</span>
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
          {/* Payment Form */}
          <div style={{
            flex: '2',
            backgroundColor: theme?.cardBg || 'white',
            borderRadius: '8px',
            padding: '32px',
            border: `1px solid ${theme?.border || '#e5e8eb'}`,
            boxShadow: theme?.shadowLight
          }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '700',
              color: theme?.textPrimary || '#121417',
              marginBottom: '24px'
            }}>
              Payment Information
            </h2>

            {/* Error Message */}
            {error && (
              <div style={{
                backgroundColor: '#fee',
                color: '#c33',
                padding: '12px',
                borderRadius: '8px',
                marginBottom: '24px',
                fontSize: '14px'
              }}>
                {error}
              </div>
            )}

            {/* Payment Method Selection */}
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: theme?.textPrimary || '#121417',
                marginBottom: '16px'
              }}>
                Payment Method
              </h3>
              <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                {[
                  { id: 'card', label: 'Credit/Debit Card' },
                  { id: 'paypal', label: 'PayPal' },
                  { id: 'apple_pay', label: 'Apple Pay' }
                ].map(method => (
                  <button
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id)}
                    style={{
                      flex: 1,
                      padding: '16px',
                      border: `2px solid ${paymentMethod === method.id ? (theme?.primary || '#0D80F2') : (theme?.border || '#e5e8eb')}`,
                      borderRadius: '8px',
                      backgroundColor: paymentMethod === method.id ? (theme?.primaryLight || '#f0f7ff') : (theme?.cardBg || 'white'),
                      color: theme?.textPrimary || '#121417',
                      cursor: 'pointer',
                      textAlign: 'center',
                      fontSize: '14px',
                      fontWeight: '500',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ fontSize: '24px', marginBottom: '8px' }}></div>
                    {method.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Card Payment Form */}
            {paymentMethod === 'card' && (
              <div style={{ marginBottom: '32px' }}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: theme?.textPrimary || '#121417',
                    marginBottom: '8px'
                  }}>
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    value={paymentData.cardholderName}
                    onChange={(e) => handleInputChange('cardholderName', e.target.value)}
                    placeholder="Enter your name"
                    style={getInputStyle()}
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: theme?.textPrimary || '#121417',
                    marginBottom: '8px'
                  }}>
                    Card Number
                  </label>
                  <input
                    type="text"
                    value={paymentData.cardNumber}
                    onChange={(e) => handleCardNumberChange(e.target.value)}
                    placeholder="please enter the card number"
                    style={getInputStyle()}
                  />
                </div>

                <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: theme?.textPrimary || '#121417',
                      marginBottom: '8px'
                    }}>
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      value={paymentData.expiryDate}
                      onChange={(e) => {
                        let value = e.target.value.replace(/\D/g, '');
                        if (value.length >= 2) {
                          value = value.substring(0, 2) + '/' + value.substring(2, 4);
                        }
                        handleInputChange('expiryDate', value);
                      }}
                      placeholder="MM/YY"
                      maxLength="5"
                      style={getInputStyle()}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: theme?.textPrimary || '#121417',
                      marginBottom: '8px'
                    }}>
                      CVV
                    </label>
                    <input
                      type="text"
                      value={paymentData.cvv}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        if (value.length <= 4) {
                          handleInputChange('cvv', value);
                        }
                      }}
                      placeholder="123"
                      maxLength="4"
                      style={getInputStyle()}
                    />
                  </div>
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
                <div style={{ fontSize: '48px', marginBottom: '16px' }}></div>
                <p style={{ fontSize: '16px', color: '#607589', marginBottom: '16px' }}>
                  You will be redirected to PayPal to complete your payment
                </p>
                <div style={{ fontSize: '14px', color: '#607589' }}>
                  Secure payment powered by PayPal
                </div>
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
                <div style={{ fontSize: '48px', marginBottom: '16px' }}></div>
                <p style={{ fontSize: '16px', color: '#607589', marginBottom: '16px' }}>
                  Use Touch ID or Face ID to pay with Apple Pay
                </p>
                <div style={{ fontSize: '14px', color: '#607589' }}>
                  Secure payment with Apple Pay
                </div>

                <p style={{ fontSize: '16px', color: theme?.textSecondary || '#607589', marginBottom: '16px' }}>
                  Use Touch ID or Face ID to pay with Apple Pay
                </p>
                <div style={{ fontSize: '14px', color: theme?.textMuted || '#607589' }}>
                  Secure payment with Apple Pay
                </div>
              </div>
            )}

            {/* Pay Now Button */}
            <button
              onClick={handlePayNow}
              disabled={isProcessing}
              style={{
                width: '100%',
                padding: '16px',
                backgroundColor: isProcessing ? (theme?.textMuted || '#e5e8eb') : (theme?.primary || '#0D80F2'),
                color: isProcessing ? (theme?.textSecondary || '#607589') : 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '18px',
                fontWeight: '700',
                cursor: isProcessing ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => {
                if (!isProcessing) {
                  e.target.style.backgroundColor = theme?.primaryHover || '#0a68c4';
                }
              }}
              onMouseLeave={(e) => {
                if (!isProcessing) {
                  e.target.style.backgroundColor = theme?.primary || '#0D80F2';
                }
              }}
            >
              {isProcessing ? 'Processing...' : `Pay ${formatPrice(calculateTotal())}`}
            </button>
          </div>

          {/* Order Summary */}
          <div style={{
            flex: '1',
            backgroundColor: theme?.cardBg || 'white',
            borderRadius: '8px',
            padding: '32px',
            border: `1px solid ${theme?.border || '#e5e8eb'}`,
            height: 'fit-content',
            boxShadow: theme?.shadowLight
          }}>
            <h3 style={{
              fontSize: '20px',
              fontWeight: '700',
              color: theme?.textPrimary || '#121417',
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
                  borderBottom: `1px solid ${theme?.border || '#f0f2f5'}`
                }}>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    backgroundColor: theme?.backgroundSecondary || '#f8f9fa',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    color: theme?.textMuted || '#607589',
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
                            objectFit: 'contain',
                            borderRadius: '8px'
                          }}
                          onError={(e) => {
                            console.log('Image loading failed:', imageUrl);
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
                      color: theme?.textPrimary || '#121417',
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

                    <div style={{
                      fontSize: '14px',
                      color: theme?.textSecondary || '#607589'
                    }}>
                      Qty: {item.quantity} × {formatPrice(item.price)}
                    </div>
                  </div>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: theme?.textPrimary || '#121417'
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
                <span style={{ fontSize: '14px', color: theme?.textSecondary || '#607589' }}>Subtotal:</span>
                <span style={{ fontSize: '14px', color: theme?.textPrimary || '#121417' }}>{formatPrice(calculateSubtotal())}</span>
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
                <span style={{ fontSize: '14px', color: theme?.textSecondary || '#607589' }}>Tax:</span>
                <span style={{ fontSize: '14px', color: theme?.textPrimary || '#121417' }}>{formatPrice(getTaxAmount())}</span>
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

            {/* Shipping Address Display */}
            {shippingAddress && (
              <div style={{
                marginBottom: '24px',
                padding: '16px',
                backgroundColor: theme?.backgroundSecondary || '#f8f9fa',
                borderRadius: '8px',
                border: `1px solid ${theme?.border || '#e5e8eb'}`
              }}>
                <h4 style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: theme?.textPrimary || '#121417',
                  marginBottom: '12px',
                  margin: '0 0 12px 0'
                }}>
                  Shipping Address
                </h4>
                <div style={{
                  fontSize: '14px',
                  color: theme?.textPrimary || '#121417',
                  lineHeight: '1.5'
                }}>
                  <div>{shippingAddress.street}</div>
                  <div>
                    {[shippingAddress.city, shippingAddress.state, shippingAddress.postalCode]
                      .filter(Boolean)
                      .join(', ')}
                  </div>
                  <div>{shippingAddress.country}</div>
                </div>
              </div>
            )}

            {/* Billing Address Display (only if explicitly saved as different) */}
            {localStorage.getItem('orderBillingAddress') && billingAddress && areAddressesDifferent(shippingAddress, billingAddress) && (
              <div style={{
                marginBottom: '24px',
                padding: '16px',
                backgroundColor: theme?.backgroundSecondary || '#f8f9fa',
                borderRadius: '8px',
                border: `1px solid ${theme?.border || '#e5e8eb'}`
              }}>
                <h4 style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: theme?.textPrimary || '#121417',
                  marginBottom: '12px',
                  margin: '0 0 12px 0'
                }}>
                  Billing Address
                </h4>
                <div style={{
                  fontSize: '14px',
                  color: theme?.textPrimary || '#121417',
                  lineHeight: '1.5'
                }}>
                  <div>{billingAddress.street}</div>
                  <div>
                    {[billingAddress.city, billingAddress.state, billingAddress.postalCode]
                      .filter(Boolean)
                      .join(', ')}
                  </div>
                  <div>{billingAddress.country}</div>
                </div>
              </div>
            )}

            {/* Security Info */}
            <div style={{
              backgroundColor: '#f8f9fa',
              padding: '16px',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '12px', color: '#607589', lineHeight: '1.4' }}>
                Your payment information is secure and encrypted
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Payment; 