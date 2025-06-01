import React, { useState, useEffect, useRef } from 'react';
import AdminLayout from '../components/AdminLayout';
import { productsApi } from '../api/adminApi';
import { getProductImageUrl } from '../utils/imageMap';
import '../components/AdminCommon.css';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const AdminProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Homepage preview data
  const [homepageProducts, setHomepageProducts] = useState({
    new: [],
    best: []
  });
  
  // window.confirm
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);
  
  // formData
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    price: '',
    stock_quantity: '',
    description: '',
    category: '',
    features: '',
    specifications: '',
    homepage_section: ''
  });
  
  // selectedImages
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreview, setImagePreview] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [submitMessage, setSubmitMessage] = useState({ type: '', text: '' });

  // Drag and Drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      console.log('Loading products from admin API...');
      
      const response = await productsApi.getAll({ limit: 50 });
      
      if (response.success && response.data) {
        console.log('Products loaded from admin API:', response.data.items);
        const allProducts = response.data.items || [];
        setProducts(allProducts);
        
        // Filter products for homepage preview
        const newProducts = allProducts.filter(p => p.homepage_section === 'new');
        const bestProducts = allProducts.filter(p => p.homepage_section === 'best');
        
        setHomepageProducts({
          new: newProducts,
          best: bestProducts
        });
        
        console.log('Homepage products updated:', { newProducts: newProducts.length, bestProducts: bestProducts.length });
      } else {
        console.log('Admin API call failed, products not available');
        setProducts([]);
        setHomepageProducts({ new: [], best: [] });
      }
      
    } catch (error) {
      console.error('Failed to load products from admin API:', error);
      setProducts([]);
      setHomepageProducts({ new: [], best: [] });
    } finally {
      setIsLoading(false);
    }
  };

  // openAddModal
  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      brand: '',
      price: '',
      stock_quantity: '',
      description: '',
      category: '',
      features: '',
      specifications: '',
      homepage_section: ''
    });
    setSelectedImages([]);
    setImagePreview([]);
    setFormErrors({});
    setSubmitMessage({ type: '', text: '' });
    setShowModal(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      brand: product.brand || '',
      price: product.price || '',
      stock_quantity: product.stock_quantity || '',
      description: product.description || '',
      category: product.category || '',
      features: Array.isArray(product.features) ? product.features.join('\n') : (product.features || ''),
      specifications: typeof product.specifications === 'object' && product.specifications?.content 
        ? product.specifications.content 
        : (typeof product.specifications === 'string' ? product.specifications : ''),
      homepage_section: product.homepage_section || ''
    });
    setSelectedImages([]);
    setImagePreview(product.images || []);
    setFormErrors({});
    setSubmitMessage({ type: '', text: '' });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setFormData({
      name: '',
      brand: '',
      price: '',
      stock_quantity: '',
      description: '',
      category: '',
      features: '',
      specifications: '',
      homepage_section: ''
    });
    setSelectedImages([]);
    setImagePreview([]);
    setFormErrors({});
    setSubmitMessage({ type: '', text: '' });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // clear formErrors
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // validate file type and size
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        setSubmitMessage({ type: 'error', text: 'Please select a valid image file' });
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        setSubmitMessage({ type: 'error', text: 'Image size cannot exceed 5MB' });
        return false;
      }
      return true;
    });

    setSelectedImages(validFiles);

    // generate preview
    const previews = validFiles.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(previews).then(setImagePreview);
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) errors.name = 'Product name cannot be empty';
    if (!formData.price) errors.price = 'Price cannot be empty';
    else if (isNaN(formData.price) || Number(formData.price) <= 0) errors.price = 'Please enter a valid price';
    if (!formData.stock_quantity) errors.stock_quantity = 'Stock quantity cannot be empty';
    else if (isNaN(formData.stock_quantity) || Number(formData.stock_quantity) < 0) errors.stock_quantity = 'Please enter a valid stock quantity';
    if (!formData.description.trim()) errors.description = 'Product description cannot be empty';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setSubmitMessage({ type: '', text: '' });
    
    try {
      const productData = {
        name: formData.name.trim(),
        brand: formData.brand.trim() || undefined,
        price: Number(formData.price),
        stock_quantity: Number(formData.stock_quantity),
        description: formData.description.trim(),
        category: formData.category || undefined,
        features: formData.features ? formData.features.split('\n').filter(f => f.trim()) : [],
        specifications: formData.specifications ? { content: formData.specifications.trim() } : {},
        homepage_section: formData.homepage_section || null,
        is_available: true
      };

      // Remove undefined values
      Object.keys(productData).forEach(key => {
        if (productData[key] === undefined) {
          delete productData[key];
        }
      });
      
      console.log('Sending product data:', productData);
      
      let response;
      if (editingProduct) {
        // edit product
        response = await productsApi.update(editingProduct.id, productData);
      } else {
        // add product
        response = await productsApi.create(productData);
      }
      
      if (response.success) {
        setSubmitMessage({
          type: 'success',
          text: editingProduct ? 'Product updated successfully!' : 'Product added successfully!'
        });
        
        // reload product list and homepage data
        setTimeout(() => {
          loadProducts(); // This will also update homepageProducts
          closeModal();
        }, 1500);
      } else {
        throw new Error(response.message || 'Operation failed');
      }
      
    } catch (error) {
      console.error('Submit product failed:', error);
      setSubmitMessage({
        type: 'error',
        text: error.message || 'Operation failed, please try again'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }
    
    try {
      const response = await productsApi.delete(productId);
      if (response.success) {
        loadProducts(); // reload list
      } else {
        alert('Delete failed: ' + (response.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Delete product failed:', error);
      alert('Delete failed: ' + error.message);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.brand && product.brand.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Generate homepage preview with real data
  const generateHomepagePreview = () => {
    const newArrivals = homepageProducts.new || [];
    const bestSellers = homepageProducts.best || [];
    
    // For each section, show up to 4 products
    const newArrivalsDisplay = [...newArrivals].slice(0, 4);
    const bestSellersDisplay = [...bestSellers].slice(0, 4);
    
    // Add placeholders if needed
    while (newArrivalsDisplay.length < 4) {
      newArrivalsDisplay.push({ 
        id: `placeholder-new-${newArrivalsDisplay.length}`, 
        name: 'Empty Slot', 
        isPlaceholder: true 
      });
    }
    
    while (bestSellersDisplay.length < 4) {
      bestSellersDisplay.push({ 
        id: `placeholder-best-${bestSellersDisplay.length}`, 
        name: 'Empty Slot', 
        isPlaceholder: true 
      });
    }
    
    return { newArrivals: newArrivalsDisplay, bestSellers: bestSellersDisplay };
  };

  // Handle drag end event
  const handleDragEnd = async (event) => {
    const { active, over } = event;
    
    if (!over) return;
    
    const draggedProductId = active.id;
    const targetSection = over.id;
    
    // Find the dragged product
    const allProducts = [...homepageProducts.new, ...homepageProducts.best];
    const draggedProduct = allProducts.find(p => p.id === draggedProductId);
    
    if (!draggedProduct || draggedProduct.homepage_section === targetSection) {
      return; // No change needed
    }
    
    try {
      // Update product in database
      const response = await productsApi.update(draggedProductId, {
        homepage_section: targetSection === 'none' ? null : targetSection
      });
      
      if (response.success) {
        // Refresh the data
        loadProducts();
        
        // Show success message temporarily
        setSubmitMessage({
          type: 'success',
          text: `Product moved to ${targetSection === 'none' ? 'Not Displayed' : targetSection === 'new' ? 'New Arrivals' : 'Best Sellers'} section`
        });
        
        setTimeout(() => {
          setSubmitMessage({ type: '', text: '' });
        }, 3000);
      }
    } catch (error) {
      console.error('Failed to update product section:', error);
      setSubmitMessage({
        type: 'error',
        text: 'Failed to move product. Please try again.'
      });
      
      setTimeout(() => {
        setSubmitMessage({ type: '', text: '' });
      }, 3000);
    }
  };

  // Draggable Product Component
  const DraggableProduct = ({ product }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: product.id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.8 : 1,
      cursor: isDragging ? 'grabbing' : 'grab',
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className={`admin-mockup-product ${product.isCurrentProduct ? 'active' : ''} ${product.isPlaceholder ? 'placeholder' : ''}`}
      >
        <div className="admin-mockup-image">
          {product.isCurrentProduct ? (product.homepage_section === 'new' ? '✨' : '🏆') : 
           product.isPlaceholder ? '📦' : '💻'}
        </div>
        <span>{product.name}</span>
      </div>
    );
  };

  // Drop Zone Component
  const DropZone = ({ sectionId, title, products }) => {
    const { isOver, setNodeRef } = useDroppable({
      id: sectionId,
    });

    return (
      <div className="admin-mockup-section">
        <div className="admin-mockup-title">{title}</div>
        <div 
          ref={setNodeRef}
          className={`admin-mockup-products admin-drop-zone ${isOver ? 'drag-over' : ''}`}
          style={{
            minHeight: '120px',
            border: '2px dashed transparent',
            borderRadius: '8px',
            transition: 'all 0.2s ease'
          }}
        >
          {products.filter(p => !p.isPlaceholder).map((product) => (
            <DraggableProduct key={product.id} product={product} />
          ))}
          {products.filter(p => p.isPlaceholder).map((product) => (
            <div key={product.id} className="admin-mockup-product placeholder">
              <div className="admin-mockup-image">📦</div>
              <span>{product.name}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Not Displayed Drop Zone Component
  const NotDisplayedDropZone = () => {
    const { isOver, setNodeRef } = useDroppable({
      id: 'none',
    });

    return (
      <div className="admin-mockup-section">
        <div className="admin-mockup-title">Not Displayed</div>
        <div 
          ref={setNodeRef}
          className={`admin-mockup-products admin-drop-zone admin-drop-zone-none ${isOver ? 'drag-over' : ''}`}
          style={{
            minHeight: '80px',
            border: '2px dashed #E5E8EB',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#6B7582',
            fontSize: '12px',
            fontStyle: 'italic'
          }}
        >
          {isOver ? 'Drop to remove from homepage' : 'Drag products here to remove from homepage'}
        </div>
      </div>
    );
  };

  return (
    <AdminLayout>
      <div className="admin-page">
        {/* Header */}
        <div className="admin-page-header">
          <h1 className="admin-page-title">Products</h1>
          <div className="admin-header-actions">
            <button className="admin-btn-primary" onClick={openAddModal}>Add New Product</button>
          </div>
        </div>

        {/* Search */}
        <div style={{ marginBottom: '24px' }}>
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="admin-search-input"
          />
        </div>

        {/* Products Grid */}
        <div className="admin-product-grid">
          {isLoading ? (
            <div style={{ 
              gridColumn: '1 / -1',
              textAlign: 'center',
              padding: '40px',
              color: '#6B7582',
              fontStyle: 'italic'
            }}>Loading products...</div>
          ) : filteredProducts.length > 0 ? (
            filteredProducts.map(product => (
              <div key={product.id} className="admin-product-card">
                <div className="admin-product-image">
                  {getProductImageUrl(product) ? (
                    <img 
                      src={getProductImageUrl(product)} 
                      alt={product.name}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div 
                    className="admin-product-placeholder" 
                    style={{ 
                      display: getProductImageUrl(product) ? 'none' : 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '100%',
                      height: '100%'
                    }}
                  >
                    📷
                  </div>
                </div>
                
                <div className="admin-product-info">
                  <h3 className="admin-product-name">{product.name}</h3>
                  <p className="admin-product-brand">{product.brand || 'No Brand'}</p>
                  <p className="admin-product-price">${product.price}</p>
                  <p className="admin-product-stock">Stock: {product.stock_quantity}</p>
                  
                  <div className="admin-product-actions">
                    <button className="admin-btn-secondary" onClick={() => openEditModal(product)}>Edit</button>
                    <button className="admin-btn-danger" onClick={() => handleDelete(product.id)}>Delete</button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div style={{ 
              gridColumn: '1 / -1',
              textAlign: 'center',
              padding: '40px',
              color: '#6B7582',
              fontStyle: 'italic'
            }}>
              {searchTerm ? `No products found matching "${searchTerm}"` : 'No products found'}
            </div>
          )}
        </div>
      </div>
      
      {/* product add/edit modal */}
      {showModal && (
        <div className="admin-modal-overlay" onClick={closeModal}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>{editingProduct ? 'Edit product' : 'Add product'}</h2>
              <button className="admin-modal-close" onClick={closeModal}>×</button>
            </div>
            
            <form onSubmit={handleSubmit} className="admin-modal-form">
              {/* status message */}
              {submitMessage.text && (
                <div className={`admin-alert admin-alert-${submitMessage.type}`}>
                  {submitMessage.text}
                </div>
              )}
              
              {/* product information */}
              <div className="admin-form-grid">
                <div className="admin-form-group">
                  <label className="admin-form-label">Product name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`admin-form-input ${formErrors.name ? 'error' : ''}`}
                    placeholder="Enter product name"
                  />
                  {formErrors.name && <span className="admin-form-error">{formErrors.name}</span>}
                </div>
                
                <div className="admin-form-group">
                  <label className="admin-form-label">Brand</label>
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                    className="admin-form-input"
                    placeholder="Enter brand name"
                  />
                </div>
                
                <div className="admin-form-group">
                  <label className="admin-form-label">Price *</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className={`admin-form-input ${formErrors.price ? 'error' : ''}`}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                  {formErrors.price && <span className="admin-form-error">{formErrors.price}</span>}
                </div>
                
                <div className="admin-form-group">
                  <label className="admin-form-label">Stock quantity *</label>
                  <input
                    type="number"
                    name="stock_quantity"
                    value={formData.stock_quantity}
                    onChange={handleInputChange}
                    className={`admin-form-input ${formErrors.stock_quantity ? 'error' : ''}`}
                    placeholder="0"
                    min="0"
                  />
                  {formErrors.stock_quantity && <span className="admin-form-error">{formErrors.stock_quantity}</span>}
                </div>
                
                <div className="admin-form-group">
                  <label className="admin-form-label">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="admin-form-input"
                  >
                    <option value="">Select category</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Computers">Computers</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Audio">Audio</option>
                    <option value="Gaming">Gaming</option>
                  </select>
                </div>
              </div>
              
              {/* product description */}
              <div className="admin-form-group">
                <label className="admin-form-label">Product description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className={`admin-form-textarea ${formErrors.description ? 'error' : ''}`}
                  placeholder="Enter product description..."
                  rows={4}
                />
                {formErrors.description && <span className="admin-form-error">{formErrors.description}</span>}
              </div>
              
              {/* product features */}
              <div className="admin-form-group">
                <label className="admin-form-label">Product features</label>
                <textarea
                  name="features"
                  value={formData.features}
                  onChange={handleInputChange}
                  className="admin-form-textarea"
                  placeholder="Enter product features, one per line..."
                  rows={3}
                />
              </div>
              
              {/* product specifications */}
              <div className="admin-form-group">
                <label className="admin-form-label">Technical specifications</label>
                <textarea
                  name="specifications"
                  value={formData.specifications}
                  onChange={handleInputChange}
                  className="admin-form-textarea"
                  placeholder="Enter product specifications..."
                  rows={3}
                />
              </div>
              
              {/* Homepage Section Selection */}
              <div className="admin-form-group">
                <label className="admin-form-label">Homepage Display Section</label>
                <div className="admin-homepage-sections">
                  <div className="admin-section-options">
                    <div 
                      className={`admin-section-option ${formData.homepage_section === '' ? 'selected' : ''}`}
                      onClick={() => setFormData(prev => ({ ...prev, homepage_section: '' }))}
                    >
                      <div className="admin-section-icon">🚫</div>
                      <span>Not Displayed</span>
                      <small>Product won't appear on homepage</small>
                    </div>
                    
                    <div 
                      className={`admin-section-option ${formData.homepage_section === 'new' ? 'selected' : ''}`}
                      onClick={() => setFormData(prev => ({ ...prev, homepage_section: 'new' }))}
                    >
                      <div className="admin-section-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>✨</div>
                      <span>New Arrivals</span>
                      <small>Latest products section</small>
                    </div>
                    
                    <div 
                      className={`admin-section-option ${formData.homepage_section === 'best' ? 'selected' : ''}`}
                      onClick={() => setFormData(prev => ({ ...prev, homepage_section: 'best' }))}
                    >
                      <div className="admin-section-icon" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>🏆</div>
                      <span>Best Sellers</span>
                      <small>Popular products section</small>
                    </div>
                  </div>
                  
                  <div className="admin-section-preview">
                    <h4>Homepage Preview</h4>
                    <div className="admin-drag-hint" style={{
                      background: '#F0F7FF',
                      border: '1px solid #0D80F2',
                      borderRadius: '6px',
                      padding: '8px 12px',
                      marginBottom: '12px',
                      fontSize: '12px',
                      color: '#0D80F2',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      <span>💡</span>
                      <span>Drag products between sections to reorganize your homepage</span>
                    </div>
                    
                    {/* Drag Status Message */}
                    {submitMessage.text && (
                      <div className={`admin-alert admin-alert-${submitMessage.type}`} style={{
                        marginBottom: '12px',
                        fontSize: '12px',
                        padding: '8px 12px'
                      }}>
                        {submitMessage.text}
                      </div>
                    )}
                    
                    <div className="admin-homepage-mockup">
                      <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                      >
                        {(() => {
                          const previewData = generateHomepagePreview();
                          
                          return (
                            <>
                              <DropZone sectionId="new" title="New Arrivals" products={previewData.newArrivals} />
                              <DropZone sectionId="best" title="Best Sellers" products={previewData.bestSellers} />
                              
                              {/* Not Displayed Zone */}
                              <NotDisplayedDropZone />
                            </>
                          );
                        })()}
                      </DndContext>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* product images */}
              <div className="admin-form-group">
                <label className="admin-form-label">Product images</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="admin-form-file"
                  style={{ display: 'none' }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="admin-btn-secondary"
                >
                  Select images
                </button>
                <small className="admin-form-help">Supports JPG, PNG, GIF, max 5MB</small>
                
                {/* image preview */}
                {imagePreview.length > 0 && (
                  <div className="admin-image-preview">
                    {imagePreview.map((preview, index) => (
                      <div key={index} className="admin-preview-item">
                        <img src={preview} alt={`Preview ${index + 1}`} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* form buttons */}
              <div className="admin-form-actions">
                <button type="button" className="admin-btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="admin-btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : (editingProduct ? 'Update product' : 'Add product')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminProductManagement; 