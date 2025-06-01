import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { productsAPI } from '../api/config';
import Layout from '../components/Layout';
import { getProductImageUrl } from '../utils/imageMap';
import './Home.css';
import bannerImg from '../assets/home page image.png'; 
import logoIcon from '../assets/Vector - 0.svg';
import searchIcon from '../assets/Vector - search.svg';
import cartIcon from '../assets/Vector - cart.svg';

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

  const loadProducts = async (retryCount = 0) => {
    try {
      setIsLoading(true);
      console.log('Starting to load product data... (attempt:', retryCount + 1, ')');
      console.log('API Base URL:', import.meta.env.VITE_API_BASE_URL || 'https://awe-oes.onrender.com');
      console.log('Network online:', navigator.onLine);
      
      // Check network status
      if (!navigator.onLine) {
        throw new Error('No internet connection detected. Please check your network.');
      }
      
      const response = await productsAPI.getProducts();
      
      console.log('Product API response:', response);
      
      if (response.success && response.data.items) {
        const products = response.data.items;
        console.log('Successfully loaded products:', products.length, 'items');
        console.log('Products with homepage_section:', products.map(p => ({ name: p.name, homepage_section: p.homepage_section })));
        
        // Filter products based on homepage_section
        const newArrivalsProducts = products.filter(product => product.homepage_section === 'new');
        const bestSellersProducts = products.filter(product => product.homepage_section === 'best');
        
        console.log('New Arrivals products:', newArrivalsProducts.length, newArrivalsProducts.map(p => p.name));
        console.log('Best Sellers products:', bestSellersProducts.length, bestSellersProducts.map(p => p.name));
        
        setNewArrivals(newArrivalsProducts);
        setBestSellers(bestSellersProducts);
      } else {
        console.warn('Product API response format incorrect:', response);
        setNewArrivals([]);
        setBestSellers([]);
      }
    } catch (error) {
      console.error('Error occurred while loading products:', error);
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      
      // More specific error handling
      if (error.name === 'AbortError') {
        console.error('Request timed out after 15 seconds');
      } else if (error.message.includes('fetch')) {
        console.error('Network error - backend may be unavailable');
      } else if (error.message.includes('CORS')) {
        console.error('CORS error - cross-origin request blocked');
      }
      
      // Retry mechanism for network errors (max 3 attempts)
      if (retryCount < 2 && (
        error.name === 'AbortError' || 
        error.message.includes('fetch') || 
        error.message.includes('network') ||
        error.message.includes('timeout')
      )) {
        console.log(`Retrying in 2 seconds... (attempt ${retryCount + 2}/3)`);
        setTimeout(() => {
          loadProducts(retryCount + 1);
        }, 2000);
        return;
      }
      
      // If API fails after retries, use empty arrays, don't affect page rendering
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
              // Use shared imageMap utility function
              const imageUrl = getProductImageUrl(product);
              
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
                        />
                      ) : (
                        <span>No Image</span>
                      )}
                    </div>
                    <div className="product-details" style={{ backgroundColor: theme.cardBg }}>
                      <h3 className="product-name" style={{ color: theme.textPrimary }}>
                        {product.name}
                      </h3>
                      <p className="product-price" style={{ color: theme.primary }}>
                        ${product.price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })
          ) : (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '200px',
              color: theme.textSecondary,
              fontSize: '16px'
            }}>
              {title === "New Arrivals" 
                ? "No new arrivals yet. Check back soon for exciting new products!" 
                : "No best sellers yet. Stay tuned for popular items!"
              }
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