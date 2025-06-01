// Product.jsx (Product page component)
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { SearchIcon, ShoppingCartIcon } from '../components/ui/icons';
import Layout from '../components/Layout';
import { useUser } from '../context/UserContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { productsAPI } from '../api/config';
import { getProductImageUrl } from '../utils/imageMap';
import logoIcon from '../assets/Vector - 0.svg';

const ProductPage = () => {
  const { user, isLoggedIn } = useUser();
  const { getCartItemsCount, addToCart } = useCart();
  const { theme } = useTheme();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('name');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();

  // Get search term from URL parameters
  const searchParams = new URLSearchParams(location.search);
  const urlSearchTerm = searchParams.get('search') || '';

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
      
      // Apply search filter if there's a search term from URL
      const matchesSearch = !urlSearchTerm || 
        product.name.toLowerCase().includes(urlSearchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(urlSearchTerm.toLowerCase()) ||
        product.brand?.toLowerCase().includes(urlSearchTerm.toLowerCase());
      
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
    <Layout>
      <div style={{
        backgroundColor: theme.background,
        minHeight: '100vh',
        fontFamily: "'Space Grotesk', Arial, sans-serif"
      }}>
        {/* Breadcrumb */}
        <div style={{
          padding: '20px 0',
          maxWidth: '1200px',
          margin: '0 auto',
          paddingLeft: '40px',
          paddingRight: '40px',
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
          <span style={{ color: theme.textPrimary }}>Products</span>
        </div>

        {/* Header Section */}
        <div style={{
          padding: '20px 40px',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px'
          }}>
            <div>
              <h1 style={{
                fontSize: '32px',
                fontWeight: '700',
                color: theme.textPrimary,
                margin: 0
              }}>
                Products
              </h1>
              {urlSearchTerm && (
                <p style={{
                  fontSize: '16px',
                  color: theme.textSecondary,
                  margin: '8px 0 0 0'
                }}>
                  Search results for "{urlSearchTerm}"
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div style={{
          display: 'flex',
          gap: '32px',
          padding: '0 40px 40px',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          {/* Sidebar Filters */}
          <div style={{
            width: '240px',
            backgroundColor: theme.cardBg,
            borderRadius: '8px',
            padding: '24px',
            height: 'fit-content',
            border: `1px solid ${theme.border}`,
            boxShadow: theme.shadowLight
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: theme.textPrimary,
              marginBottom: '20px'
            }}>
              Filters
            </h3>

            {/* Category Filter */}
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{
                fontSize: '14px',
                fontWeight: '500',
                color: theme.textPrimary,
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
                    style={{
                      accentColor: theme.primary
                    }}
                  />
                  <span style={{ fontSize: '14px', color: theme.textSecondary }}>{category}</span>
                </label>
              ))}
            </div>

            {/* Sort By */}
            <div>
              <h4 style={{
                fontSize: '14px',
                fontWeight: '500',
                color: theme.textPrimary,
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
                  border: `1px solid ${theme.border}`,
                  borderRadius: '6px',
                  fontSize: '14px',
                  backgroundColor: theme.inputBg,
                  color: theme.textPrimary,
                  transition: 'border-color 0.2s ease'
                }}
                onFocus={(e) => e.target.style.borderColor = theme.primary}
                onBlur={(e) => e.target.style.borderColor = theme.border}
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
              justifyContent: 'flex-end',
              alignItems: 'center',
              marginBottom: '24px'
            }}>
              <p style={{
                fontSize: '14px',
                color: theme.textSecondary
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
                color: theme.textSecondary
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
                color: theme.error
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
                color: theme.textSecondary
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
                    backgroundColor: theme.cardBg,
                    borderRadius: '8px',
                    border: `1px solid ${theme.border}`,
                    overflow: 'hidden',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    cursor: 'pointer',
                    boxShadow: theme.shadowLight
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = theme.shadow;
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = theme.shadowLight;
                  }}
                  >
                    <Link to={`/product/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <div style={{
                        width: '100%',
                        height: '200px',
                        backgroundColor: theme.placeholderBg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden'
                      }}>
                        {(() => {
                          const imageUrl = getProductImageUrl(product);
                          return imageUrl ? (
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
                            <div style={{ 
                              fontSize: '14px', 
                              color: theme.textMuted 
                            }}>
                              No Image
                            </div>
                          );
                        })()}
                      </div>
                      <div style={{ padding: '16px' }}>
                        <h3 style={{
                          fontSize: '16px',
                          fontWeight: '600',
                          color: theme.textPrimary,
                          margin: '0 0 8px 0'
                        }}>
                          {product.name}
                        </h3>
                        <p style={{
                          fontSize: '14px',
                          color: theme.textSecondary,
                          margin: '0 0 12px 0',
                          lineHeight: 1.4
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
                            color: theme.textPrimary
                          }}>
                            ${product.price.toFixed(2)}
                          </span>
                          <span style={{
                            fontSize: '12px',
                            color: theme.textTertiary,
                            backgroundColor: theme.backgroundTertiary,
                            padding: '4px 8px',
                            borderRadius: '4px'
                          }}>
                            {product.category}
                          </span>
                        </div>
                      </div>
                    </Link>
                    <div style={{ padding: '0 16px 16px' }}>
                      <button
                        onClick={() => handleAddToCart(product)}
                        style={{
                          width: '100%',
                          padding: '8px 16px',
                          backgroundColor: theme.primary,
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '14px',
                          fontWeight: '500',
                          cursor: 'pointer',
                          transition: 'background-color 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = theme.primaryHover}
                        onMouseLeave={(e) => e.target.style.backgroundColor = theme.primary}
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProductPage;