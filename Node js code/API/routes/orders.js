const express = require('express');
const route = express.Router();
const Order = require("../../model/order");
const mongoose = require('mongoose');
const checkAuth = require("../middleware/checkAuth");

// import Product model
const Product = require("../../model/product");

route.post("/", checkAuth, async (req, res, next) => {
  try {
    const { products, totalPrice } = req.body;

    if (!products || products.length === 0) {
      return res.status(400).json({ message: "No products in order." });
    }

    const newOrder = new Order({
      user: req.userData.userId,
      products,
      totalPrice,
    });

    const savedOrder = await newOrder.save();

    res.status(201).json({
      message: "Order placed successfully.",
      order: savedOrder,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @route GET /orders
 * @desc Get orders for logged in user (or all orders if admin)
 */
route.get("/", checkAuth, async (req, res, next) => {
  try {
    let orders;

    if (req.userData.role === "admin") {
      orders = await Order.find()
        .populate("user", "email")
        .populate("products.productId", "name price");
    } else {
      orders = await Order.find({ user: req.userData.userId })
        .populate("products.productId", "name price");
    }

    res.json(orders);
  } catch (err) {
    next(err);
  }
});

/**
 * @route PATCH /orders/:id/status
 * @desc Admin updates order status
 */
route.patch("/:id/status", checkAuth, async (req, res, next) => {
  try {
    if (req.userData.role !== "admin") {
      return res.status(403).json({ message: "Not authorized." });
    }

    const { status } = req.body;

    if (!["Pending", "Processing", "Shipped", "Delivered", "Cancelled"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value." });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!order) return res.status(404).json({ message: "Order not found." });

    res.json({ message: "Order status updated.", order });
  } catch (err) {
    next(err);
  }
});

/**
 * @route PATCH /orders/:id/cancel
 * @desc User cancels their own order (only if still Pending)
 */
route.patch("/:id/cancel", checkAuth, async (req, res, next) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.userData.userId,
    }).populate("products.productId");

    if (!order) return res.status(404).json({ message: "Order not found." });

    if (order.status !== "Pending") {
      return res.status(400).json({ message: "Only pending orders can be cancelled." });
    }

    // restore stock for each product in the cancelled order
    for (const item of order.products) {
      if (item.productId) {
        await Product.findByIdAndUpdate(
          item.productId._id,
          { $inc: { stock: item.quantity } }
        );
      }
    }

    order.status = "Cancelled";
    await order.save();

    res.json({ message: "Order cancelled successfully. Stock restored.", order });
  } catch (err) {
    next(err);
  }
});

module.exports = route;
