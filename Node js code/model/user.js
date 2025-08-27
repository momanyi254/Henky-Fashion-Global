const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
  },
  password: { type: String, required: true, minlength: 6 },
  phone: { type: String, trim: true },
  age: { type: Number, min: 16, required: true },
  region: { type: String, required: true },
  country: { type: String, required: true },

  role: { 
    type: String, 
    enum: ['user', 'admin'], 
    default: 'user' 
  },

  createdAt: { type: Date, default: Date.now }
});

// Hash password
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10); 
  next();
});

// Compare password
userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
