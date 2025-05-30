import React, { useState } from 'react'; // Added useState for quantity
import { useParams, Link, useNavigate } from 'react-router-dom'; // Added Link
import './ProductDetail.css'; // We'll create this CSS file
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

// Extended product data for new fields
const products = [
  { id: 1, name: 'UltraBook Pro 15', image: laptopImg, price: 29999, desc: 'Powerful and portable. Equipped with the latest Intel Core i9 processor, 4K display, and ultra-slim design. Perfect for professionals and creators on the go.', rating: 4.5, reviewCount: 120, category: 'New Arrivals', colors: ['#A0A0A0', '#D0D0D0', '#333333'] },
  { id: 2, name: 'Galaxy X50', image: phoneImg, price: 24999, desc: 'Next-gen mobile experience with a stunning display and pro-grade camera system.', rating: 4.8, reviewCount: 210, category: 'New Arrivals', colors: ['#275683', '#F5F5F5', '#F2CB05'] },
  { id: 3, name: 'SmartHome Speaker', image: speakerImg, price: 3999, desc: 'Immersive home environment with crystal clear audio and smart assistant integration.', rating: 4.2, reviewCount: 85, category: 'Best Sellers', colors: ['#4A4A4A', '#FFFFFF'] },
  { id: 4, name: 'FitTrack Smartwatch', image: watchImg, price: 5999, desc: 'Advanced health monitoring and stylish design for your fitness journey.', rating: 4.6, reviewCount: 150, category: 'New Arrivals', colors: ['#333333', '#E24C3F', '#65C7F7'] },
  // Add rating, reviewCount, category, and colors for other products as needed
  { id: 5, name: 'Wireless Mouse', image: mouseImg, price: 799, desc: 'Smooth and precise tracking for ultimate productivity.', rating: 4.3, reviewCount: 95, category: 'Best Sellers', colors: ['#333333', '#FFFFFF'] },
  { id: 6, name: 'Wall Charger', image: chargerImg, price: 499, desc: 'Fast and efficient charging for all your devices.', rating: 4.0, reviewCount: 60, category: 'Best Sellers', colors: ['#FFFFFF'] },
  { id: 7, name: 'VR Headset', image: vrImg, price: 8999, desc: 'Immersive VR experience. Step into new worlds.', rating: 4.7, reviewCount: 110, category: 'Best Sellers', colors: ['#1A1A1A'] },
  { id: 8, name: 'Apple Keyboard', image: keyboardImg, price: 2999, desc: 'Ultra-thin and comfortable typing experience.', rating: 4.4, reviewCount: 77, category: 'Best Sellers', colors: ['#EAEAEA'] },
];

function renderStars(rating) {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
  return (
    <span style={{ color: '#FFD700', fontSize: 18 }}>
      {'★'.repeat(fullStars)}{halfStar ? '☆' : ''}{'☆'.repeat(emptyStars)}
    </span>
  );
}

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate(); // Keep navigate if you need it for other actions
  const product = products.find((p) => p.id === Number(id));
  
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState(product ? product.colors[0] : null);

  if (!product) {
    return <div className="product-not-found">Product not found</div>;
  }

  const handleAddToCart = () => {
    // Add actual add to cart logic here
    alert(`Added ${quantity} x ${product.name} (Color: ${selectedColor}) to cart`);
  };

  const handleBuyNow = () => {
    // Add actual buy now logic here (e.g., redirect to checkout)
    alert(`Buy now: ${quantity} x ${product.name} (Color: ${selectedColor})`);
  };

  const incrementQuantity = () => setQuantity(prev => prev + 1);
  const decrementQuantity = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

  // Dummy related products (replace with actual logic)
  const relatedProducts = products.filter(p => p.id !== product.id).slice(0, 4);

  return (
    <div className="product-detail-page">
      {/* Header */}
      <header className="home-header">
        <div className="header-left">
          <Link to="/" className="brand-link">
            <img src={logoIcon} alt="AWE Electronics Logo" className="logo-icon" />
            <span className="brand-title">AWE Electronics</span>
          </Link>
          <nav className="sub-titles">
            <Link to="/new-arrivals" className="sub-title">New Arrivals</Link>
            <Link to="/best-sellers" className="sub-title">Best Sellers</Link>
          </nav>
        </div>
        <div className="header-right">
          <div className="search-bar">
            <img src={searchIcon} alt="search" className="search-icon-internal" />
            <input type="text" placeholder="Search" />
          </div>
          <Link to="/login" className="login-btn">Log in</Link>
          <Link to="/cart" className="cart-btn">
            <img src={cartIcon} alt="cart" className="cart-icon" />
          </Link>
        </div>
      </header>
      {/* Breadcrumbs */}
      <nav className="breadcrumbs-container">
        <Link to="/">Home</Link> /
        <Link to="#">{product.category || 'Category'}</Link> /
        <span>{product.name}</span>
      </nav>

      {/* Main Product Section */}
      <div className="product-detail-card">
        <div className="product-image-section">
          <div className="product-header-section">
            <h1>{product.name}</h1>
            <p>{product.desc}</p>
          </div>
          <div className="product-images-gallery">
            {product.images.map((img, idx) => (
              <img key={idx} src={img} alt={product.name} className="gallery-img" />
            ))}
          </div>
        </div>
        <div className="product-info-section">
          <h1 className="product-name-detail">{product.name}</h1>
          
          <div className="product-reviews-snippet">
            {renderStars(product.rating)}
            <span className="review-count">({product.reviewCount} reviews)</span>
          </div>

          <div className="product-price-detail">${product.price.toLocaleString()}</div>
          
          <p className="product-description-detail">{product.desc}</p>

          {/* Color Selector */}
          {product.colors && product.colors.length > 0 && (
            <div className="product-option-selector">
              <label className="option-label">Color:</label>
              <div className="color-swatches">
                {product.colors.map(color => (
                  <button
                    key={color}
                    className={`color-swatch ${selectedColor === color ? 'selected' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setSelectedColor(color)}
                    aria-label={`Select color ${color}`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Quantity Selector */}
          <div className="product-option-selector">
            <label className="option-label" htmlFor="quantity-input">Quantity:</label>
            <div className="quantity-controls">
              <button onClick={decrementQuantity} className="quantity-btn" aria-label="Decrease quantity">-</button>
              <input type="number" id="quantity-input" value={quantity} readOnly className="quantity-input" />
              <button onClick={incrementQuantity} className="quantity-btn" aria-label="Increase quantity">+</button>
            </div>
          </div>
          
          <div className="purchase-section">
            <div className="price">${product.price}</div>
            <button>加入購物車</button>
          </div>
          <button className="btn btn-secondary btn-buy-now" onClick={handleBuyNow}>
            Buy Now
          </button>

        </div>
      </div>

      {/* Specifications */}
      <div className="product-spec-section">
        <h2 className="spec-title">Specifications</h2>
        <div className="spec-table">
          <div className="spec-row">
            <span>Model</span><span>AWH-9000</span>
            <span>Connectivity</span><span>Bluetooth 5.0</span>
          </div>
          {/* 其他規格 */}
        </div>
      </div>

      {/* You might also like Section */}
      <section className="related-products-section">
        <h2 className="related-products-title">You might also like</h2>
        <div className="related-product-list">
          {relatedProducts.map(rp => (
            <Link to={`/product/${rp.id}`} key={rp.id} className="related-product-card">
              <img src={rp.image} alt={rp.name} className="related-product-img"/>
              <div className="related-product-info">
                <h3>{rp.name}</h3>
                <p className="desc">{rp.shortDesc}</p>
                <p className="price">${rp.price}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
      {/* Footer */}
      <footer className="home-footer">
        <div className="footer-links">
          <Link to="/about-us" className="footer-link-item">About Us</Link>
          <Link to="/customer-support" className="footer-link-item">Customer Support</Link>
          <Link to="/terms-of-service" className="footer-link-item">Terms of Service</Link>
        </div>
        <div className="footer-copyright">© 2025 AWE Electronics. All rights reserved.</div>
      </footer>

      <div className="review-summary">
        <div className="score">4.6</div>
        <div className="stars">{renderStars(4.6)}</div>
        <div className="review-count">125 reviews</div>
        <div className="review-bars">
          {/* 5星、4星... */}
          <div className="bar"><span>5</span><div className="bar-bg"><div className="bar-fill" style={{width: '40%'}} /></div><span>40%</span></div>
          {/* 其他星等 */}
        </div>
      </div>
    </div>
    
  );
};

export default ProductDetail;