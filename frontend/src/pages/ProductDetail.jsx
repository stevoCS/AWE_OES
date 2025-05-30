import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { SearchIcon, ShoppingCartIcon } from '../components/ui/icons';
import { Button } from '../components/ui/button';
import { useUser } from '../context/UserContext';
import { useCart } from '../context/CartContext';
import { productsAPI } from '../api/config';
import logoIcon from '../assets/Vector - 0.svg';
import searchIcon from '../assets/Vector - search.svg';
import cartIcon from '../assets/Vector - cart.svg';

// Import product images
import laptopImg from '../assets/laptop.png';
import phoneImg from '../assets/Phone.png';
import speakerImg from '../assets/Speaker.png';
import watchImg from '../assets/smartwatch.png';
import mouseImg from '../assets/Wireless mouse.png';
import chargerImg from '../assets/Well charger.png';
import vrImg from '../assets/VR Headset.png';
import keyboardImg from '../assets/Keyboard.png';

// Enhanced product data with specifications and reviews
const products = [
  { 
    id: 1, 
    name: 'UltraBook Pro 15', 
    image: laptopImg, 
    price: 2999, 
    desc: 'Powerful and portable laptop with latest Intel processor', 
    category: 'Laptops',
    specs: {
      model: 'AWE-2000',
      connectivity: 'WiFi 6, Bluetooth 5.2',
      batteryLife: 'Up to 12 hours',
      weight: '1.4kg'
    },
    rating: 4.8,
    reviewCount: 324
  },
  { 
    id: 2, 
    name: 'Galaxy X50', 
    image: phoneImg, 
    price: 899, 
    desc: 'Next-gen mobile experience with 5G connectivity', 
    category: 'Phones',
    specs: {
      model: 'AWE-X50',
      connectivity: '5G, WiFi 6, Bluetooth 5.1',
      batteryLife: 'Up to 24 hours',
      weight: '180g'
    },
    rating: 4.6,
    reviewCount: 567
  },
  { 
    id: 3, 
    name: 'SmartHome Speaker', 
    image: speakerImg, 
    price: 299, 
    desc: 'Immersive home environment with voice control', 
    category: 'Audio',
    specs: {
      model: 'AWE-3000',
      connectivity: 'WiFi, Bluetooth 5.0',
      batteryLife: 'Up to 8 hours',
      weight: '850g'
    },
    rating: 4.7,
    reviewCount: 189
  },
  { 
    id: 4, 
    name: 'FitTrack Smartwatch', 
    image: watchImg, 
    price: 399, 
    desc: 'Track your fitness journey with advanced sensors', 
    category: 'Wearables',
    specs: {
      model: 'AWE-4000',
      connectivity: 'Bluetooth 5.2, GPS',
      batteryLife: 'Up to 7 days',
      weight: '45g'
    },
    rating: 4.5,
    reviewCount: 432
  },
  { 
    id: 5, 
    name: 'Wireless Mouse', 
    image: mouseImg, 
    price: 79, 
    desc: 'Smooth and precise wireless mouse', 
    category: 'Accessories',
    specs: {
      model: 'AWE-5000',
      connectivity: 'Wireless 2.4GHz',
      batteryLife: 'Up to 6 months',
      weight: '85g'
    },
    rating: 4.4,
    reviewCount: 876
  },
  { 
    id: 6, 
    name: 'Wall Charger', 
    image: chargerImg, 
    price: 49, 
    desc: 'Fast charging wall adapter', 
    category: 'Accessories',
    specs: {
      model: 'AWE-6000',
      connectivity: 'USB-C, USB-A',
      batteryLife: 'N/A',
      weight: '120g'
    },
    rating: 4.3,
    reviewCount: 654
  },
  { 
    id: 7, 
    name: 'VR Headset', 
    image: vrImg, 
    price: 599, 
    desc: 'Immersive VR experience with 4K display', 
    category: 'Gaming',
    specs: {
      model: 'AWE-7000',
      connectivity: 'Wireless, USB-C',
      batteryLife: 'Up to 3 hours',
      weight: '520g'
    },
    rating: 4.6,
    reviewCount: 298
  },
  { 
    id: 8, 
    name: 'Apple Keyboard', 
    image: keyboardImg, 
    price: 179, 
    desc: 'Sleek and responsive wireless keyboard', 
    category: 'Accessories',
    specs: {
      model: 'AWE-8000',
      connectivity: 'Bluetooth 5.1',
      batteryLife: 'Up to 1 month',
      weight: '430g'
    },
    rating: 4.7,
    reviewCount: 543
  },
];

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isLoggedIn } = useUser();
  const { addToCart, getCartItemsCount } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load product data from API
  useEffect(() => {
    loadProductData();
  }, [id]);

  const loadProductData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('Loading product details, ID:', id);

      // Load specific product
      const productResponse = await productsAPI.getProduct(id);
      console.log('Product details API response:', productResponse);

      if (productResponse.success && productResponse.data) {
        setProduct(productResponse.data);
        
        // Load related products (all products for now)
        const allProductsResponse = await productsAPI.getProducts();
        if (allProductsResponse.success && allProductsResponse.data.items) {
          // Get other products excluding current one
          const otherProducts = allProductsResponse.data.items
            .filter(p => p.id !== id)
            .slice(0, 3);
          setRelatedProducts(otherProducts);
        }
      } else {
        setError('Product not found');
      }
    } catch (error) {
      console.error('Error loading product details:', error);
      setError('Failed to load product information');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    }
  };

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<span key={i} style={{ color: '#fbbf24' }}>★</span>);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<span key={i} style={{ color: '#fbbf24' }}>☆</span>);
      } else {
        stars.push(<span key={i} style={{ color: '#d1d5db' }}>☆</span>);
      }
    }
    return stars;
  };

  // Loading state
  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontFamily: "'Space Grotesk', Arial, sans-serif"
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '18px', marginBottom: '10px' }}>Loading...</div>
          <div style={{ fontSize: '14px', color: '#666' }}>Fetching product information</div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !product) {
    return (
      <div style={{ 
        padding: '40px', 
        textAlign: 'center',
        fontFamily: "'Space Grotesk', Arial, sans-serif"
      }}>
        <h2>Product Not Found</h2>
        <p>{error || 'Please check if the product ID is correct'}</p>
        <Link to="/" style={{ color: '#0D80F2', textDecoration: 'none' }}>
          Return to Home
        </Link>
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

          {/* Cart Button with Counter */}
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
        </div>
      </header>

      {/* Breadcrumb */}
      <div style={{
        padding: '20px 40px',
        backgroundColor: 'white',
        borderBottom: '1px solid #e5e8eb'
      }}>
        <div style={{
          fontSize: '14px',
          color: '#61758A'
        }}>
          <Link to="/" style={{ color: '#61758A', textDecoration: 'none' }}>Electronics</Link>
          <span style={{ margin: '0 8px' }}>/</span>
          <Link to="/audio" style={{ color: '#61758A', textDecoration: 'none' }}>{product.category}</Link>
          <span style={{ margin: '0 8px' }}>/</span>
          <span style={{ color: '#121417' }}>{product.name}</span>
        </div>
      </div>

      {/* Main Content */}
      <main style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '40px 20px'
      }}>
        {/* Product Title */}
        <h1 style={{
          fontSize: '32px',
          fontWeight: '700',
          color: '#121417',
          margin: '0 0 8px 0'
        }}>
          {product.name}
        </h1>

        <p style={{
          fontSize: '16px',
          color: '#61758A',
          margin: '0 0 40px 0',
          lineHeight: 1.6
        }}>
          {product.description}
        </p>

        {/* Product Images */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1fr',
          gap: '16px',
          marginBottom: '60px',
          height: '400px'
        }}>
          {/* Main Image */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {product.images && product.images.length > 0 ? (
              <img 
                src={product.images[0]} 
                alt={product.name}
                style={{
                  width: '100%',
                  maxWidth: '350px',
                  height: 'auto',
                  objectFit: 'contain'
                }}
              />
            ) : (
              <div style={{
                width: '100%',
                maxWidth: '350px',
                height: '200px',
                backgroundColor: '#f0f2f5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#607589'
              }}>
                No Image Available
              </div>
            )}
          </div>
          
          {/* Secondary Images */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{
              width: '100%',
              height: '150px',
              backgroundColor: '#f0f2f5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#607589'
            }}>
              More Images
            </div>
          </div>
          
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{
              width: '100%',
              height: '150px',
              backgroundColor: '#f0f2f5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#607589'
            }}>
              Gallery
            </div>
          </div>
        </div>

        {/* Specifications */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '40px',
          marginBottom: '40px'
        }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '700',
            color: '#121417',
            margin: '0 0 32px 0'
          }}>
            Specifications
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '32px'
          }}>
            {product.specifications && Object.entries(product.specifications).map(([key, value]) => (
              <div key={key}>
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#61758A', margin: '0 0 8px 0' }}>
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </h3>
                <p style={{ fontSize: '16px', color: '#121417', margin: 0 }}>
                  {value}
                </p>
              </div>
            ))}
            {product.brand && (
              <div>
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#61758A', margin: '0 0 8px 0' }}>Brand</h3>
                <p style={{ fontSize: '16px', color: '#121417', margin: 0 }}>{product.brand}</p>
              </div>
            )}
            {product.model && (
              <div>
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#61758A', margin: '0 0 8px 0' }}>Model</h3>
                <p style={{ fontSize: '16px', color: '#121417', margin: 0 }}>{product.model}</p>
              </div>
            )}
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#61758A', margin: '0 0 8px 0' }}>Price</h3>
              <p style={{ fontSize: '16px', color: '#121417', margin: 0 }}>${product.price.toFixed(2)}</p>
            </div>
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#61758A', margin: '0 0 8px 0' }}>Category</h3>
              <p style={{ fontSize: '16px', color: '#121417', margin: 0 }}>{product.category}</p>
            </div>
          </div>
        </div>

        {/* Customer Reviews */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '40px',
          marginBottom: '40px'
        }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '700',
            color: '#121417',
            margin: '0 0 32px 0'
          }}>
            Customer Reviews
          </h2>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '24px',
            marginBottom: '32px'
          }}>
            <div style={{
              fontSize: '48px',
              fontWeight: '700',
              color: '#121417'
            }}>
              {product.rating}
            </div>
            <div>
              <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
                {renderStars(product.rating)}
              </div>
              <p style={{ fontSize: '14px', color: '#61758A', margin: 0 }}>
                {product.reviewCount} reviews
              </p>
            </div>
          </div>

          {/* Rating Breakdown */}
          <div style={{ marginBottom: '32px' }}>
            {[5, 4, 3, 2, 1].map((stars) => (
              <div key={stars} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '8px'
              }}>
                <span style={{ fontSize: '14px', color: '#61758A', minWidth: '8px' }}>{stars}</span>
                <div style={{
                  flex: 1,
                  height: '8px',
                  backgroundColor: '#f3f4f6',
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%',
                    backgroundColor: '#fbbf24',
                    width: `${stars === 5 ? 60 : stars === 4 ? 25 : stars === 3 ? 10 : stars === 2 ? 3 : 2}%`,
                    borderRadius: '4px'
                  }} />
                </div>
                <span style={{ fontSize: '14px', color: '#61758A', minWidth: '30px' }}>
                  {stars === 5 ? '60%' : stars === 4 ? '25%' : stars === 3 ? '10%' : stars === 2 ? '3%' : '2%'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Related Products */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '40px',
          marginBottom: '40px'
        }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '700',
            color: '#121417',
            margin: '0 0 32px 0'
          }}>
            Related Products
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px'
          }}>
            {relatedProducts.map((relatedProduct) => (
              <Link
                key={relatedProduct.id}
                to={`/product/${relatedProduct.id}`}
                style={{
                  textDecoration: 'none',
                  color: 'inherit'
                }}
              >
                <div style={{
                  border: '1px solid #e5e8eb',
                  borderRadius: '8px',
                  padding: '20px',
                  transition: 'transform 0.2s',
                  cursor: 'pointer'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <div style={{
                    width: '100%',
                    height: '160px',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#f0f2f5',
                    borderRadius: '8px'
                  }}>
                    {relatedProduct.images && relatedProduct.images.length > 0 ? (
                      <img
                        src={relatedProduct.images[0]}
                        alt={relatedProduct.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain'
                        }}
                      />
                    ) : (
                      <span style={{ color: '#607589', fontSize: '14px' }}>
                        No Image
                      </span>
                    )}
                  </div>
                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#121417',
                    margin: '0 0 8px 0'
                  }}>
                    {relatedProduct.name}
                  </h3>
                  <p style={{
                    fontSize: '14px',
                    color: '#61758A',
                    margin: '0 0 12px 0'
                  }}>
                    {relatedProduct.description}
                  </p>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#121417'
                  }}>
                    ${relatedProduct.price.toFixed(2)}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Price & Availability */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '40px'
        }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '700',
            color: '#121417',
            margin: '0 0 24px 0'
          }}>
            Price & Availability
          </h2>
          
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '32px'
          }}>
            <div>
              <p style={{
                fontSize: '14px',
                color: '#61758A',
                margin: '0 0 8px 0'
              }}>
                Price:
              </p>
              <div style={{
                fontSize: '32px',
                fontWeight: '700',
                color: '#121417'
              }}>
                ${product.price.toFixed(2)}
              </div>
            </div>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}>
              {/* Quantity Selector */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <button
                  onClick={() => handleQuantityChange(-1)}
                  style={{
                    width: '32px',
                    height: '32px',
                    border: '1px solid #DBE0E5',
                    borderRadius: '6px',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                    fontWeight: '600'
                  }}
                >
                  -
                </button>
                <span style={{
                  fontSize: '16px',
                  fontWeight: '500',
                  minWidth: '24px',
                  textAlign: 'center'
                }}>
                  {quantity}
                </span>
                <button
                  onClick={() => handleQuantityChange(1)}
                  style={{
                    width: '32px',
                    height: '32px',
                    border: '1px solid #DBE0E5',
                    borderRadius: '6px',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                    fontWeight: '600'
                  }}
                >
                  +
                </button>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                style={{
                  backgroundColor: addedToCart ? '#16a34a' : '#0D80F2',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 24px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
              >
                {addedToCart ? '✓ Added to Cart!' : 'Add to Cart'}
              </button>
            </div>
          </div>

          <div style={{
            padding: '16px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            fontSize: '14px',
            color: '#61758A'
          }}>
            <Link to="/warranty" style={{ color: '#0D80F2', textDecoration: 'none' }}>
              View Warranty Information
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
        marginTop: '60px'
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

export default ProductDetail; 