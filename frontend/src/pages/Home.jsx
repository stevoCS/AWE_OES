import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { productsAPI } from '../api/config';
import Layout from '../components/Layout';
import './Home.css';
import bannerImg from '../assets/home page image.png'; 
import logoIcon from '../assets/Vector - 0.svg';
import searchIcon from '../assets/Vector - search.svg';
import cartIcon from '../assets/Vector - cart.svg';

// Import all product images
import laptopImg from '../assets/laptop.png';
import phoneImg from '../assets/Phone.png';
import speakerImg from '../assets/Speaker.png';
import smartwatchImg from '../assets/smartwatch.png';
import mouseImg from '../assets/Wireless mouse.png';
import chargerImg from '../assets/Well charger.png';
import vrImg from '../assets/VR Headset.png';
import keyboardImg from '../assets/Keyboard.png';

// Create image mapping
const imageMap = {
  '/src/assets/laptop.png': laptopImg,
  '/src/assets/Phone.png': phoneImg,
  '/src/assets/Speaker.png': speakerImg,
  '/src/assets/smartwatch.png': smartwatchImg,
  '/src/assets/Wireless mouse.png': mouseImg,
  '/src/assets/Well charger.png': chargerImg,
  '/src/assets/VR Headset.png': vrImg,
  '/src/assets/Keyboard.png': keyboardImg,
};

const Home = () => {
  const { user, isLoggedIn } = useUser();
  const { getCartItemsCount } = useCart();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [newArrivals, setNewArrivals] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const newArrivalsRef = useRef(null);
  const bestSellersRef = useRef(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      console.log('Starting to load product data...');
      
      const response = await productsAPI.getProducts();
      console.log('Product API response:', response);
      
      if (response.success && response.data.items) {
        const products = response.data.items;
        console.log('Successfully loaded products:', products.length, 'items');
        
        // Simulate new arrivals (take first 4 products)
        setNewArrivals(products.slice(0, 4));
        
        // Simulate best sellers (take next 4 products)
        setBestSellers(products.slice(4, 8));
      } else {
        console.warn('Product API response format incorrect:', response);
        setNewArrivals([]);
        setBestSellers([]);
      }
    } catch (error) {
      console.error('Error occurred while loading products:', error);
      // If API fails, use empty arrays, don't affect page rendering
      setNewArrivals([]);
      setBestSellers([]);
    } finally {
      setIsLoading(false);
      console.log('Product loading completed');
    }
  };

  const handleSubscribeClick = () => {
    navigate('/register');
  };

  const renderProductSection = (products, title) => (
    <section 
      className="home-section" 
      id={title === "New Arrivals" ? "new-arrivals" : "best-sellers"}
      style={{ backgroundColor: theme.background }}
    >
      <div className="section-content">
        <h2 
          className="section-title"
          style={{ color: theme.textPrimary }}
        >
          {title}
        </h2>
        <div 
          ref={title === "New Arrivals" ? newArrivalsRef : bestSellersRef}
          className="product-list"
          style={{
            display: 'flex',
            gap: '16px',
            overflowX: 'auto',
            scrollBehavior: 'smooth',
            paddingBottom: '8px',
            scrollbarWidth: 'thin',
            scrollbarColor: `${theme.border} transparent`
          }}
        >
          {isLoading ? (
            // Loading state
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="product-card" style={{
                background: theme.placeholderBg,
                border: `1px solid ${theme.border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '300px'
              }}>
                <span style={{ color: theme.textMuted }}>Loading...</span>
              </div>
            ))
          ) : products.length > 0 ? (
            products.map(product => {
              // Handle image URL - use image mapping
              let imageUrl = '';
              if (product.images && product.images.length > 0) {
                const imagePath = product.images[0];
                // Get correct image URL from image mapping
                imageUrl = imageMap[imagePath];
                if (!imageUrl) {
                  console.log('Image mapping not found:', imagePath, 'Available mappings:', Object.keys(imageMap));
                }
              }
              
              return (
                <Link
                  key={product.id}
                  to={`/product/${product.id}`}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div 
                    className="product-card" 
                    style={{ 
                      minWidth: '238px', 
                      flexShrink: 0,
                      backgroundColor: theme.cardBg,
                      border: `1px solid ${theme.border}`,
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = theme.shadow;
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    <div 
                      className="product-img" 
                      style={{
                        backgroundColor: theme.placeholderBg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: theme.textMuted,
                        fontSize: '14px'
                      }}
                    >
                      {imageUrl ? (
                        <img 
                          src={imageUrl} 
                          alt={product.name}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                          onError={(e) => {
                            console.log('Image loading failed:', imageUrl);
                            e.target.style.display = 'none';
                            e.target.parentNode.innerHTML = 'No Image';
                          }}
                        />
                      ) : (
                        'No Image'
                      )}
                    </div>
                    <div className="product-info">
                      <div 
                        className="product-name"
                        style={{ color: theme.textPrimary }}
                      >
                        {product.name}
                      </div>
                      <div 
                        className="product-desc"
                        style={{ color: theme.textTertiary }}
                      >
                        {product.description}
                      </div>
                      <div style={{
                        marginTop: '8px',
                        fontSize: '16px',
                        fontWeight: '600',
                        color: theme.textPrimary
                      }}>
                        ${product.price.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })
          ) : (
            // No products state
            <div style={{
              gridColumn: '1 / -1',
              textAlign: 'center',
              padding: '40px',
              color: theme.textMuted
            }}>
              No products available
            </div>
          )}
        </div>
      </div>
    </section>
  );

  return (
    <Layout className="home-container">
      {/* Banner */}
      <section className="home-banner" style={{ backgroundImage: `url(${bannerImg})` }}>
        <div className="banner-overlay"></div>
        <div className="banner-content">
          <h1 className="banner-title">Tech That Moves You</h1>
          <p className="banner-desc">Explore the latest in electronics, from cutting-edge laptops to immersive audio experiences. Find your perfect tech companion today.</p>
          <Link to="/product">
            <button 
              className="shop-now-btn"
              style={{
                backgroundColor: theme.primary,
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '0 32px',
                height: '48px',
                fontSize: '16px',
                fontWeight: '700',
                cursor: 'pointer',
                lineHeight: '48px',
                display: 'block',
                margin: '0 auto',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = theme.primaryHover}
              onMouseLeave={(e) => e.target.style.backgroundColor = theme.primary}
            >
              Shop Now
            </button>
          </Link>
        </div>
      </section>

      {/* New Arrivals */}
      {renderProductSection(newArrivals, "New Arrivals")}

      {/* Best Sellers */}
      {renderProductSection(bestSellers, "Best Sellers")}

      {/* Subscribe */}
      <section 
        className="subscribe-section"
        style={{
          backgroundColor: theme.backgroundSecondary,
          color: theme.textPrimary
        }}
      >
        <div className="section-content">
          <h2 
            className="subscribe-title"
            style={{ color: theme.textPrimary }}
          >
            Stay Connected
          </h2>
          <p 
            className="subscribe-desc"
            style={{ color: theme.textSecondary }}
          >
            Sign up for our newsletter and be the first to know about new products, exclusive deals, and more.
          </p>
          <button 
            className="subscribe-btn" 
            onClick={handleSubscribeClick}
            style={{
              backgroundColor: theme.primary,
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '0 32px',
              height: '48px',
              fontSize: '16px',
              fontWeight: '700',
              cursor: 'pointer',
              lineHeight: '48px',
              transition: 'background-color 0.2s ease'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = theme.primaryHover}
            onMouseLeave={(e) => e.target.style.backgroundColor = theme.primary}
          >
            Subscribe Now
          </button>
        </div>
      </section>
    </Layout>
  );
};

export default Home;