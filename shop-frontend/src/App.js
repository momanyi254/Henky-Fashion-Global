import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";
import Signup from "./Signup";
import Login from "./Login";
import Products from "./Products";
import Orders from "./Orders";
import Cart from "./Cart";
import "./App.css";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    setToken(null);
    setUser(null);
  };

  return (
    <Router>
      <div className="app-container">
        {/* Header */}
        <header className="app-header">
          <div className="header-left">
            <img src="/logo.jpg" alt="Company Logo" className="header-logo" />
            <h1 className="header-title">Henky Fashion Global</h1>
          </div>

          <nav className="header-nav">
            <ul>
              {!token ? (
                <>
                  <li><Link to="/">Home</Link></li>
                  <li><Link to="/signup">Signup</Link></li>
                  <li><Link to="/login">Login</Link></li>
                </>
              ) : (
                <>
                  <li className="welcome-text">Welcome, {user?.firstName}</li>
                  <li><Link to="/orders">My Orders</Link></li>
                  <li><Link to="/products">Products</Link></li>
                  <li><Link to="/cart">Cart</Link></li>
                  <li>
                    <button className="logout-btn" onClick={handleLogout}>
                      Logout
                    </button>
                  </li>
                </>
              )}
            </ul>
          </nav>
        </header>

        {/* Main */}
        <main className="app-main">
          <Routes>
            <Route path="/" element={!token ? <h2>Welcome!</h2> : <Navigate to="/orders" />} />
            <Route path="/signup" element={!token ? <Signup /> : <Navigate to="/orders" />} />
            <Route
              path="/login"
              element={
                !token ? <Login setToken={setToken} setUser={setUser} /> : <Navigate to="/orders" />
              }
            />

            <Route path="/products" element={token ? <Products /> : <Navigate to="/login" />} />
            <Route path="/orders" element={token ? <Orders /> : <Navigate to="/login" />} />
            <Route path="/cart" element={token ? <Cart /> : <Navigate to="/login" />} />

            <Route path="*" element={<h2>404 - Page Not Found</h2>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
