require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');

const productRoutes = require('./API/routes/products');
const orderRoutes = require('./API/routes/orders');
const userRoutes = require('./API/routes/users');
const cartRoutes = require ('./API/routes/cart')
const app = express();

// Middleware: Logger
app.use(morgan('dev'));

// Middleware: Body parsers
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Middleware: CORS handling
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Content-Type, Accept, Authorization'
  );
  res.header(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, PATCH, DELETE, OPTIONS'
  );
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Routes
app.use('/products', productRoutes);
app.use('/orders', orderRoutes);
app.use('/users',userRoutes);
app.use('/cart', cartRoutes);

// Error handling for unknown routes
app.use((req, res, next) => {
  const error = new Error('Not found');
  error.status = 404; // Fix: status is a property, not a function
  next(error);
});

// General error handler
app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message,
    },
  });
});

module.exports = app;
