const express = require('express');
const route = express.Router();
const Order = require("../../model/order");
const mongoose = require('mongoose');
const checkAuth = require("../middleware/checkAuth");

// GET all orders for logged in user
route.get("/",checkAuth, async (req, res, next) => {
  try {
    if (req.userData.role === "admin") {
      // Admin gets all orders grouped by user
      const orders = await Order.find()
        .populate("products.productId")
        .populate("user", "email")
        .sort({ createdAt: -1 });

      // Group by user email
      const groupedOrders = orders.reduce((acc, order) => {
        const userEmail = order.user?.email || "Unknown User";
        if (!acc[userEmail]) {
          acc[userEmail] = [];
        }
        acc[userEmail].push(order);
        return acc;
      }, {});

      return res.status(200).json(groupedOrders);
    } else {
      // Regular user gets only their own orders
      const orders = await Order.find({ user: req.userData.userId })
        .populate("products.productId")
        .sort({ createdAt: -1 });

      return res.status(200).json(orders);
    }
  } catch (err) {
    next(err);
  }
});
// POST new order (logged in user only)
route.post('/', checkAuth, async (req, res, next) => {
  try {
    const order = new Order({
      ...req.body,
      user: req.userData.userId // tie order to logged-in user
    });

    const savedOrder = await order.save();
    res.status(201).json({
      message: 'Order placed successfully',
      order: savedOrder,
    });
  } catch (err) {
    if (err.code === 11000 && err.keyPattern && err.keyPattern.uniqueOrderHash) {
      err.status = 409; // Conflict
      err.message = 'Duplicate order detected.';
    } else if (err.name === 'ValidationError') {
      err.status = 400;
    }
    next(err);
  }
});

// GET single order (must belong to logged in user)
route.get('/:id', checkAuth, async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid order ID format.' });
  }

  try {
    const order = await Order.findOne({ _id: id, user: req.userData.userId })
                             .populate('products.productId');

    if (!order) {
      return res.status(404).json({ message: 'Order not found or not yours.' });
    }

    res.status(200).json(order);
  } catch (err) {
    next(err);
  }
});

// PATCH update order (must belong to logged in user)
route.patch('/:id', checkAuth, async (req, res, next) => {
  const { id } = req.params;
  const updates = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid order ID format.' });
  }

  try {
    const updatedOrder = await Order.findOneAndUpdate(
      { _id: id, user: req.userData.userId }, 
      updates, 
      { new: true, runValidators: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: 'Order not found or not yours.' });
    }

    res.status(200).json({
      message: 'Order updated successfully.',
      order: updatedOrder
    });
  } catch (err) {
    next(err);
  }
});

// DELETE order (must belong to logged in user)
// DELETE - Delete order by ID
route.delete("/:id",checkAuth, async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid order ID format." });
  }

  try {
    let order;

    if (req.userData.role === "admin") {
      // Admin can delete any order
      order = await Order.findByIdAndDelete(id);
    } else {
      // User can delete only their own order
      order = await Order.findOneAndDelete({
        _id: id,
        user: req.userData.userId,
      });
    }

    if (!order) {
      return res.status(404).json({ message: "Order not found or not authorized." });
    }

    return res.status(200).json({
      message: "Order deleted successfully.",
      order,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = route;
