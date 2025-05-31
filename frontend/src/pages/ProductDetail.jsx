import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { SearchIcon, ShoppingCartIcon } from '../components/ui/icons';
import { Button } from '../components/ui/button';
import { useUser } from '../context/UserContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { productsAPI } from '../api/config';
import logoIcon from '../assets/Vector - 0.svg';
import searchIcon from '../assets/Vector - search.svg';
import cartIcon from '../assets/Vector - cart.svg';
import Layout from '../components/Layout';

// Import product images
import laptopImg from '../assets/laptop.png';
import phoneImg from '../assets/Phone.png';
import speakerImg from '../assets/Speaker.png';
import watchImg from '../assets/smartwatch.png';
import mouseImg from '../assets/Wireless mouse.png';
import chargerImg from '../assets/Well charger.png';
import vrImg from '../assets/VR Headset.png';
import keyboardImg from '../assets/Keyboard.png';

// Add animation styles
const animationStyles = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
  
  .image-hover {
    transition: transform 0.3s ease, filter 0.3s ease;
  }
  
  .image-hover:hover {
    transform: scale(1.05);
  }
  
  .shimmer-effect {
    position: relative;
    overflow: hidden;
  }
  
  .shimmer-effect::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
    transition: left 0.5s;
  }
  
  .shimmer-effect:hover::before {
    left: 100%;
  }
`;

// Inject styles into document head
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = animationStyles;
  document.head.appendChild(styleElement);
}

// Create image mapping
const imageMap = {
  '/src/assets/laptop.png': laptopImg,
  '/src/assets/Phone.png': phoneImg,
  '/src/assets/Speaker.png': speakerImg,
  '/src/assets/smartwatch.png': watchImg,
  '/src/assets/Wireless mouse.png': mouseImg,
  '/src/assets/Well charger.png': chargerImg,
  '/src/assets/VR Headset.png': vrImg,
  '/src/assets/Keyboard.png': keyboardImg,
};

// Enhanced product data with specifications and reviews
const products = [
  { 
    id: 1, 
    name: 'UltraBook Pro 15', 
    image: laptopImg, 
    price: 2999, 
    desc: 'Powerful and portable laptop with latest Intel processor', 
    category: 'Laptops',
    manufacturer: 'AWE Electronics',
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
    manufacturer: 'TechForward Inc.',
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
    manufacturer: 'SoundTech Pro',
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
    manufacturer: 'HealthTech Solutions',
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
    manufacturer: 'PrecisionTech',
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
    manufacturer: 'PowerMax Technologies',
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
    manufacturer: 'Virtual Reality Corp',
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
    manufacturer: 'Apple Inc.',
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
  const { theme } = useTheme();
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddedMessage, setShowAddedMessage] = useState(false);

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
        const productData = productResponse.data;
        
        // Ensure manufacturer is available - add fallback if not present in API
        if (!productData.manufacturer) {
          // Set default manufacturer based on product category or use generic
          switch (productData.category?.toLowerCase()) {
            case 'laptops':
              productData.manufacturer = 'AWE Electronics';
              break;
            case 'phones':
              productData.manufacturer = 'TechForward Inc.';
              break;
            case 'audio':
              productData.manufacturer = 'SoundTech Pro';
              break;
            case 'wearables':
              productData.manufacturer = 'HealthTech Solutions';
              break;
            case 'accessories':
              productData.manufacturer = 'PrecisionTech';
              break;
            case 'gaming':
              productData.manufacturer = 'Virtual Reality Corp';
              break;
            default:
              productData.manufacturer = 'AWE Electronics';
          }
        }
        
        setProduct(productData);
        
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

  const handleAddToCart = async () => {
    try {
      setIsAddingToCart(true);
      await addToCart(product, quantity);
      setAddedToCart(true);
      setShowAddedMessage(true);
      setTimeout(() => {
        setShowAddedMessage(false);
        setAddedToCart(false);
      }, 3000);
    } catch (error) {
      console.error('Failed to add to cart:', error);
      alert('Failed to add to cart. Please try again.');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    try {
      // Add to cart first
      await addToCart(product, quantity);
      // Then navigate to cart
      navigate('/cart');
    } catch (error) {
      console.error('Failed to add to cart:', error);
      alert('Failed to proceed to checkout. Please try again.');
    }
  };

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

  // 获取产品图片URL的辅助函数
  const getProductImageUrl = (product) => {
    if (product.images && product.images.length > 0) {
      const imagePath = product.images[0];
      const imageUrl = imageMap[imagePath];
      return imageUrl;
    }
    return null;
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
      <Layout>
        <div style={{
          backgroundColor: theme.background,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: "'Space Grotesk', Arial, sans-serif"
        }}>
          <div style={{
            textAlign: 'center',
            padding: '40px',
            backgroundColor: theme.cardBg,
            borderRadius: '8px',
            border: `1px solid ${theme.border}`,
            boxShadow: theme.shadowLight
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: `4px solid ${theme.border}`,
              borderTop: `4px solid ${theme.primary}`,
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px'
            }} />
            <p style={{ color: theme.textSecondary, margin: 0 }}>Loading product...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Error state
  if (error || !product) {
    return (
      <Layout>
        <div style={{
          backgroundColor: theme.background,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: "'Space Grotesk', Arial, sans-serif"
        }}>
          <div style={{
            textAlign: 'center',
            padding: '40px',
            backgroundColor: theme.cardBg,
            borderRadius: '8px',
            border: `1px solid ${theme.border}`,
            boxShadow: theme.shadowLight
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '600',
              color: theme.textPrimary,
              marginBottom: '8px'
            }}>
              {error || 'Product not found'}
            </h2>
            <p style={{ color: theme.textSecondary, marginBottom: '24px' }}>
              The product you're looking for could not be found.
            </p>
            <Link
              to="/product"
              style={{
                backgroundColor: theme.primary,
                color: 'white',
                textDecoration: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                display: 'inline-block',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = theme.primaryHover}
              onMouseLeave={(e) => e.target.style.backgroundColor = theme.primary}
            >
              Browse All Products
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={{
        backgroundColor: theme.background,
        minHeight: '100vh',
        fontFamily: "'Space Grotesk', Arial, sans-serif"
      }}>
        {/* Success Message */}
        {showAddedMessage && (
          <div style={{
            position: 'fixed',
            top: '80px',
            right: '20px',
            backgroundColor: theme.success,
            color: 'white',
            padding: '16px 24px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            zIndex: 1000,
            animation: 'fadeIn 0.3s ease-in-out',
            boxShadow: theme.shadow
          }}>
            ✓ Added to cart successfully!
          </div>
        )}

        {/* Breadcrumb */}
        <div style={{
          padding: '20px 40px',
          backgroundColor: theme.cardBg,
          borderBottom: `1px solid ${theme.border}`
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            fontSize: '14px',
            color: theme.textSecondary
          }}>
            <Link 
              to="/" 
              style={{ 
                color: theme.textSecondary, 
                textDecoration: 'none',
                transition: 'color 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.color = theme.primary}
              onMouseLeave={(e) => e.target.style.color = theme.textSecondary}
            >
              Home
            </Link>
            <span style={{ margin: '0 8px' }}>/</span>
            <Link 
              to="/product" 
              style={{ 
                color: theme.textSecondary, 
                textDecoration: 'none',
                transition: 'color 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.color = theme.primary}
              onMouseLeave={(e) => e.target.style.color = theme.textSecondary}
            >
              Products
            </Link>
            <span style={{ margin: '0 8px' }}>/</span>
            <span style={{ color: theme.textPrimary }}>{product.name}</span>
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
            color: theme.textPrimary,
            margin: '0 0 8px 0'
          }}>
            {product.name}
          </h1>

          {/* Manufacturer */}
          {product.manufacturer && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '16px'
            }}>
              <span style={{
                fontSize: '14px',
                color: theme.textSecondary,
                fontWeight: '500'
              }}>
                By
              </span>
              <span style={{
                fontSize: '16px',
                color: theme.primary,
                fontWeight: '600',
                textDecoration: 'none'
              }}>
                {product.manufacturer}
              </span>
            </div>
          )}

          <p style={{
            fontSize: '16px',
            color: theme.textTertiary,
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
              backgroundColor: theme.cardBg,
              borderRadius: '12px',
              padding: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              position: 'relative',
              border: `1px solid ${theme.border}`,
              boxShadow: theme.shadowLight
            }}>
              {product.images && product.images.length > 0 ? (
                (() => {
                  const imagePath = product.images[0];
                  const imageUrl = imageMap[imagePath];
                  return imageUrl ? (
                    <div style={{
                      position: 'relative',
                      width: '100%',
                      maxWidth: '350px',
                      height: 'auto',
                      overflow: 'hidden',
                      borderRadius: '8px',
                      cursor: 'pointer'
                    }}>
                      <img 
                        src={imageUrl} 
                        alt={product.name}
                        style={{
                          width: '100%',
                          height: 'auto',
                          objectFit: 'contain',
                          transition: 'transform 0.3s ease',
                          transformOrigin: 'center'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.transform = 'scale(1.05)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = 'scale(1)';
                        }}
                      />
                      {/* 百叶窗覆盖层 */}
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(90deg, transparent 0%, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%, transparent 100%)',
                        transform: 'translateX(-100%)',
                        transition: 'transform 0.6s ease-in-out',
                        pointerEvents: 'none'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'translateX(100%)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'translateX(-100%)';
                      }}
                      />
                    </div>
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
                      Image not found ({imagePath})
                    </div>
                  );
                })()
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
            
            {/* More Images - 显示重复的产品图片 */}
            <div style={{
              backgroundColor: theme.cardBg,
              borderRadius: '12px',
              padding: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              position: 'relative',
              cursor: 'pointer',
              border: `1px solid ${theme.border}`,
              boxShadow: theme.shadowLight
            }}>
              {getProductImageUrl(product) ? (
                <div style={{
                  position: 'relative',
                  width: '100%',
                  height: '150px',
                  overflow: 'hidden',
                  borderRadius: '8px'
                }}>
                  <img
                    src={getProductImageUrl(product)}
                    alt={`${product.name} - View 2`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      transition: 'transform 0.3s ease, filter 0.3s ease',
                      filter: 'brightness(0.9)'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'scale(1.1)';
                      e.target.style.filter = 'brightness(1)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'scale(1)';
                      e.target.style.filter = 'brightness(0.9)';
                    }}
                  />
                  {/* Venetian blind effect */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)',
                    opacity: 0,
                    transition: 'opacity 0.3s ease',
                    pointerEvents: 'none'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.opacity = '1';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.opacity = '0';
                  }}
                  />
                </div>
              ) : (
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
              )}
            </div>
            
            {/* Gallery */}
            <div style={{
              backgroundColor: theme.cardBg,
              borderRadius: '12px',
              padding: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              position: 'relative',
              cursor: 'pointer',
              border: `1px solid ${theme.border}`,
              boxShadow: theme.shadowLight
            }}>
              {getProductImageUrl(product) ? (
                <div style={{
                  position: 'relative',
                  width: '100%',
                  height: '150px',
                  overflow: 'hidden',
                  borderRadius: '8px'
                }}>
                  <img
                    src={getProductImageUrl(product)}
                    alt={`${product.name} - Gallery`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      transition: 'transform 0.3s ease, filter 0.3s ease',
                      filter: 'sepia(0.2)'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'scale(1.1) rotate(2deg)';
                      e.target.style.filter = 'sepia(0)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'scale(1) rotate(0deg)';
                      e.target.style.filter = 'sepia(0.2)';
                    }}
                  />
                  {/* flash effect */}
                  <div style={{
                    position: 'absolute',
                    top: '-50%',
                    left: '-50%',
                    width: '200%',
                    height: '200%',
                    background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.5) 50%, transparent 70%)',
                    transform: 'translateX(-100%) translateY(-100%)',
                    transition: 'transform 0.6s ease',
                    pointerEvents: 'none'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateX(50%) translateY(50%)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateX(-100%) translateY(-100%)';
                  }}
                  />
                </div>
              ) : (
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
              )}
            </div>
          </div>

          {/* Specifications */}
          <div style={{
            backgroundColor: theme.cardBg,
            borderRadius: '12px',
            padding: '40px',
            marginBottom: '40px',
            border: `1px solid ${theme.border}`,
            boxShadow: theme.shadowLight
          }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '700',
              color: theme.textPrimary,
              margin: '0 0 32px 0'
            }}>
              Specifications
            </h2>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '32px'
            }}>
              {/* Manufacturer - Always display first if available */}
              {product.manufacturer && (
                <div>
                  <h3 style={{ fontSize: '14px', fontWeight: '600', color: theme.textSecondary, margin: '0 0 8px 0' }}>
                    Manufacturer
                  </h3>
                  <p style={{ fontSize: '16px', color: theme.textPrimary, margin: 0, fontWeight: '500' }}>
                    {product.manufacturer}
                  </p>
                </div>
              )}
              {product.specifications && Object.entries(product.specifications).map(([key, value]) => (
                <div key={key}>
                  <h3 style={{ fontSize: '14px', fontWeight: '600', color: theme.textSecondary, margin: '0 0 8px 0' }}>
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </h3>
                  <p style={{ fontSize: '16px', color: theme.textPrimary, margin: 0 }}>
                    {value}
                  </p>
                </div>
              ))}
              {product.brand && (
                <div>
                  <h3 style={{ fontSize: '14px', fontWeight: '600', color: theme.textSecondary, margin: '0 0 8px 0' }}>Brand</h3>
                  <p style={{ fontSize: '16px', color: theme.textPrimary, margin: 0 }}>{product.brand}</p>
                </div>
              )}
              {product.model && (
                <div>
                  <h3 style={{ fontSize: '14px', fontWeight: '600', color: theme.textSecondary, margin: '0 0 8px 0' }}>Model</h3>
                  <p style={{ fontSize: '16px', color: theme.textPrimary, margin: 0 }}>{product.model}</p>
                </div>
              )}
              <div>
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: theme.textSecondary, margin: '0 0 8px 0' }}>Price</h3>
                <p style={{ fontSize: '16px', color: theme.textPrimary, margin: 0 }}>${product.price.toFixed(2)}</p>
              </div>
              <div>
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: theme.textSecondary, margin: '0 0 8px 0' }}>Category</h3>
                <p style={{ fontSize: '16px', color: theme.textPrimary, margin: 0 }}>{product.category}</p>
              </div>
            </div>
          </div>

          {/* Related Products */}
          <div style={{
            backgroundColor: theme.cardBg,
            borderRadius: '12px',
            padding: '40px',
            marginBottom: '40px',
            border: `1px solid ${theme.border}`,
            boxShadow: theme.shadowLight
          }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '700',
              color: theme.textPrimary,
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
                    border: `1px solid ${theme.border}`,
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
                        (() => {
                          const imagePath = relatedProduct.images[0];
                          const imageUrl = imageMap[imagePath];
                          return imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={relatedProduct.name}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain'
                              }}
                            />
                          ) : (
                            <span style={{ color: '#607589', fontSize: '14px' }}>
                              Image not found
                            </span>
                          );
                        })()
                      ) : (
                        <span style={{ color: '#607589', fontSize: '14px' }}>
                          No Image
                        </span>
                      )}
                    </div>
                    <h3 style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: theme.textPrimary,
                      margin: '0 0 8px 0'
                    }}>
                      {relatedProduct.name}
                    </h3>
                    <p style={{
                      fontSize: '14px',
                      color: theme.textSecondary,
                      margin: '0 0 12px 0'
                    }}>
                      {relatedProduct.description}
                    </p>
                    <div style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: theme.textPrimary
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
            backgroundColor: theme.cardBg,
            borderRadius: '12px',
            padding: '40px',
            border: `1px solid ${theme.border}`,
            boxShadow: theme.shadowLight
          }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '700',
              color: theme.textPrimary,
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
                  color: theme.textSecondary,
                  margin: '0 0 8px 0'
                }}>
                  Price:
                </p>
                <div style={{
                  fontSize: '32px',
                  fontWeight: '700',
                  color: theme.textPrimary
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
                      border: `1px solid ${theme.border}`,
                      borderRadius: '6px',
                      backgroundColor: theme.cardBg,
                      color: theme.textPrimary,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '16px',
                      fontWeight: '600',
                      transition: 'background-color 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = theme.backgroundSecondary}
                    onMouseLeave={(e) => e.target.style.backgroundColor = theme.cardBg}
                  >
                    -
                  </button>
                  <span style={{
                    fontSize: '16px',
                    fontWeight: '500',
                    minWidth: '24px',
                    textAlign: 'center',
                    color: theme.textPrimary
                  }}>
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    style={{
                      width: '32px',
                      height: '32px',
                      border: `1px solid ${theme.border}`,
                      borderRadius: '6px',
                      backgroundColor: theme.cardBg,
                      color: theme.textPrimary,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '16px',
                      fontWeight: '600',
                      transition: 'background-color 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = theme.backgroundSecondary}
                    onMouseLeave={(e) => e.target.style.backgroundColor = theme.cardBg}
                  >
                    +
                  </button>
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={handleAddToCart}
                  disabled={isAddingToCart}
                  style={{
                    backgroundColor: addedToCart ? theme.success : isAddingToCart ? theme.textMuted : theme.primary,
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '12px 24px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: isAddingToCart ? 'not-allowed' : 'pointer',
                    transition: 'background-color 0.2s',
                    opacity: isAddingToCart ? 0.6 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (!isAddingToCart && !addedToCart) {
                      e.target.style.backgroundColor = theme.primaryHover;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isAddingToCart && !addedToCart) {
                      e.target.style.backgroundColor = theme.primary;
                    }
                  }}
                >
                  {isAddingToCart ? 'Adding...' : addedToCart ? '✓ Added to Cart!' : 'Add to Cart'}
                </button>
              </div>
            </div>

            <div style={{
              padding: '16px',
              backgroundColor: theme.backgroundSecondary,
              borderRadius: '8px',
              fontSize: '14px',
              color: theme.textSecondary
            }}>
              <Link to="/warranty" style={{ color: theme.primary, textDecoration: 'none' }}>
                View Warranty Information
              </Link>
            </div>
          </div>
        </main>
      </div>
    </Layout>
  );
};

export default ProductDetail; 