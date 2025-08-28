import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./cart.css";

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // Fetch cart
  const fetchCart = async () => {
    if (!token) return navigate("/login");

    try {
      const res = await fetch(`http://localhost:3000/cart?ts=${Date.now()}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store"
      });
      const data = await res.json();
      setCartItems(data.items || []);
    } catch (err) {
      console.error("Failed to fetch cart:", err);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const clearCart = async () => {
    if (!window.confirm("Clear all items from cart?")) return;
    await fetch("http://localhost:3000/cart/clear", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    setCartItems([]);
  };

  const makePayment = async () => {
    if (cartItems.length === 0) return alert("Your cart is empty!");
    if (!customerName || !customerEmail || !shippingAddress) return alert("Fill all shipping details!");

    const products = cartItems.map(item => ({ productId: item.productId._id, quantity: item.quantity }));
    const totalPrice = cartItems.reduce((sum, item) => sum + item.productId.price * item.quantity, 0);

    try {
      const res = await fetch("http://localhost:3000/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ customerName, customerEmail, shippingAddress, products, totalPrice }),
      });
      const data = await res.json();
      if (!res.ok) return alert(data.message || "Payment failed");

      await fetch("http://localhost:3000/cart/clear", { method: "POST", headers: { Authorization: `Bearer ${token}` }});
      setCartItems([]);
      alert("Payment successful!");
      navigate("/orders");
    } catch (err) {
      console.error(err);
      alert("Payment failed: " + err.message);
    }
  };

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce((sum, item) => sum + item.productId.price * item.quantity, 0);

  return (
    <div className="signup-container">
      <div className="signup-form cart-form">
        <h2>My Cart</h2>
        {cartItems.length === 0 ? (
          <p className="empty-cart">Your cart is empty.</p>
        ) : (
          <>
            <ul className="cart-items-list">
              {cartItems.map(item => (
                <li key={item.productId._id} className="cart-item">
                  <img src={item.productId.images?.[0] || "/placeholder.jpg"} alt={item.productId.name} className="cart-item-image" />
                  <div className="cart-item-details">
                    <h4>{item.productId.name}</h4>
                    <p>Price: ${item.productId.price.toFixed(2)}</p>
                    <p>Quantity: {item.quantity}</p>
                    <p>Subtotal: ${(item.productId.price * item.quantity).toFixed(2)}</p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="cart-summary">
              <p><strong>Total Items:</strong> {totalItems}</p>
              <p><strong>Total Price:</strong> ${totalPrice.toFixed(2)}</p>
              <h3>Shipping Info</h3>
              <input type="text" placeholder="Full Name" value={customerName} onChange={e => setCustomerName(e.target.value)} />
              <input type="email" placeholder="Email" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} />
              <textarea placeholder="Shipping Address" value={shippingAddress} onChange={e => setShippingAddress(e.target.value)} />
              <button className="payment-btn" onClick={makePayment}>Make Payment</button>
              <button className="clear-cart-btn" onClick={clearCart}>Clear Cart</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Cart;
