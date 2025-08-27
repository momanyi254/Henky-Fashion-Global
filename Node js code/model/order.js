const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  products: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      quantity: { type: Number, required: true, min: 1 }
    }
  ],
  customerName: { type: String, required: true, trim: true },
  customerEmail: { type: String, required: true, trim: true },
  shippingAddress: { type: String, required: true, trim: true },
  status: { 
    type: String, 
    enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'], 
    default: 'Pending' 
  },
  totalPrice: { type: Number, required: true, min: 0 }
}, {
  timestamps: true // adds createdAt and updatedAt automatically
});

module.exports = mongoose.model('Order', orderSchema);
