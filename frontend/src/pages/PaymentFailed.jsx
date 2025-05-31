import React from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useCart } from '../context/CartContext';
import Layout from '../components/Layout';

const PaymentFailed = () => {
  const { user, isLoggedIn } = useUser();
  const { getCartItemsCount } = useCart();

  return (
    <Layout>
      <div style={{
        backgroundColor: '#f8f9fa',
        minHeight: '100vh',
        fontFamily: "'Space Grotesk', Arial, sans-serif"
      }}>
        {/* Main Content */}
        <main style={{
          display: 'flex',
          justifyContent: 'center',
          padding: '40px 20px',
          height: 'auto'
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
            {/* Error Icon */}
            <div style={{
              width: '80px',
              height: '80px',
              backgroundColor: '#dc2626',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 32px',
              fontSize: '40px',
              color: 'white'
            }}>
              ✕
            </div>

            {/* Error Message */}
            <h1 style={{
              fontSize: '32px',
              fontWeight: '700',
              color: '#121417',
              marginBottom: '16px'
            }}>
              Payment Failed
            </h1>

            <p style={{
              fontSize: '18px',
              color: '#607589',
              marginBottom: '32px',
              lineHeight: '1.5'
            }}>
              We're sorry, but your payment could not be processed. Please try again or use a different payment method.
            </p>
            {/* Action Buttons */}
            <div style={{
              display: 'flex',
              gap: '16px',
              justifyContent: 'center',
              flexWrap: 'wrap',
              marginBottom: '32px'
            }}>
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
                  display: 'inline-block',
                  transition: 'background-color 0.2s'
                }}
              >
                Try Again
              </Link>
              <Link
                to="/cart"
                style={{
                  backgroundColor: 'white',
                  color: '#0D80F2',
                  textDecoration: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  display: 'inline-block',
                  border: '2px solid #0D80F2',
                  transition: 'all 0.2s'
                }}
              >
                Back to Cart
              </Link>
              
            </div>

            {/* Support Info */}
            <div style={{
              paddingTop: '24px',
              borderTop: '1px solid #e5e8eb',
              fontSize: '14px',
              color: '#607589'
            }}>
              <p>
                Need help? Contact our{' '}
                <Link
                  to="/support"
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

export default PaymentFailed; 