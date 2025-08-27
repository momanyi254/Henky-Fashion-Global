import React, { useEffect, useState } from "react";
import "./orders.css";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("http://localhost:3000/orders", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (!res.ok) return alert(data.message || "Failed to fetch orders");

        // Flatten for admin object or keep array for normal users
        if (Array.isArray(data)) setOrders(data);
        else if (typeof data === "object") setOrders(Object.values(data).flat());
      } catch (err) {
        console.error(err);
        alert("Error fetching orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [token]);

  if (loading) return <p className="loading">Loading orders...</p>;

  return (
    <div className="orders-page">
      <h2>My Orders</h2>
      {orders.length === 0 ? (
        <p>No orders yet.</p>
      ) : (
        orders.map((order) => (
          <div key={order._id} className="order-card">
            <div className="order-header">
              <p><strong>Order ID:</strong> {order._id}</p>
              <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleString()}</p>
              <p><strong>Status:</strong> {order.status}</p>
              <p><strong>Total Price:</strong> ${order.totalPrice.toFixed(2)}</p>
            </div>
            <ul className="order-items">
              {order.products.map((item, idx) => (
                <li key={idx} className="order-item">
                  {item.productId
                    ? `${item.productId.name} x ${item.quantity} - $${item.productId.price.toFixed(2)}`
                    : `Product removed x ${item.quantity}`}
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
    </div>
  );
}

export default Orders;
