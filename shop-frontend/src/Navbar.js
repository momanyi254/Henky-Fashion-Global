import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./navbar.css"; // create simple styles for navbar

function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const cart = JSON.parse(localStorage.getItem("cart")) || [];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    localStorage.removeItem("cart");
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/products" className="nav-logo">
          🛍️ Henry Shop
        </Link>
      </div>

      <div className="navbar-right">
        {user ? (
          <>
            <span className="welcome">Welcome, {user.firstName || user.email}</span>

            <Link to="/cart" className="nav-link">
              🛒 Cart ({cart.length})
            </Link>

            <Link to="/orders" className="nav-link">
              📦 My Orders
            </Link>

            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-link">Login</Link>
            <Link to="/signup" className="nav-link">Signup</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
