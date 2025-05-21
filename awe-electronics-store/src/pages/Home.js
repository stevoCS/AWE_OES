import React from "react";
import ProductCard from "../components/ProductCard";

const products = [
  { id: 1, name: "Laptop", price: 999, image: "/images/laptop.jpg" },
  { id: 2, name: "Smartphone", price: 499, image: "/images/phone.jpg" },
];

function Home() {
  return (
    <div>
      <h1>Welcome to AWE Electronics Store</h1>
      <div className="product-list">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}

export default Home;
