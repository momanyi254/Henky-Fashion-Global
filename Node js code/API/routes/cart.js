const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/checkAuth');
const Cart = require('../../model/cart');
const Product = require('../../model/product');

// =========================
// GET current user's cart
// =========================
router.get('/', checkAuth, async (req, res) => {
  res.set('Cache-Control', 'no-store'); // prevent browser caching
  try {
    let cart = await Cart.findOne({ user: req.userData.userId }).populate('items.productId');
    if (!cart) {
      cart = new Cart({ user: req.userData.userId, items: [] });
      await cart.save();
    }
    res.status(200).json(cart);
  } catch (err) {
    res.status(500).json({ message: 'Server error', err });
  }
});

// =========================
// ADD product to cart
// =========================
router.post('/add', checkAuth, async (req, res) => {
  res.set('Cache-Control', 'no-store');
  const { productId, quantity = 1 } = req.body;

  try {
    const product = await Product.findById(productId);
    if (!product || product.stock < quantity) {
      return res.status(400).json({ message: 'Product not available in requested quantity' });
    }

    let cart = await Cart.findOne({ user: req.userData.userId });
    if (!cart) cart = new Cart({ user: req.userData.userId, items: [] });

    const existingItem = cart.items.find(item => item.productId.toString() === productId);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ productId, quantity });
    }

    product.stock -= quantity;
    await product.save();
    await cart.save();

    res.status(200).json({ message: 'Added to cart', cart });
  } catch (err) {
    res.status(500).json({ message: 'Server error', err });
  }
});

// =========================
// REMOVE product from cart
// =========================
router.post('/remove', checkAuth, async (req, res) => {
  res.set('Cache-Control', 'no-store');
  const { productId, quantity = 1 } = req.body;

  try {
    const cart = await Cart.findOne({ user: req.userData.userId });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
    if (itemIndex === -1) return res.status(404).json({ message: 'Item not in cart' });

    const item = cart.items[itemIndex];
    const product = await Product.findById(productId);

    item.quantity -= quantity;
    if (item.quantity <= 0) cart.items.splice(itemIndex, 1);

    if (product) {
      product.stock += quantity; // restore stock
      await product.save();
    }

    await cart.save();
    res.status(200).json({ message: 'Removed from cart', cart });
  } catch (err) {
    res.status(500).json({ message: 'Server error', err });
  }
});

// =========================
// CLEAR cart
// =========================
router.post('/clear', checkAuth, async (req, res) => {
  res.set('Cache-Control', 'no-store');
  try {
    const cart = await Cart.findOne({ user: req.userData.userId });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    for (const item of cart.items) {
      const product = await Product.findById(item.productId);
      if (product) {
        product.stock += item.quantity;
        await product.save();
      }
    }

    cart.items = [];
    await cart.save();
    res.status(200).json({ message: 'Cart cleared', cart });
  } catch (err) {
    res.status(500).json({ message: 'Server error', err });
  }
});

module.exports = router;
