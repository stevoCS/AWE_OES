import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useCart } from '../context/CartContext';
import { productsAPI } from '../api/config';
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
  const [newArrivals, setNewArrivals] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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

  const renderProductSection = (products, title) => (
    <section className="home-section">
      <div className="section-content">
        <h2 className="section-title">{title}</h2>
        <div className="product-list">
          {isLoading ? (
            // Loading state
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="product-card" style={{
                background: '#f0f2f5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '300px'
              }}>
                <span style={{ color: '#607589' }}>Loading...</span>
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
                  <div className="product-card">
                    <div 
                      className="product-img" 
                      style={{
                        backgroundColor: '#f0f2f5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#607589',
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
                      <div className="product-name">{product.name}</div>
                      <div className="product-desc">{product.description}</div>
                      <div style={{
                        marginTop: '8px',
                        fontSize: '16px',
                        fontWeight: '600',
                        color: '#121417'
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
              color: '#607589'
            }}>
              No products available
            </div>
          )}
        </div>
      </div>
    </section>
  );

  return (
    <div className="home-container">
      {/* Header */}
      <header className="home-header">
        <div className="header-left">
          <Link to="/" className="brand-link">
            <img src={logoIcon} alt="AWE Electronics Logo" className="logo-icon" />
            <span className="brand-title">AWE Electronics</span>
          </Link>
          <nav className="sub-titles"> {/* Changed div to nav for semantic reasons */}
            <Link to="/new-arrivals" className="sub-title">New Arrivals</Link>
            <Link to="/best-sellers" className="sub-title">Best Sellers</Link>
          </nav>
        </div>
        <div className="header-right">
          <div className="search-bar">
            <img src={searchIcon} alt="search" className="search-icon-internal" /> {/* Changed class */}
            <input type="text" placeholder="Search" />
          </div>
          {isLoggedIn ? (
            <Link to="/dashboard" className="login-btn" style={{ 
              minWidth: 'auto', 
              width: 'auto',
              paddingLeft: '12px',
              paddingRight: '12px'
            }}>
              Welcome, {user.firstName}
            </Link>
          ) : (
            <Link to="/login" className="login-btn">Log in</Link>
          )}
          <Link to="/cart" className="cart-btn" style={{ position: 'relative' }}>
            <img src={cartIcon} alt="cart" className="cart-icon" />
            {getCartItemsCount() > 0 && (
              <span style={{
                position: 'absolute',
                top: '-6px',
                right: '-6px',
                backgroundColor: '#dc2626',
                color: 'white',
                borderRadius: '50%',
                width: '18px',
                height: '18px',
                fontSize: '11px',
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

      {/* Banner */}
      <section className="home-banner" style={{ backgroundImage: `url(${bannerImg})` }}>
        {/* Removed <img> tag, using background-image now for better overlay control */}
        <div className="banner-overlay"></div> {/* Added for overlay */}
        <div className="banner-content">
          <h1 className="banner-title">Tech That Moves You</h1>
          <p className="banner-desc">Explore the latest in electronics, from cutting-edge laptops to immersive audio experiences. Find your perfect tech companion today.</p>
          <Link to="/product">
            <button className="shop-now-btn">Shop Now</button>
          </Link>
        </div>
      </section>

      {/* New Arrivals */}
      {renderProductSection(newArrivals, "New Arrivals")}

      {/* Best Sellers */}
      {renderProductSection(bestSellers, "Best Sellers")}

      {/* Subscribe */}
      <section className="subscribe-section">
        <div className="section-content"> {/* Added wrapper for consistency, though not strictly needed if full width */}
          <h2 className="subscribe-title">Stay Connected</h2>
          <p className="subscribe-desc">Sign up for our newsletter and be the first to know about new products, exclusive deals, and more.</p>
          <button className="subscribe-btn">Subscribe Now</button>
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <div className="footer-links">
          {/* Consider using <Link> if these are actual navigation links */}
          <Link to="/about-us" className="footer-link-item">About Us</Link>
          <Link to="/customer-support" className="footer-link-item">Customer Support</Link>
          <Link to="/terms-of-service" className="footer-link-item">Terms of Service</Link>
        </div>
        <div className="footer-copyright">© 2025 AWE Electronics. All rights reserved.</div>
      </footer>
    </div>
  );
};

export default Home;