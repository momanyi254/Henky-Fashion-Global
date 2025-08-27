const express = require('express');
const route = express.Router();
const Product = require('../../model/product');
const checkAuth = require('../middleware/checkAuth');   // your JWT middleware
const checkAdmin = require('../middleware/checkAdmin'); // your role middleware

// ✅ POST: Add a new product (Admin only)
route.post('/', checkAuth, checkAdmin, async (req, res, next) => {
  try {
    if (Array.isArray(req.body)) {
      const savedProducts = await Product.insertMany(req.body, { ordered: false });
      return res.status(201).json({
        message: `✅ ${savedProducts.length} products created successfully.`,
        products: savedProducts,
      });
    } else {
      const product = new Product(req.body);
      const savedProduct = await product.save();
      return res.status(201).json({
        message: '✅ Product created successfully',
        product: savedProduct,
      });
    }
  } catch (err) {
    if (err.code === 11000) {
      err.status = 409;
    } else if (err.name === 'ValidationError') {
      err.status = 400;
    }
    next(err);
  }
});

// ✅ GET: Public (all users)
route.get('/', async (req, res, next) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    next(error);
  }
});

// ✅ GET by ID (Public)
route.get('/:id', async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: '❌ Product not found' });
    }
    res.status(200).json(product);
  } catch (error) {
    next(error);
  }
});

// ✅ GET by Category (Public)
route.get('/category/:categoryName', async (req, res, next) => {
  try {
    const category = req.params.categoryName;
    const allowedCategories = ["Kids Clothes", "Maternity Wear", "Men Vests"];
    if (!allowedCategories.includes(category)) {
      return res.status(400).json({ message: "❌ Invalid category." });
    }
    const products = await Product.find({ category }).exec();
    if (!products.length) {
      return res.status(404).json({ message: "❌ No products found in this category." });
    }
    res.status(200).json({ count: products.length, products });
  } catch (error) {
    next(error);
  }
});

// ✅ PATCH: Update product (Admin only)
route.patch('/:id', checkAuth, checkAdmin, async (req, res, next) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!updatedProduct) {
      return res.status(404).json({ message: '❌ Product not found' });
    }
    res.status(200).json({ message: '✅ Product updated successfully', product: updatedProduct });
  } catch (error) {
    if (error.name === 'CastError') {
      error.status = 400;
      error.message = 'Invalid product ID format';
    }
    next(error);
  }
});

// ✅ DELETE all (Admin only)
route.delete('/', checkAuth, checkAdmin, async (req, res, next) => {
  try {
    const result = await Product.deleteMany({});
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: '❌ No products found to delete' });
    }
    res.status(200).json({ message: `🗑️ Successfully deleted ${result.deletedCount} product(s)` });
  } catch (error) {
    next(error);
  }
});

// ✅ DELETE by ID (Admin only)
route.delete('/:id', checkAuth, checkAdmin, async (req, res, next) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) {
      return res.status(404).json({ message: '❌ Product not found' });
    }
    res.status(200).json({ message: '🗑️ Product deleted successfully', product: deletedProduct });
  } catch (error) {
    next(error);
  }
});

module.exports = route;
