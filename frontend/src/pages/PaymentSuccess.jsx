import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useCart } from '../context/CartContext';
import { useOrders } from '../context/OrderContext';
import Layout from '../components/Layout';

const PaymentSuccess = () => {
  const { user, isLoggedIn } = useUser();
  const { getCartItemsCount } = useCart();
  const { getOrderById } = useOrders();
  const [searchParams] = useSearchParams();
  
  // Get order number from URL parameters
  const orderNumber = searchParams.get('orderNumber');
  
  // Get order data from context using order number
  const orderData = orderNumber ? getOrderById(orderNumber) : null;
  
  // If no order found, create fallback data
  const displayOrderData = orderData || {
    orderNumber: orderNumber || 'AWE00000000',
    date: new Date().toLocaleDateString(),
    estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    total: 0
  };

  console.log('PaymentSuccess - Order number from URL:', orderNumber);
  console.log('PaymentSuccess - Order data from context:', orderData);
  console.log('PaymentSuccess - Display order data:', displayOrderData);

  return (
    <Layout>
      <div style={{
        backgroundColor: '#f8f9fa',
        minHeight: 'calc(100vh - 140px)',
        fontFamily: "'Space Grotesk', Arial, sans-serif",
        paddingBottom: '40px'
      }}>
        {/* Main Content */}
        <main style={{
          display: 'flex',
          justifyContent: 'center',
          padding: '40px 20px 20px',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '48px',
            maxWidth: '600px',
            width: '100%',
            textAlign: 'center',
            border: '1px solid #e5e8eb',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
          }}>
            {/* Success Icon */}
            <div style={{
              width: '80px',
              height: '80px',
              backgroundColor: '#10b981',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 32px',
              fontSize: '40px'
            }}>
              ✓
            </div>

            {/* Success Message */}
            <h1 style={{
              fontSize: '32px',
              fontWeight: '700',
              color: '#121417',
              marginBottom: '16px'
            }}>
              Payment Successful!
            </h1>

            <p style={{
              fontSize: '18px',
              color: '#607589',
              marginBottom: '32px',
              lineHeight: '1.5'
            }}>
              Thank you for your purchase.
            </p>

            {/* Order Details */}
            <div style={{
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              padding: '24px',
              marginBottom: '24px',
              textAlign: 'left'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#121417',
                marginBottom: '16px'
              }}>
                Order Details
              </h3>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px',
                fontSize: '14px'
              }}>
                <div>
                  <span style={{ color: '#607589' }}>Order Number:</span>
                  <div style={{ fontWeight: '600', color: '#121417' }}>
                    {displayOrderData.orderNumber}
                  </div>
                </div>
                <div>
                  <span style={{ color: '#607589' }}>Order Date:</span>
                  <div style={{ fontWeight: '600', color: '#121417' }}>
                    {displayOrderData.date || 'N/A'}
                  </div>
                </div>
                <div>
                  <span style={{ color: '#607589' }}>Total Amount:</span>
                  <div style={{ fontWeight: '600', color: '#121417' }}>
                    ${displayOrderData.total?.toFixed(2) || '0.00'}
                  </div>
                </div>
                <div>
                  <span style={{ color: '#607589' }}>Estimated Delivery:</span>
                  <div style={{ fontWeight: '600', color: '#121417' }}>
                    {displayOrderData.estimatedDelivery}
                  </div>
                </div>
              </div>
            </div>

            {/* Next Steps Info */}
            <div style={{
              backgroundColor: '#f0f7ff',
              borderRadius: '8px',
              padding: '20px',
              marginBottom: '32px',
              border: '1px solid #0D80F2'
            }}>
              <ul style={{
                textAlign: 'left',
                fontSize: '14px',
                color: '#607589',
                lineHeight: '1.6',
                paddingLeft: '20px',
                margin: 0
              }}>
                <li>You'll receive an order confirmation email shortly</li>
                <li>We'll send you tracking information once your order ships</li>
                <li>Track your order status anytime in your dashboard</li>
                <li>Your order will be delivered within 5-7 business days</li>
              </ul>
            </div>
            <p style={{
                fontSize: '14px',
                color: '#607589',
                marginTop: '16px',
                fontStyle: 'italic'
              }}>
                You can also track your order anytime in your dashboard
              </p>
            {/* Action Buttons */}
            <div style={{
              marginBottom: '24px'
            }}>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#121417',
                marginBottom: '20px'
              }}>
                What would you like to do next?
              </h3>
              
              <div style={{
                display: 'flex',
                gap: '16px',
                justifyContent: 'center',
                flexWrap: 'wrap'
              }}>
                <Link
                  to="/dashboard"
                  style={{
                    backgroundColor: '#0D80F2',
                    color: 'white',
                    textDecoration: 'none',
                    padding: '16px 32px',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'background-color 0.2s',
                    minWidth: '200px',
                    justifyContent: 'center'
                  }}
                >
                  <span></span>
                  View My Dashboard
                </Link>
                <Link
                  to="/product"
                  style={{
                    backgroundColor: 'white',
                    color: '#0D80F2',
                    textDecoration: 'none',
                    padding: '16px 32px',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    border: '2px solid #0D80F2',
                    transition: 'all 0.2s',
                    minWidth: '200px',
                    justifyContent: 'center'
                  }}
                >
                  <span></span>
                  Continue Shopping
                </Link>
              </div>
              
              
            </div>
            {/* Support Info */}
            <div style={{
              paddingTop: '16px',
              borderTop: '1px solid #e5e8eb',
              fontSize: '14px',
              color: '#607589'
            }}>
              <p style={{ margin: '0' }}>
                Need help? Contact our{' '}
                <Link
                  to="/customer-support"
                  style={{
                    color: '#0D80F2',
                    textDecoration: 'none',
                    fontWeight: '500'
                  }}
                >
                  customer support team
                </Link>
              </p>
            </div>
          </div>
        </main>
      </div>
    </Layout>
  );
};

export default PaymentSuccess; 