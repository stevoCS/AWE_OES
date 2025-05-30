import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SearchIcon, ShoppingCartIcon } from '../components/ui/icons';
import { Button } from '../components/ui/button';
import { useUser } from '../context/UserContext';
import { useOrders } from '../context/OrderContext';
import { useCart } from '../context/CartContext';
import logoIcon from '../assets/Vector - 0.svg';

export const UserDashboard = () => {
  const { user, logout, isLoggedIn } = useUser();
  const { orders } = useOrders();
  const { getCartItemsCount } = useCart();
  const navigate = useNavigate();

  // Debug: Log orders data
  React.useEffect(() => {
    console.log('UserDashboard - Current orders:', orders);
    console.log('UserDashboard - Orders length:', orders.length);
    console.log('UserDashboard - User logged in:', isLoggedIn);
  }, [orders, isLoggedIn]);

  // If the user is not logged in, redirect to the login page.
  React.useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
    }
  }, [isLoggedIn, navigate]);

  const handleSignOut = () => {
    logout();
    navigate('/');
  };

  // Use real orders from context instead of mock data
  const orderHistory = orders.length > 0 ? orders.map(order => ({
    id: order.orderNumber,
    date: order.date,
    status: order.status,
    total: `$${order.total.toFixed(2)}`,
    tracking: 'View'
  })) : [
    // Fallback mock data if no orders exist
    { id: '#10545', date: '2023-06-15', status: 'Shipped', total: '$250.00', tracking: 'View' },
    { id: '#67800', date: '2023-07-20', status: 'Delivered', total: '$180.00', tracking: 'View' },
    { id: '#19525', date: '2023-06-05', status: 'Cancelled', total: '$320.00', tracking: 'View' }
  ];

  // Generate invoices based on real orders
  const invoices = orders.length > 0 ? orders.map(order => ({
    id: order.orderNumber,
    date: order.date,
    invoice: 'Download'
  })) : [
    // Fallback mock data
    { id: '#10545', date: '2023-06-15', invoice: 'Download' },
    { id: '#67800', date: '2023-07-20', invoice: 'Download' },
    { id: '#19525', date: '2023-06-05', invoice: 'Download' }
  ];

  if (!user) return null;

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

          {/* Cart Button */}
          <Link to="/cart" style={{
            position: 'relative',
            padding: '8px',
            backgroundColor: '#f0f2f5',
            borderRadius: '8px',
            textDecoration: 'none'
          }}>
            <ShoppingCartIcon style={{ width: '17px', height: '17px', color: '#111416' }} />
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

          {/* User Avatar - clickable to go to Account Management */}
          <Link to="/account" style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #0D80F2, #0a68c4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: '600',
            fontSize: '16px',
            textDecoration: 'none'
          }}>
            {user.firstName?.charAt(0)?.toUpperCase() || 'U'}
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
          maxWidth: '800px',
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '40px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
        }}>
          {/* Dashboard Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '40px'
          }}>
            <h1 style={{
              fontSize: '32px',
              fontWeight: '700',
              color: '#121417',
              margin: '0'
            }}>
              User Dashboard
            </h1>
            <div style={{
              fontSize: '18px',
              color: '#121417',
              fontWeight: '500'
            }}>
              Hi, {user.firstName || 'user name'}
            </div>
          </div>

          {/* Order History Section */}
          <div style={{ marginBottom: '50px' }}>
            <h2 style={{
              fontSize: '22px',
              fontWeight: '700',
              color: '#121417',
              margin: '0 0 24px 0'
            }}>
              Order History
            </h2>

            <div style={{
              border: '1px solid #e5e8eb',
              borderRadius: '8px',
              overflow: 'hidden'
            }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse'
              }}>
                <thead style={{
                  backgroundColor: '#f8f9fa'
                }}>
                  <tr>
                    <th style={{
                      padding: '16px',
                      textAlign: 'left',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#121417',
                      borderBottom: '1px solid #e5e8eb'
                    }}>Order ID</th>
                    <th style={{
                      padding: '16px',
                      textAlign: 'left',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#121417',
                      borderBottom: '1px solid #e5e8eb'
                    }}>Date</th>
                    <th style={{
                      padding: '16px',
                      textAlign: 'left',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#121417',
                      borderBottom: '1px solid #e5e8eb'
                    }}>Status</th>
                    <th style={{
                      padding: '16px',
                      textAlign: 'left',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#121417',
                      borderBottom: '1px solid #e5e8eb'
                    }}>Total</th>
                    <th style={{
                      padding: '16px',
                      textAlign: 'left',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#121417',
                      borderBottom: '1px solid #e5e8eb'
                    }}>Tracking</th>
                  </tr>
                </thead>
                <tbody>
                  {orderHistory.map((order, index) => (
                    <tr key={order.id} style={{
                      borderBottom: index < orderHistory.length - 1 ? '1px solid #e5e8eb' : 'none'
                    }}>
                      <td style={{
                        padding: '16px',
                        fontSize: '14px',
                        color: '#121417'
                      }}>{order.id}</td>
                      <td style={{
                        padding: '16px',
                        fontSize: '14px',
                        color: '#121417'
                      }}>{order.date}</td>
                      <td style={{
                        padding: '16px',
                        fontSize: '14px'
                      }}>
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: '16px',
                          fontSize: '12px',
                          fontWeight: '500',
                          backgroundColor: order.status === 'Shipped' ? '#e3f2fd' : 
                                          order.status === 'Delivered' ? '#e8f5e8' : 
                                          order.status === 'Processing' ? '#fff3cd' :
                                          order.status === 'Cancelled' ? '#ffebee' : '#f8f9fa',
                          color: order.status === 'Shipped' ? '#1976d2' : 
                                 order.status === 'Delivered' ? '#2e7d32' : 
                                 order.status === 'Processing' ? '#856404' :
                                 order.status === 'Cancelled' ? '#d32f2f' : '#6c757d'
                        }}>
                          {order.status}
                        </span>
                      </td>
                      <td style={{
                        padding: '16px',
                        fontSize: '14px',
                        color: '#121417',
                        fontWeight: '600'
                      }}>{order.total}</td>
                      <td style={{
                        padding: '16px'
                      }}>
                        <button style={{
                          backgroundColor: '#0D80F2',
                          color: 'white',
                          border: 'none',
                          borderRadius: '16px',
                          padding: '6px 16px',
                          fontSize: '12px',
                          fontWeight: '500',
                          cursor: 'pointer'
                        }}>
                          {order.tracking}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Invoices Section */}
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{
              fontSize: '22px',
              fontWeight: '700',
              color: '#121417',
              margin: '0 0 24px 0'
            }}>
              Invoices
            </h2>

            <div style={{
              border: '1px solid #e5e8eb',
              borderRadius: '8px',
              overflow: 'hidden'
            }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse'
              }}>
                <thead style={{
                  backgroundColor: '#f8f9fa'
                }}>
                  <tr>
                    <th style={{
                      padding: '16px',
                      textAlign: 'left',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#121417',
                      borderBottom: '1px solid #e5e8eb'
                    }}>Order ID</th>
                    <th style={{
                      padding: '16px',
                      textAlign: 'left',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#121417',
                      borderBottom: '1px solid #e5e8eb'
                    }}>Date</th>
                    <th style={{
                      padding: '16px',
                      textAlign: 'left',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#121417',
                      borderBottom: '1px solid #e5e8eb'
                    }}>Invoice</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice, index) => (
                    <tr key={invoice.id} style={{
                      borderBottom: index < invoices.length - 1 ? '1px solid #e5e8eb' : 'none'
                    }}>
                      <td style={{
                        padding: '16px',
                        fontSize: '14px',
                        color: '#121417'
                      }}>{invoice.id}</td>
                      <td style={{
                        padding: '16px',
                        fontSize: '14px',
                        color: '#121417'
                      }}>{invoice.date}</td>
                      <td style={{
                        padding: '16px'
                      }}>
                        <button style={{
                          backgroundColor: 'transparent',
                          color: '#0D80F2',
                          border: 'none',
                          fontSize: '14px',
                          fontWeight: '500',
                          cursor: 'pointer',
                          textDecoration: 'underline'
                        }}>
                          {invoice.invoice}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sign Out Button */}
          <div style={{
            display: 'flex',
            justifyContent: 'center'
          }}>
            <button
              onClick={handleSignOut}
              style={{
                backgroundColor: '#0D80F2',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 24px',
                fontSize: '16px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#0a68c4'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#0D80F2'}
            >
              Sign out
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        backgroundColor: 'white',
        borderTop: '1px solid #e5e8eb',
        padding: '40px 20px',
        textAlign: 'center'
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

export default UserDashboard; 