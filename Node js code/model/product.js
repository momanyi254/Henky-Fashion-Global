const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: ["Kids Clothes", "Maternity Wear", "Men Vests"],
    },
    size: {
      type: [String],
      default: [],
      validate: {
        validator: arr => arr.every(s => typeof s === "string"),
        message: "Sizes must be an array of strings",
      },
    },
    ageRange: {
      type: String,
      trim: true,
      maxlength: [50, "Age range cannot exceed 50 characters"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    stock: {
      type: Number,
      default: 0,
      min: [0, "Stock cannot be negative"],
    },
    images: {
      type: [String],
      default: [],
      validate: {
        validator: arr => arr.every(url => /^https?:\/\/.+\.(jpg|jpeg|png|webp|avif)$/i.test(url)),
        message: "Each image must be a valid URL ending with .jpg, .jpeg, .png, .webp, or .avif",
      },
    },
    brand: {
      type: String,
      trim: true,
      maxlength: [50, "Brand cannot exceed 50 characters"],
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // Adds createdAt & updatedAt automatically
    versionKey: false, // Removes __v from responses
  }
);

// ✅ Unique index to prevent duplicate products in same category
productSchema.index({ name: 1, category: 1 }, { unique: true });

module.exports = mongoose.model("Product", productSchema);
