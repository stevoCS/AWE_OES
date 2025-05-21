import React from "react";
import { Link } from "react-router-dom";

function Header() {
  return (
    <header>
      <h1>AWE Electronics Store</h1>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/login">Login</Link>
        <Link to="/register">Register</Link>
        <Link to="/cart">Cart</Link>
        <Link to="/order">Order</Link>
      </nav>
    </header>
  );
}

export default Header;
