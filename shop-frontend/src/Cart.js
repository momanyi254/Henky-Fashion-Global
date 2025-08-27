import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./cart.css";

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // Fetch cart from backend
  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchCart = async () => {
      try {
        const res = await fetch("http://localhost:3000/cart", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch cart");
        const data = await res.json();
        setCartItems(data.items || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [navigate, token]);

  // Remove item from cart
  const removeFromCart = async (productId) => {
    if (!window.confirm("Remove this item from cart?")) return;
    try {
      const res = await fetch("http://localhost:3000/cart/remove", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ productId, quantity: 1 }),
      });
      const data = await res.json();
      if (!res.ok) return alert(data.message || "Failed to remove item");
      setCartItems(data.cart.items);
    } catch (err) {
      console.error(err);
      alert("Error removing item from cart");
    }
  };

  // Clear cart
  const clearCart = async () => {
    if (!window.confirm("Clear all items from cart?")) return;
    try {
      const res = await fetch("http://localhost:3000/cart/clear", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to clear cart");
      setCartItems([]);
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  // Make payment → create order in backend
  const makePayment = async () => {
    if (cartItems.length === 0) return alert("Your cart is empty!");
    if (!customerName || !customerEmail || !shippingAddress) return alert("Fill all shipping details!");

    const products = cartItems.map(item => ({
      productId: item.productId._id,
      quantity: item.quantity
    }));

    const totalPrice = cartItems.reduce(
      (sum, item) => sum + item.productId.price * item.quantity,
      0
    );

    try {
      const res = await fetch("http://localhost:3000/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ customerName, customerEmail, shippingAddress, products, totalPrice }),
      });

      const data = await res.json();
      if (!res.ok) return alert(data.message || "Payment failed");

      alert("Payment successful! Order created.");
      setCartItems([]);
      navigate("/orders"); // redirect to orders page
    } catch (err) {
      console.error(err);
      alert("Payment failed: " + err.message);
    }
  };

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.productId.price * item.quantity,
    0
  );

  if (loading) return <p className="loading">Loading cart...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="cart-page">
      <h2 className="cart-title">My Cart</h2>

      {cartItems.length === 0 ? (
        <p className="empty-cart">Your cart is empty.</p>
      ) : (
        <div>
          <ul className="cart-items-list">
            {cartItems.map((item) => (
              <li key={item.productId._id} className="cart-item">
                <img
                  src={item.productId.images?.[0] || "/placeholder.jpg"}
                  alt={item.productId.name}
                  className="cart-item-image"
                />
                <div className="cart-item-details">
                  <h4 className="cart-item-name">{item.productId.name}</h4>
                  <p className="cart-item-price">Price: ${item.productId.price.toFixed(2)}</p>
                  <p className="cart-item-quantity">Quantity: {item.quantity}</p>
                  <p className="cart-item-subtotal">
                    Subtotal: ${(item.productId.price * item.quantity).toFixed(2)}
                  </p>
                  <button
                    className="remove-btn"
                    onClick={() => removeFromCart(item.productId._id)}
                  >
                    Remove
                  </button>
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
        </div>
      )}
    </div>
  );
}

export default Cart;
