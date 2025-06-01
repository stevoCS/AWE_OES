import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { ordersApi, customersApi } from '../api/adminApi';
import '../components/AdminCommon.css';

const AdminOrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [notification, setNotification] = useState(null);
  
  // order detail modal status
  const [showOrderDetail, setShowOrderDetail] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  
  // confirmation dialogs
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadOrders();
  }, [currentPage, statusFilter]);

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      console.log('Loading orders from admin API...');
      
      const params = {
        page: currentPage,
        limit: 10,
        ...(statusFilter && { status: statusFilter })
      };
      
      const response = await ordersApi.getAll(params);
      
      if (response.success && response.data) {
        console.log('Orders loaded from admin API:', response.data);
        setOrders(response.data.items || []);
        setTotalPages(response.data.pages || 1);
      } else {
        console.log('No orders found or admin API call failed');
        setOrders([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Failed to load orders from admin API:', error);
      setOrders([]);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      console.log('Updating order status:', orderId, 'to', newStatus);
      
      // Pass status string, adminApi will automatically wrap as { status: newStatus }
      const response = await ordersApi.update(orderId, { status: newStatus });
      
      if (response.success) {
        console.log('Order status updated successfully');
        
        // Update local state
        setOrders(prevOrders => prevOrders.map(order => 
          order.id === orderId ? { ...order, status: newStatus } : order
        ));
        
        // Show success message
        setNotification({ type: 'success', text: `Order ${orderId} status updated to ${newStatus}` });
        setTimeout(() => setNotification(null), 3000);
        
        // Reload order data to ensure synchronization
        await loadOrders();
      } else {
        throw new Error(response.message || 'Failed to update order status');
      }
    } catch (error) {
      console.error('Failed to update order status:', error);
      setNotification({ type: 'error', text: `Failed to update order status: ${error.message}` });
    }
  };

  const getStatusBadge = (status) => {
    const statusClass = {
      'shipped': 'admin-status-shipped',
      'processing': 'admin-status-processing',
      'delivered': 'admin-status-delivered',
      'pending': 'admin-status-pending',
      'cancelled': 'admin-status-cancelled'
    }[status?.toLowerCase()] || 'admin-status-default';
    
    return (
      <span className={`admin-status-badge ${statusClass}`}>
        {status || 'Unknown'}
      </span>
    );
  };

  // format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  // get customer name
  const getCustomerName = (order) => {
    return order.customer_info?.name ||
           order.customer_info?.username ||
           order.customer_info?.full_name ||
           order.shipping_address?.recipient_name || 
           order.customer_name || 
           order.customer || 
           'Unknown Customer';
  };

  // get customer email
  const getCustomerEmail = (order) => {
    // Priority: customer_info from API > order fields > fallback
    return order.customer_info?.email ||
           order.customer_email || 
           order.email || 
           order.shipping_address?.email ||
           order.customer?.email ||
           'N/A';
  };

  // get customer phone
  const getCustomerPhone = (order) => {
    const phone = order.customer_info?.phone ||
                  order.customer_info?.phone_number ||
                  order.customer_phone || 
                  order.phone || 
                  order.shipping_address?.phone ||
                  order.customer?.phone;
    return phone || null;
  };

  // get items count
  const getItemsCount = (order) => {
    if (order.items && Array.isArray(order.items)) {
      return order.items.reduce((total, item) => total + (item.quantity || 0), 0);
    }
    return order.items_count || order.items || 0;
  };

  const filteredOrders = statusFilter 
    ? orders.filter(order => order.status?.toLowerCase() === statusFilter.toLowerCase())
    : orders;

  // show notification
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // view order detail
  const handleViewOrder = async (order) => {
    setIsLoadingDetail(true);
    setShowOrderDetail(true);
    
    try {
      // Get full order details first
      let orderData = order;
      
      if (!order.items || !Array.isArray(order.items)) {
        const orderIdentifier = order.order_number || order._id || order.id;
        console.log('Loading full order details for identifier:', orderIdentifier);
        console.log('Original order data:', order);
        
        const response = await ordersApi.getById(orderIdentifier);
        
        if (response.success && response.data) {
          orderData = response.data;
          console.log('Full order data loaded:', orderData);
        } else {
          console.warn('Failed to get full order data, using original:', order);
        }
      }
      
      // Get customer details if customer_id exists
      if (orderData.customer_id) {
        try {
          console.log('Loading customer details for customer_id:', orderData.customer_id);
          const customerResponse = await customersApi.getById(orderData.customer_id);
          
          if (customerResponse.success && customerResponse.data) {
            // Merge customer data into order data
            orderData.customer_info = customerResponse.data;
            orderData.customer_email = customerResponse.data.email;
            orderData.customer_phone = customerResponse.data.phone || customerResponse.data.phone_number;
            orderData.customer_name = customerResponse.data.name || customerResponse.data.username || customerResponse.data.full_name;
            
            console.log('Customer details loaded successfully:', customerResponse.data);
            console.log('Updated order data with customer info:', orderData);
          } else {
            console.warn('Customer API response failed:', customerResponse);
          }
        } catch (customerError) {
          console.warn('Failed to load customer details:', customerError);
          // Continue without customer details
        }
      } else {
        console.warn('No customer_id found in order data:', orderData);
      }
      
      setSelectedOrder(orderData);
    } catch (error) {
      console.error('Failed to load order details:', error);
      showNotification('Failed to load order details', 'error');
      setShowOrderDetail(false);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const closeOrderDetail = () => {
    setShowOrderDetail(false);
    setSelectedOrder(null);
  };

  // format address
  const formatAddress = (address) => {
    if (!address) return 'N/A';
    
    const parts = [
      address.street_address,
      address.city,
      address.state,
      address.postal_code,
      address.country
    ].filter(Boolean);
    
    return parts.join(', ') || 'N/A';
  };

    // calculate order total
  const calculateOrderTotal = (order) => {
    if (order.total_amount) return order.total_amount;
    
    if (order.items && Array.isArray(order.items)) {
      const subtotal = order.items.reduce((sum, item) => {
        return sum + ((item.product_price || item.price || 0) * (item.quantity || 0));
      }, 0);
      
      const tax = order.tax_amount || order.tax || 0;
      const shipping = order.shipping_fee || order.shipping_cost || 0;
      
      return subtotal + tax + shipping;
    }
    
    return 0;
  };

  // handle delete order
  const handleDeleteOrder = async () => {
    if (!selectedOrder) return;
    
    try {
      setIsProcessing(true);
      
      const response = await ordersApi.delete(selectedOrder.id || selectedOrder.order_number);
      
      if (response.success || response.data) {
        showNotification('Order deleted successfully!');
        
        // Remove from local state
        setOrders(orders.filter(order => 
          order.id !== selectedOrder.id && order.order_number !== selectedOrder.order_number
        ));
        
        // Close modals
        setShowDeleteConfirm(false);
        setShowOrderDetail(false);
        setSelectedOrder(null);
        
        // Reload orders to ensure sync
        await loadOrders();
      } else {
        throw new Error(response.message || 'Failed to delete order');
      }
    } catch (error) {
      console.error('Failed to delete order:', error);
      showNotification(`Failed to delete order: ${error.message}`, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // handle archive order
  const handleArchiveOrder = async () => {
    if (!selectedOrder) return;
    
    try {
      setIsProcessing(true);
      
      const response = await ordersApi.archive(selectedOrder.id || selectedOrder.order_number);
      
      if (response.success || response.data) {
        showNotification('Order archived successfully!');
        
        // Update local state
        setOrders(orders.map(order => 
          (order.id === selectedOrder.id || order.order_number === selectedOrder.order_number)
            ? { ...order, status: 'archived' }
            : order
        ));
        
        // Close modals
        setShowArchiveConfirm(false);
        setShowOrderDetail(false);
        setSelectedOrder(null);
        
        // Reload orders to ensure sync
        await loadOrders();
      } else {
        throw new Error(response.message || 'Failed to archive order');
      }
    } catch (error) {
      console.error('Failed to archive order:', error);
      showNotification(`Failed to archive order: ${error.message}`, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AdminLayout>
      <div className="admin-page">
        {/* Notification Toast */}
        {notification && (
          <div 
            style={{
              position: 'fixed',
              top: '20px',
              right: '20px',
              padding: '12px 20px',
              borderRadius: '8px',
              color: 'white',
              backgroundColor: notification.type === 'success' ? '#22c55e' : '#ef4444',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              zIndex: 1000,
              fontSize: '14px',
              fontWeight: 500,
              animation: 'slideIn 0.3s ease-out'
            }}
          >
            {notification.message}
          </div>
        )}

        {/* Header */}
        <div className="admin-page-header">
          <h1 className="admin-page-title">Order Management</h1>
          <div className="admin-header-actions">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="admin-filter-select"
            >
              <option value="">All Orders</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Orders Table */}
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order Number</th>
                <th>Customer</th>
                <th>Email</th>
                <th>Date</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="8" className="admin-table-loading">Loading orders...</td>
                </tr>
              ) : filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order.id || order.order_number}>
                    <td style={{ fontWeight: 600, color: '#0D80F2' }}>
                      {order.order_number || order.id || 'N/A'}
                    </td>
                    <td style={{ fontWeight: 500 }}>
                      {getCustomerName(order)}
                    </td>
                    <td style={{ color: '#6B7582', fontSize: '13px' }}>
                      {getCustomerEmail(order)}
                    </td>
                    <td style={{ color: '#6B7582' }}>
                      {formatDate(order.created_at || order.date)}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {getItemsCount(order)}
                    </td>
                    <td style={{ fontWeight: 600 }}>
                      ${(order.total_amount || order.total || 0).toFixed(2)}
                    </td>
                    <td>
                      {getStatusBadge(order.status)}
                    </td>
                    <td style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <select
                        value={order.status || ''}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        style={{
                          padding: '4px 8px',
                          border: '1px solid #E5E8EB',
                          borderRadius: '6px',
                          fontSize: '12px',
                          background: '#FFFFFF',
                          color: '#121417',
                          outline: 'none',
                          cursor: 'pointer',
                          minWidth: '100px'
                        }}
                      >
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      <button className="admin-btn-secondary" onClick={() => handleViewOrder(order)}>View</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="admin-table-empty">
                    No orders found. {statusFilter ? `No orders with status "${statusFilter}"` : 'Orders will appear here once customers place them.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="admin-pagination">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              className="admin-pagination-btn"
            >
              Previous
            </button>
            <span className="admin-pagination-info">
              Page {currentPage} of {totalPages}
            </span>
            <button 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
              className="admin-pagination-btn"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {showOrderDetail && (
        <div className="admin-modal-overlay" onClick={closeOrderDetail}>
          <div className="admin-modal admin-order-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>Order Details - {selectedOrder?.order_number || selectedOrder?.id || 'N/A'}</h2>
              <button className="admin-modal-close" onClick={closeOrderDetail}>×</button>
            </div>
            
            <div className="admin-modal-form">
              {isLoadingDetail ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#6B7582' }}>
                  Loading order details...
                </div>
              ) : selectedOrder ? (
                <>
                  {/* basic information */}
                  <div className="admin-order-section">
                    <h3>Basic Information</h3>
                    <div className="admin-order-info-grid">
                      <div className="admin-order-info-item">
                        <label>Order Number:</label>
                        <span>{selectedOrder.order_number || selectedOrder.id || 'N/A'}</span>
                      </div>
                      <div className="admin-order-info-item">
                        <label>Order Date:</label>
                        <span>{formatDate(selectedOrder.created_at || selectedOrder.date)}</span>
                      </div>
                      <div className="admin-order-info-item">
                        <label>Order Status:</label>
                        <span>{getStatusBadge(selectedOrder.status)}</span>
                      </div>
                      <div className="admin-order-info-item">
                        <label>Payment Status:</label>
                        <span>{selectedOrder.payment_status || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  {/* customer information */}
                  <div className="admin-order-section">
                    <h3>Customer Information</h3>
                    <div className="admin-order-info-grid">
                      <div className="admin-order-info-item">
                        <label>Customer Name:</label>
                        <span>{getCustomerName(selectedOrder)}</span>
                      </div>
                      <div className="admin-order-info-item">
                        <label>Email Address:</label>
                        <span>{getCustomerEmail(selectedOrder)}</span>
                      </div>
                      <div className="admin-order-info-item">
                        <label>Phone Number:</label>
                        {getCustomerPhone(selectedOrder) ? (
                          <span>{getCustomerPhone(selectedOrder)}</span>
                        ) : (
                          <span style={{ color: '#9CA3AF', fontStyle: 'italic' }}>
                            Remind customer to update phone number
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* shipping address */}
                  <div className="admin-order-section">
                    <h3>Shipping Address</h3>
                    <div className="admin-order-address">
                      {selectedOrder.shipping_address ? (
                        <>
                          <p><strong>Recipient Name:</strong> {selectedOrder.shipping_address.recipient_name || 'N/A'}</p>
                          <p><strong>Address:</strong> {formatAddress(selectedOrder.shipping_address)}</p>
                          <p><strong>Phone Number:</strong> {
                            selectedOrder.shipping_address.phone || getCustomerPhone(selectedOrder) ? 
                              (selectedOrder.shipping_address.phone || getCustomerPhone(selectedOrder)) :
                              <span style={{ color: '#9CA3AF', fontStyle: 'italic' }}>
                                Remind customer to update phone number
                              </span>
                          }</p>
                        </>
                      ) : (
                        <p style={{ color: '#6B7582', fontStyle: 'italic' }}>No shipping address information</p>
                      )}
                    </div>
                  </div>

                  {/* product details */}
                  <div className="admin-order-section">
                    <h3>Product Details</h3>
                    {selectedOrder.items && Array.isArray(selectedOrder.items) ? (
                      <div className="admin-order-items">
                        <table className="admin-order-items-table">
                          <thead>
                            <tr>
                              <th>Product Name</th>
                              <th>Price</th>
                              <th>Quantity</th>
                              <th>Subtotal</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedOrder.items.map((item, index) => (
                              <tr key={index}>
                                <td>{item.product_name || item.name || 'N/A'}</td>
                                <td>${(item.product_price || item.price || 0).toFixed(2)}</td>
                                <td>{item.quantity || 0}</td>
                                <td>${((item.product_price || item.price || 0) * (item.quantity || 0)).toFixed(2)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p style={{ color: '#6B7582', fontStyle: 'italic' }}>No product information</p>
                    )}
                  </div>

                  {/* fee details */}
                  <div className="admin-order-section">
                    <h3>Fee Details</h3>
                    <div className="admin-order-summary">
                      <div className="admin-order-summary-row">
                        <span>Product Subtotal:</span>
                        <span>${selectedOrder.items && Array.isArray(selectedOrder.items) ? 
                          selectedOrder.items.reduce((sum, item) => sum + ((item.product_price || item.price || 0) * (item.quantity || 0)), 0).toFixed(2) : 
                          '0.00'}</span>
                      </div>
                      <div className="admin-order-summary-row">
                        <span>Shipping Cost:</span>
                        <span>${(selectedOrder.shipping_fee || selectedOrder.shipping_cost || 0).toFixed(2)}</span>
                      </div>
                      <div className="admin-order-summary-row">
                        <span>Tax:</span>
                        <span>${(selectedOrder.tax_amount || selectedOrder.tax || 0).toFixed(2)}</span>
                      </div>
                      <div className="admin-order-summary-row admin-order-total">
                        <span>Order Total:</span>
                        <span>${calculateOrderTotal(selectedOrder).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* notes */}
                  {selectedOrder.notes && (
                    <div className="admin-order-section">
                      <h3>Notes</h3>
                      <p>{selectedOrder.notes}</p>
                    </div>
                  )}

                  {/* action buttons */}
                  <div className="admin-order-actions">
                    <button 
                      className="admin-btn-danger"
                      onClick={() => setShowDeleteConfirm(true)}
                      disabled={isProcessing}
                    >
                      Delete Order
                    </button>
                    <button 
                      className="admin-btn-secondary"
                      onClick={() => setShowArchiveConfirm(true)}
                      disabled={isProcessing}
                    >
                      Archive Order
                    </button>
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px', color: '#6B7582' }}>
                  暂无订单详情
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="admin-modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="admin-modal admin-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>Confirm Delete</h2>
              <button className="admin-modal-close" onClick={() => setShowDeleteConfirm(false)}>×</button>
            </div>
            <div className="admin-modal-form">
              <p>Are you sure you want to delete this order?</p>
              <p style={{ color: '#ef4444', fontSize: '14px', marginTop: '8px' }}>
                Order: {selectedOrder?.order_number || selectedOrder?.id || 'N/A'}
              </p>
              <p style={{ color: '#6B7582', fontSize: '13px', fontStyle: 'italic', marginTop: '12px' }}>
                This action cannot be undone. The order will be permanently removed from the system.
              </p>
              
              <div className="admin-modal-actions">
                <button 
                  className="admin-btn-secondary"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isProcessing}
                >
                  Cancel
                </button>
                <button 
                  className="admin-btn-danger"
                  onClick={handleDeleteOrder}
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Deleting...' : 'Delete Order'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Archive Confirmation Modal */}
      {showArchiveConfirm && (
        <div className="admin-modal-overlay" onClick={() => setShowArchiveConfirm(false)}>
          <div className="admin-modal admin-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>Confirm Archive</h2>
              <button className="admin-modal-close" onClick={() => setShowArchiveConfirm(false)}>×</button>
            </div>
            <div className="admin-modal-form">
              <p>Are you sure you want to archive this order?</p>
              <p style={{ color: '#0D80F2', fontSize: '14px', marginTop: '8px' }}>
                Order: {selectedOrder?.order_number || selectedOrder?.id || 'N/A'}
              </p>
              <p style={{ color: '#6B7582', fontSize: '13px', fontStyle: 'italic', marginTop: '12px' }}>
                Archived orders will be moved to the archive and won't appear in regular order lists.
              </p>
              
              <div className="admin-modal-actions">
                <button 
                  className="admin-btn-secondary"
                  onClick={() => setShowArchiveConfirm(false)}
                  disabled={isProcessing}
                >
                  Cancel
                </button>
                <button 
                  className="admin-btn-primary"
                  onClick={handleArchiveOrder}
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Archiving...' : 'Archive Order'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminOrderManagement; 