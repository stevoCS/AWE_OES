import React from 'react';

const products = [
  { name: "Wireless Headphones", category: "Audio", brand: "SoundWave", price: "$199", quantity: 50 },
  { name: "Smart TV 55\"", category: "TVs", brand: "VisionMax", price: "$799", quantity: 20 },
  { name: "Laptop Pro 15\"", category: "Computers", brand: "TechPro", price: "$1499", quantity: 15 },
  { name: "Smartphone X", category: "Mobile", brand: "MobileX", price: "$899", quantity: 30 },
  { name: "Gaming Mouse", category: "Accessories", brand: "GameGear", price: "$79", quantity: 100 },
  { name: "Bluetooth Speaker", category: "Audio", brand: "SoundWave", price: "$129", quantity: 75 },
  { name: "Smartwatch", category: "Wearables", brand: "TechPro", price: "$249", quantity: 40 },
  { name: "Tablet 10\"", category: "Tablets", brand: "TabTech", price: "$349", quantity: 60 },
  { name: "Keyboard", category: "Accessories", brand: "KeyTech", price: "$59", quantity: 120 },
  { name: "Monitor 27\"", category: "Monitors", brand: "VisionMax", price: "$299", quantity: 25 },
];

export default function AdminPanel() {
  return (
    <div>
      {/* Header */}
      <header>
        <h1>AWE Electronics</h1>
        <nav>
          <a href="#">New Arrivals</a> | <a href="#">Best Sellers</a>
        </nav>
        <div>
          <input type="text" placeholder="Search" />
          <span>[Cart Icon]</span>
        </div>
      </header>

      <div style={{ display: 'flex' }}>
        {/* Sidebar */}
        <aside>
          <h2>Admin Panel</h2>
          <ul>
            <li><a href="#">Dashboard</a></li>
            <li><strong>Products</strong></li>
            <li><a href="#">Orders</a></li>
          </ul>
        </aside>

        {/* Main Content */}
        <main>
          <h2>Products</h2>

          {/* Controls */}
          <div>
            <input type="text" placeholder="Search products" />
            <select>
              <option>Category</option>
            </select>
            <select>
              <option>Brand</option>
            </select>
            <select>
              <option>Price</option>
            </select>
            <button>Add Product</button>
          </div>

          {/* Product Table */}
          <table border="1">
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
              {products.map((p, i) => (
                <tr key={i}>
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
        </main>
      </div>

      {/* Footer */}
      <footer>
        <p>
          <a href="#">About Us</a> | <a href="#">Customer Support</a> | <a href="#">Terms of Service</a>
        </p>
        <p>© 2025 AWE Electronics. All rights reserved.</p>
      </footer>
    </div>
  );
}
