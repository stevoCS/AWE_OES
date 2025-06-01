import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { customersApi } from '../api/adminApi';
import '../components/AdminCommon.css';

const AdminCustomerManagement = () => {
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // customer detail and edit modal status
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    loadCustomers();
  }, [currentPage, searchTerm]);

  const loadCustomers = async () => {
    try {
      setIsLoading(true);
      console.log('Loading customers from admin API...');
      
      const params = {
        page: currentPage,
        limit: 10,
        ...(searchTerm && { search: searchTerm })
      };
      
      const response = await customersApi.getAll(params);
      
      if (response.success && response.data) {
        console.log('Customers loaded from admin API:', response.data);
        setCustomers(response.data.items || response.data.customers || []);
        setTotalPages(response.data.pages || Math.ceil((response.data.total || 0) / 10));
      } else {
        console.log('No customers found in API response');
        setCustomers([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Failed to load customers from admin API:', error);
      
      // Handle specific error types
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        showNotification('Session expired. Please refresh the page and login again.', 'error');
      } else if (error.message.includes('403') || error.message.includes('Forbidden')) {
        showNotification('Access denied. Admin privileges required.', 'error');
      } else {
        showNotification('Failed to load customers: ' + error.message, 'error');
      }
      
      setCustomers([]);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusClass = {
      'Active': 'admin-status-active',
      'Inactive': 'admin-status-inactive',
      'Suspended': 'admin-status-cancelled'
    }[status] || 'admin-status-default';
    
    return (
      <span className={`admin-status-badge ${statusClass}`}>
        {status}
      </span>
    );
  };

  // display notification
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // format date - only show date, no time
  const formatJoinDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'N/A';
    }
  };

  // view customer detail
  const handleViewCustomer = async (customer) => {
    setIsLoadingDetail(true);
    setShowDetailModal(true);
    
    try {
      let customerData = customer;
      
      // if need to get full details from API
      if (!customer.address && customer.id) {
        console.log('Loading full customer details for:', customer.id);
        const response = await customersApi.getById(customer.id);
        
        if (response.success && response.data) {
          customerData = response.data;
        }
      }
      
      setSelectedCustomer(customerData);
    } catch (error) {
      console.error('Failed to load customer details:', error);
      
      // Handle specific error types
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        showNotification('Session expired. Please refresh the page and login again.', 'error');
      } else if (error.message.includes('403') || error.message.includes('Forbidden')) {
        showNotification('Access denied. Admin privileges required.', 'error');
      } else {
        showNotification('Failed to load customer details', 'error');
      }
      
      setShowDetailModal(false);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedCustomer(null);
  };

  // edit customer
  const handleEditCustomer = (customer) => {
    setSelectedCustomer({...customer});
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setSelectedCustomer(null);
  };

  // delete customer
  const handleDeleteCustomer = async (customerId) => {
    if (!window.confirm('Are you sure you want to delete this customer? This action cannot be undone and will delete all related customer data.')) {
      return;
    }
    
    try {
      const response = await customersApi.delete(customerId);
      if (response.success) {
        showNotification('Customer deleted successfully');
        
        // immediately remove customer from local state
        setCustomers(prevCustomers => 
          prevCustomers.filter(customer => customer.id !== customerId)
        );
        
        closeEditModal();
      } else {
        throw new Error(response.message || 'Delete failed');
      }
    } catch (error) {
      console.error('Delete customer failed:', error);
      
      // Handle specific error types
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        showNotification('Session expired. Please refresh the page and login again.', 'error');
      } else if (error.message.includes('403') || error.message.includes('Forbidden')) {
        showNotification('Access denied. Admin privileges required.', 'error');
      } else {
        showNotification('Delete failed: ' + error.message, 'error');
      }
    }
  };

  // update customer information
  const handleUpdateCustomer = async (customerData) => {
    setIsSubmitting(true);
    
    try {
      const response = await customersApi.update(customerData.id, customerData);
      if (response.success) {
        showNotification('Customer information updated successfully');
        
        // immediately update customer in local state
        setCustomers(prevCustomers =>
          prevCustomers.map(customer =>
            customer.id === customerData.id ? { ...customer, ...customerData } : customer
          )
        );
        
        closeEditModal();
      } else {
        throw new Error(response.message || 'Update failed');
      }
    } catch (error) {
      console.error('Update customer failed:', error);
      
      // Handle specific error types
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        showNotification('Session expired. Please refresh the page and login again.', 'error');
      } else if (error.message.includes('403') || error.message.includes('Forbidden')) {
        showNotification('Access denied. Admin privileges required.', 'error');
      } else {
        showNotification('Update failed: ' + error.message, 'error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCustomers = searchTerm 
    ? customers.filter(customer => 
        (customer.name || customer.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (customer.email || '').toLowerCase().includes(searchTerm.toLowerCase())
      )
    : customers;

  return (
    <AdminLayout>
      <div className="admin-page">
        {/* Header */}
        <div className="admin-page-header">
          <h1 className="admin-page-title">Customer Management</h1>
          <div className="admin-header-actions">
            <input
              type="text"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="admin-search-input"
            />
          </div>
        </div>

        {/* Customer Stats Cards */}
        <div className="admin-stats-grid">
          <div className="admin-stat-card">
            <div className="admin-stat-number">{customers.length}</div>
            <div className="admin-stat-label">Total Customers</div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-number">{customers.filter(c => c.is_active !== false).length}</div>
            <div className="admin-stat-label">Active Customers</div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-number">{customers.filter(c => c.is_active === false).length}</div>
            <div className="admin-stat-label">Inactive Customers</div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-number">
              ${customers.reduce((sum, c) => sum + (c.total_spent || 0), 0).toLocaleString()}
            </div>
            <div className="admin-stat-label">Total Revenue</div>
          </div>
        </div>

        {/* Customers Table */}
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Join Date</th>
                <th>Orders</th>
                <th>Total Spent</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="8" className="admin-table-loading">Loading customers...</td>
                </tr>
              ) : filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer) => (
                  <tr key={customer.id}>
                    <td style={{ fontWeight: 500 }}>
                      {customer.name || customer.username || customer.full_name || 'N/A'}
                    </td>
                    <td style={{ color: '#6B7582', fontSize: '13px' }}>
                      {customer.email || 'N/A'}
                    </td>
                    <td style={{ color: '#6B7582', fontFamily: 'monospace' }}>
                      {customer.phone || customer.phone_number || 'N/A'}
                    </td>
                    <td style={{ color: '#6B7582' }}>
                      {formatJoinDate(customer.join_date || customer.created_at || customer.date_joined)}
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 600 }}>
                      {customer.total_orders || customer.orders_count || 0}
                    </td>
                    <td style={{ fontWeight: 600, color: '#0D80F2' }}>
                      ${(customer.total_spent || 0).toLocaleString()}
                    </td>
                    <td>
                      {getStatusBadge(customer.is_active !== false ? 'Active' : 'Inactive')}
                    </td>
                    <td style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button className="admin-btn-secondary" onClick={() => handleViewCustomer(customer)}>View</button>
                      <button className="admin-btn-secondary" onClick={() => handleEditCustomer(customer)}>Edit</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="admin-table-empty">
                    No customers found. Customers will appear here once they register.
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

      {/* Customer Detail Modal */}
      {showDetailModal && (
        <div className="admin-modal-overlay" onClick={closeDetailModal}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>Customer Details</h2>
              <button className="admin-modal-close" onClick={closeDetailModal}>×</button>
            </div>
            
            <div className="admin-modal-form">
              {isLoadingDetail ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#6B7582' }}>
                  Loading customer details...
                </div>
              ) : selectedCustomer ? (
                <>
                  {/* basic information */}
                  <div className="admin-order-section">
                    <h3>Basic Information</h3>
                    <div className="admin-order-info-grid">
                      <div className="admin-order-info-item">
                        <label>Customer Name:</label>
                        <span>{selectedCustomer.name || selectedCustomer.username || selectedCustomer.full_name || 'N/A'}</span>
                      </div>
                      <div className="admin-order-info-item">
                        <label>Email Address:</label>  
                        <span>{selectedCustomer.email || 'N/A'}</span>
                      </div>
                      <div className="admin-order-info-item">
                        <label>Phone Number:</label>
                        <span>{selectedCustomer.phone || selectedCustomer.phone_number || 'N/A'}</span>
                      </div>
                      <div className="admin-order-info-item">
                        <label>Join Date:</label>
                        <span>{formatJoinDate(selectedCustomer.join_date || selectedCustomer.created_at || selectedCustomer.date_joined)}</span>
                      </div>
                    </div>
                  </div>

                  {/* statistics information */}
                  <div className="admin-order-section">
                    <h3>Statistics Information</h3>
                    <div className="admin-order-info-grid">
                      <div className="admin-order-info-item">
                        <label>Order Count:</label>
                        <span>{selectedCustomer.total_orders || selectedCustomer.orders_count || 0}</span>
                      </div>
                      <div className="admin-order-info-item">
                        <label>Total Spent:</label>
                        <span>${(selectedCustomer.total_spent || 0).toLocaleString()}</span>
                      </div>
                      <div className="admin-order-info-item">
                        <label>Account Status:</label>
                        <span>{getStatusBadge(selectedCustomer.is_active !== false ? 'Active' : 'Inactive')}</span>
                      </div>
                    </div>
                  </div>

                  {/* address information */}
                  {selectedCustomer.address && (
                    <div className="admin-order-section">
                      <h3>Address Information</h3>
                      <div className="admin-order-address">
                        <p>{selectedCustomer.address}</p>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px', color: '#6B7582' }}>
                  No customer details information
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Customer Edit Modal */}
      {showEditModal && selectedCustomer && (
        <div className="admin-modal-overlay" onClick={closeEditModal}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>Edit Customer</h2>
              <button className="admin-modal-close" onClick={closeEditModal}>×</button>
            </div>
            
            <div className="admin-modal-form">
              <form onSubmit={(e) => {
                e.preventDefault();
                handleUpdateCustomer(selectedCustomer);
              }}>
                {/* basic information edit */}
                <div className="admin-form-grid">
                  <div className="admin-form-group">
                    <label className="admin-form-label">Customer Name</label>
                    <input
                      type="text"
                      value={selectedCustomer.name || selectedCustomer.username || selectedCustomer.full_name || ''}
                      onChange={(e) => setSelectedCustomer({...selectedCustomer, name: e.target.value})}
                      className="admin-form-input"
                      placeholder="Enter customer name"
                    />
                  </div>
                  
                  <div className="admin-form-group">
                    <label className="admin-form-label">Email Address</label>
                    <input
                      type="email"
                      value={selectedCustomer.email || ''}
                      onChange={(e) => setSelectedCustomer({...selectedCustomer, email: e.target.value})}
                      className="admin-form-input"
                      placeholder="Enter email address"
                    />
                  </div>
                  
                  <div className="admin-form-group">
                    <label className="admin-form-label">Phone Number</label>
                    <input
                      type="tel"
                      value={selectedCustomer.phone || selectedCustomer.phone_number || ''}
                      onChange={(e) => setSelectedCustomer({...selectedCustomer, phone: e.target.value})}
                      className="admin-form-input"
                      placeholder="Enter phone number"
                    />
                  </div>
                  
                  <div className="admin-form-group">
                    <label className="admin-form-label">Account Status</label>
                    <select
                      value={selectedCustomer.is_active !== false ? 'active' : 'inactive'}
                      onChange={(e) => setSelectedCustomer({...selectedCustomer, is_active: e.target.value === 'active'})}
                      className="admin-form-input"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
                
                {/* address information */}
                <div className="admin-form-group">
                  <label className="admin-form-label">Address Information</label>
                  <textarea
                    value={selectedCustomer.address || ''}
                    onChange={(e) => setSelectedCustomer({...selectedCustomer, address: e.target.value})}
                    className="admin-form-textarea"
                    placeholder="Enter customer address..."
                    rows={3}
                  />
                </div>
                
                {/* Form Button */}
                <div className="admin-form-actions">
                  <button type="button" className="admin-btn-secondary" onClick={closeEditModal}>
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="admin-btn-primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Updating...' : 'Update Customer'}
                  </button>
                  <button 
                    type="button" 
                    className="admin-btn-danger"
                    onClick={() => handleDeleteCustomer(selectedCustomer.id)}
                    disabled={isSubmitting}
                  >
                    Delete Customer
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminCustomerManagement; 