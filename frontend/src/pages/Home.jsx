import React from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import './Home.css';
import bannerImg from '../assets/home page image.png'; 
import laptopImg from '../assets/laptop.png';
import phoneImg from '../assets/Phone.png';
import speakerImg from '../assets/Speaker.png';
import watchImg from '../assets/smartwatch.png';
import mouseImg from '../assets/Wireless mouse.png';
import chargerImg from '../assets/Well charger.png';
import vrImg from '../assets/VR Headset.png';
import keyboardImg from '../assets/Keyboard.png';
import logoIcon from '../assets/Vector - 0.svg';
import searchIcon from '../assets/Vector - search.svg';
import cartIcon from '../assets/Vector - cart.svg';

const newArrivals = [
  { id: 1, name: 'UltraBook Pro 15', image: laptopImg, desc: 'Powerful and portable' },
  { id: 2, name: 'Galaxy X50', image: phoneImg, desc: 'Next-gen mobile experience' },
  { id: 3, name: 'SmartHome Speaker', image: speakerImg, desc: 'Immersive home environment' },
  { id: 4, name: 'FitTrack Smartwatch', image: watchImg, desc: 'Track your fitness journey' },
];
const bestSellers = [
  { id: 5, name: 'Wireless Mouse', image: mouseImg },
  { id: 6, name: 'Wall Charger', image: chargerImg },
  { id: 7, name: 'VR Headset', image: vrImg },
  { id: 8, name: 'Apple Keyboard', image: keyboardImg },
];

const Home = () => {
  const { user, isLoggedIn } = useUser();

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
          <Link to="/cart" className="cart-btn">
            <img src={cartIcon} alt="cart" className="cart-icon" />
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
          <button className="shop-now-btn">Shop Now</button>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="home-section">
        <div className="section-content"> {/* Added wrapper for max-width and centering */}
          <h2 className="section-title">New Arrivals</h2>
          <div className="product-list">
            {newArrivals.map(product => (
              <Link
                key={product.id}
                to={`/product/${product.id}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div className="product-card">
                  <img src={product.image} alt={product.name} className="product-img" />
                  <div className="product-info">
                    <div className="product-name">{product.name}</div>
                    <div className="product-desc">{product.desc}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      <section className="home-section">
        <div className="section-content"> {/* Added wrapper for max-width and centering */}
          <h2 className="section-title">Best Sellers</h2>
          <div className="product-list">
            {bestSellers.map(product => (
              <Link
                key={product.id}
                to={`/product/${product.id}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div className="product-card">
                  <img src={product.image} alt={product.name} className="product-img" />
                  <div className="product-info">
                    <div className="product-name">{product.name}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

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