// Product.jsx (或者 ProductPage.jsx)
import React from 'react';
import ProductCard from '../components/ProductCard'; // 確保路徑正確
import './ProductsPage.css'; // 使用外部 CSS

// 假設圖片導入路徑正確
import laptopImg from '../assets/laptop.png';
import phoneImg from '../assets/Phone.png';
import speakerImg from '../assets/Speaker.png';
import watchImg from '../assets/smartwatch.png';
import mouseImg from '../assets/Wireless mouse.png';
import chargerImg from '../assets/Well charger.png';
import vrImg from '../assets/VR Headset.png';
import keyboardImg from '../assets/Keyboard.png';

// 產品數據 (與您提供的一致)
const products = [
  { id: 1, name: 'UltraBook Pro 15', image: laptopImg, price: 29999, desc: 'Powerful and portable' },
  { id: 2, name: 'Galaxy X50', image: phoneImg, price: 24999, desc: 'Next-gen mobile experience' },
  { id: 3, name: 'SmartHome Speaker', image: speakerImg, price: 3999, desc: 'Immersive home environment' },
  { id: 4, name: 'FitTrack Smartwatch', image: watchImg, price: 5999, desc: 'Track your fitness journey' },
  { id: 5, name: 'Wireless Mouse', image: mouseImg, price: 799, desc: 'Smooth and precise' },
  { id: 6, name: 'Wall Charger', image: chargerImg, price: 499, desc: 'Fast charging' },
  { id: 7, name: 'VR Headset', image: vrImg, price: 8999, desc: 'Immersive VR experience' },
  { id: 8, name: 'Apple Keyboard', image: keyboardImg, price: 2999, desc: 'Sleek and responsive' },
];

const ProductPage = () => {
  const handleAddToCart = (product) => {
    // 實際應用中應有更複雜的購物車邏輯
    alert(`準備將 ${product.name} 加入購物車 (來自 ProductPage)`);
    console.log('Adding to cart from ProductPage:', product);
  };

  return (
    // Header 和 Footer 應該由 App.js 或 Layout 組件提供
    // 這個 div 是此頁面的主要內容容器
    <div className="products-page-main-container"> {/* 更名以區分整體頁面容器和內容容器 */}
      <div className="products-page-content-wrapper">
        <h1 className="products-page-title">所有產品</h1>
        <div className="products-grid">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductPage;