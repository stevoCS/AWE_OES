import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { SearchIcon, ShoppingCartIcon } from '../components/ui/icons';
import { useUser } from '../context/UserContext';
import { useCart } from '../context/CartContext';
import { useOrders } from '../context/OrderContext';
import logoIcon from '../assets/Vector - 0.svg';

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
    orderNumber: 'AWE00000000',
    orderDate: new Date().toLocaleDateString(),
    estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    total: 0
  };

  console.log('PaymentSuccess - Order number from URL:', orderNumber);
  console.log('PaymentSuccess - Order data from context:', orderData);
  console.log('PaymentSuccess - Display order data:', displayOrderData);

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
          maxWidth: '600px',
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '48px',
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          {/* Success Icon */}
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: '#16a34a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px auto'
          }}>
            <span style={{
              fontSize: '40px',
              color: 'white'
            }}>
              ✓
            </span>
          </div>

          {/* Success Message */}
          <h1 style={{
            fontSize: '32px',
            fontWeight: '700',
            color: '#121417',
            margin: '0 0 16px 0'
          }}>
            Payment Successful!
          </h1>

          <p style={{
            fontSize: '18px',
            color: '#61758A',
            margin: '0 0 32px 0',
            lineHeight: 1.5
          }}>
            Your order has been successfully processed. You will receive a confirmation email shortly.
          </p>

          {/* Order Summary */}
          <div style={{
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            padding: '24px',
            marginBottom: '32px',
            textAlign: 'left'
          }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#121417',
              margin: '0 0 16px 0',
              textAlign: 'center'
            }}>
              Order Summary
            </h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
              marginBottom: '16px'
            }}>
              <div>
                <div style={{
                  fontSize: '14px',
                  color: '#61758A',
                  fontWeight: '500'
                }}>
                  Order Number
                </div>
                <div style={{
                  fontSize: '16px',
                  color: '#121417',
                  fontWeight: '600'
                }}>
                  {displayOrderData.orderNumber}
                </div>
              </div>

              <div>
                <div style={{
                  fontSize: '14px',
                  color: '#61758A',
                  fontWeight: '500'
                }}>
                  Order Date
                </div>
                <div style={{
                  fontSize: '16px',
                  color: '#121417',
                  fontWeight: '600'
                }}>
                  {displayOrderData.orderDate}
                </div>
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px'
            }}>
              <div>
                <div style={{
                  fontSize: '14px',
                  color: '#61758A',
                  fontWeight: '500'
                }}>
                  Total Amount
                </div>
                <div style={{
                  fontSize: '16px',
                  color: '#121417',
                  fontWeight: '600'
                }}>
                  ${displayOrderData.total.toFixed(2)}
                </div>
              </div>

              <div>
                <div style={{
                  fontSize: '14px',
                  color: '#61758A',
                  fontWeight: '500'
                }}>
                  Estimated Delivery
                </div>
                <div style={{
                  fontSize: '16px',
                  color: '#121417',
                  fontWeight: '600'
                }}>
                  {displayOrderData.estimatedDelivery}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            gap: '16px',
            justifyContent: 'center'
          }}>
            <Link
              to="/dashboard"
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
              View Order Status
            </Link>

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
                fontWeight: '600'
              }}
            >
              Continue Shopping
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

export default PaymentSuccess; 