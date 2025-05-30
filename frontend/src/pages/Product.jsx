// Product.jsx (Product page component)
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SearchIcon, ShoppingCartIcon } from '../components/ui/icons';
import { useUser } from '../context/UserContext';
import { useCart } from '../context/CartContext';
import { productsAPI } from '../api/config';
import logoIcon from '../assets/Vector - 0.svg';

// Import product images
import laptopImg from '../assets/laptop.png';
import phoneImg from '../assets/Phone.png';
import speakerImg from '../assets/Speaker.png';
import watchImg from '../assets/smartwatch.png';
import mouseImg from '../assets/Wireless mouse.png';
import chargerImg from '../assets/Well charger.png';
import vrImg from '../assets/VR Headset.png';
import keyboardImg from '../assets/Keyboard.png';

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

const ProductPage = () => {
  const { user, isLoggedIn } = useUser();
  const { getCartItemsCount, addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load product data
  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('Starting to load product list...');
      
      const response = await productsAPI.getProducts();
      console.log('Product list API response:', response);
      
      if (response.success && response.data.items) {
        setProducts(response.data.items);
        console.log('Successfully loaded products:', response.data.items.length, 'items');
      } else {
        console.warn('Product API response format incorrect:', response);
        setError('Failed to load products');
      }
    } catch (error) {
      console.error('Error loading products:', error);
      setError('Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      console.log('Starting to load product categories...');
      const response = await productsAPI.getCategories();
      console.log('Categories API response:', response);
      
      if (response.success && response.data) {
        // API returns categories in array format: [{name: "category", count: 10}, ...]
        const categoryNames = response.data.map(cat => cat.name);
        setCategories(['All', ...categoryNames]);
        console.log('Successfully loaded categories:', categoryNames);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      // Set default categories
      setCategories(['All']);
    }
  };

  // Filter and sort products
  const filteredProducts = products
    .filter(product => {
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price_low':
          return a.price - b.price;
        case 'price_high':
          return b.price - a.price;
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

  const handleAddToCart = async (product) => {
    try {
      await addToCart(product, 1);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  };

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
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
        fontSize: '14px',
        color: '#607589'
      }}>
        <Link to="/" style={{ color: '#607589', textDecoration: 'none' }}>Home</Link>
        <span style={{ margin: '0 8px' }}>/</span>
        <span style={{ color: '#121417' }}>Products</span>
      </div>

      {/* Main Content */}
      <div style={{
        display: 'flex',
        gap: '32px',
        padding: '0 40px 40px 40px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Sidebar Filters */}
        <div style={{
          width: '240px',
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '24px',
          height: 'fit-content',
          border: '1px solid #e5e8eb'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#121417',
            marginBottom: '20px'
          }}>
            Filters
          </h3>

          {/* Category Filter */}
          <div style={{ marginBottom: '24px' }}>
            <h4 style={{
              fontSize: '14px',
              fontWeight: '500',
              color: '#121417',
              marginBottom: '12px'
            }}>
              Category
            </h4>
            {categories.map(category => (
              <label key={category} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '8px',
                cursor: 'pointer'
              }}>
                <input
                  type="radio"
                  name="category"
                  value={category}
                  checked={selectedCategory === category}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                />
                <span style={{ fontSize: '14px', color: '#607589' }}>{category}</span>
              </label>
            ))}
          </div>

          {/* Sort By */}
          <div>
            <h4 style={{
              fontSize: '14px',
              fontWeight: '500',
              color: '#121417',
              marginBottom: '12px'
            }}>
              Sort By
            </h4>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #e5e8eb',
                borderRadius: '6px',
                fontSize: '14px',
                backgroundColor: 'white'
              }}
            >
              <option value="name">Name (A-Z)</option>
              <option value="price_low">Price (Low to High)</option>
              <option value="price_high">Price (High to Low)</option>
            </select>
          </div>
        </div>

        {/* Products Grid */}
        <div style={{ flex: 1 }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px'
          }}>
            <h1 style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#121417'
            }}>
              Products
            </h1>
            <p style={{
              fontSize: '14px',
              color: '#607589'
            }}>
              {filteredProducts.length} products found
            </p>
          </div>

          {isLoading ? (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '400px',
              fontSize: '16px',
              color: '#607589'
            }}>
              Loading products...
            </div>
          ) : error ? (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '400px',
              fontSize: '16px',
              color: '#dc2626'
            }}>
              {error}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '400px',
              fontSize: '16px',
              color: '#607589'
            }}>
              No products found
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '24px'
            }}>
              {filteredProducts.map(product => (
                <div key={product.id} style={{
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  border: '1px solid #e5e8eb',
                  overflow: 'hidden',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  cursor: 'pointer'
                }}>
                  <Link to={`/product/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div style={{
                      width: '100%',
                      height: '200px',
                      backgroundColor: '#f8f9fa',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px',
                      color: '#607589'
                    }}>
                      {(() => {
                        // Handle image URL - use image mapping
                        let imageUrl = '';
                        if (product.images && product.images.length > 0) {
                          const imagePath = product.images[0];
                          // Get correct image URL from image mapping
                          imageUrl = imageMap[imagePath];
                          if (!imageUrl) {
                            console.log('Image mapping not found:', imagePath);
                          }
                        }
                        
                        return imageUrl ? (
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
                        );
                      })()}
                    </div>
                    <div style={{ padding: '16px' }}>
                      <h3 style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        color: '#121417',
                        marginBottom: '8px',
                        lineHeight: '1.4'
                      }}>
                        {product.name}
                      </h3>
                      <p style={{
                        fontSize: '14px',
                        color: '#607589',
                        marginBottom: '12px',
                        lineHeight: '1.4',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {product.description}
                      </p>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <span style={{
                          fontSize: '18px',
                          fontWeight: '700',
                          color: '#121417'
                        }}>
                          ${product.price.toFixed(2)}
                        </span>
                        {product.stock_quantity > 0 ? (
                          <span style={{
                            fontSize: '12px',
                            color: '#16a34a',
                            backgroundColor: '#dcfce7',
                            padding: '4px 8px',
                            borderRadius: '4px'
                          }}>
                            In Stock
                          </span>
                        ) : (
                          <span style={{
                            fontSize: '12px',
                            color: '#dc2626',
                            backgroundColor: '#fef2f2',
                            padding: '4px 8px',
                            borderRadius: '4px'
                          }}>
                            Out of Stock
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                  <div style={{ padding: '0 16px 16px 16px' }}>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleAddToCart(product);
                      }}
                      disabled={product.stock_quantity === 0}
                      style={{
                        width: '100%',
                        padding: '10px',
                        backgroundColor: product.stock_quantity > 0 ? '#0D80F2' : '#e5e8eb',
                        color: product.stock_quantity > 0 ? 'white' : '#607589',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: product.stock_quantity > 0 ? 'pointer' : 'not-allowed',
                        transition: 'background-color 0.2s'
                      }}
                    >
                      {product.stock_quantity > 0 ? 'Add to Cart' : 'Out of Stock'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

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

export default ProductPage;