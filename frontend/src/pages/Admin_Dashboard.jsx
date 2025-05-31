import React from 'react';
import './Admin_Dashboard.css';

const products = [
  { name: 'Wireless Headphones', category: 'Audio', brand: 'SoundWave', price: '$199', quantity: 50 },
  { name: 'Smart TV 55"', category: 'TVs', brand: 'VisionMax', price: '$799', quantity: 20 },
  { name: 'Laptop Pro 15"', category: 'Computers', brand: 'TechPro', price: '$1499', quantity: 15 },
  { name: 'Smartphone X', category: 'Mobile', brand: 'MobileX', price: '$899', quantity: 30 },
  { name: 'Gaming Mouse', category: 'Accessories', brand: 'GameGear', price: '$79', quantity: 100 },
  { name: 'Bluetooth Speaker', category: 'Audio', brand: 'SoundWave', price: '$129', quantity: 75 },
  { name: 'Smartwatch', category: 'Wearables', brand: 'TechPro', price: '$249', quantity: 40 },
  { name: 'Tablet 10"', category: 'Tablets', brand: 'TabTech', price: '$349', quantity: 60 },
  { name: 'Keyboard', category: 'Accessories', brand: 'KeyTech', price: '$59', quantity: 120 },
  { name: 'Monitor 27"', category: 'Monitors', brand: 'VisionMax', price: '$299', quantity: 25 },
];

export default function Admin_Dashboard() {
  return (
    <div className="admin-dashboard">
      <header className="top-nav">
        <div className="logo">AWE Electronics</div>
        <nav className="top-links">
          <a href="#">New Arrivals</a>
          <a href="#">Best Sellers</a>
        </nav>
        <div className="top-right">
          <input type="text" placeholder="Search" className="search-input" />
          <span className="cart-icon">🛒</span>
        </div>
      </header>

      <div className="main-container">
        <aside className="sidebar">
          <h3>Admin Dashboard</h3>
          <ul>
            <li><a href="#">Dashboard</a></li>
            <li className="active"><a href="#">Products</a></li>
            <li><a href="#">Orders</a></li>
          </ul>
        </aside>

        <main className="content">
          <div className="content-header">
            <h2>Products</h2>
            <input type="text" placeholder="Search products" />
            <div className="filters">
              <select><option>Category</option></select>
              <select><option>Brand</option></select>
              <select><option>Price</option></select>
            </div>
            <button className="add-product">Add Product</button>
          </div>

          <table className="product-table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Category</th>
                <th>Brand</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p, index) => (
                <tr key={index}>
                  <td>{p.name}</td>
                  <td>{p.category}</td>
                  <td>{p.brand}</td>
                  <td>{p.price}</td>
                  <td>{p.quantity}</td>
                  <td>
                    <a href="#">Edit</a> | <a href="#">Remove</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <footer className="footer">
            <a href="#">About Us</a>
            <a href="#">Customer Support</a>
            <a href="#">Terms of Service</a>
            <p>© 2025 AWE Electronics. All rights reserved.</p>
          </footer>
        </main>
      </div>
    </div>
  );
}
