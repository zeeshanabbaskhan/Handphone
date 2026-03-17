const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },

  category: {
    type: String,
    required: true,
    enum: [
      'Computer',
      'Laptop',
      'Smartphone',
      'Smart Watch',
      'Earbuds',
      'Desktop',
      'TV',
      'Tablet',
      'Gaming Console',
      'Headphones',
      'Speaker',
      'Camera',
      'Monitor',
      'Keyboard',
      'Mouse',
      'Accessories'
    ]
  },

  // Pricing
  price: {
    type: Number,
    required: true,
    min: 0
  },

  originalPrice: {
    type: Number,
    min: 0,
    default: null
  },

  discount: {
    type: Number,
    min: 0,
    max: 100,
    default: null
  },

  // Inventory
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },

  sku: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },

  // Product Details
  description: {
    type: String,
    maxlength: 2000
  },

  shortDescription: {
    type: String,
    maxlength: 500
  },

  brand: {
    type: String,
    trim: true,
    maxlength: 100
  },

  weight: {
    type: String,
    trim: true
  },

  dimensions: {
    type: String,
    trim: true
  },

  // Product Status Flags
  isHot: {
    type: Boolean,
    default: false
  },

  isTrending: {
    type: Boolean,
    default: false
  },

  isNew: {
    type: Boolean,
    default: false
  },

  isFeatured: {
    type: Boolean,
    default: false
  },

  // Product Status
  status: {
    type: String,
    enum: ['active', 'inactive', 'out_of_stock', 'low_stock',],
    default: 'active'
  },

  // Images
  images: [{

    url: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    isPrimary: {
      type: Boolean,
      default: false
    },

  }],

  // Primary image for quick access
  image: {
    type: String,
    default: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300'
  },

  // Tags
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],

  // Specifications
  specifications: [{
    key: {
      type: String,
      required: true,
      trim: true
    },
    value: {
      type: String,
      required: true,
      trim: true
    }
  }],


  sales: {
    type: Number,
    min: 0,
    default: 0
  },

  // SEO & Marketing
  metaTitle: {
    type: String,
    maxlength: 160
  },

  metaDescription: {
    type: String,
    maxlength: 320
  },

  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true
  },



}, {
  timestamps: true, // Adds createdAt and updatedAt automatically
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, status: 1 });
productSchema.index({ price: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ sales: -1 });
productSchema.index({ rating: -1 });
productSchema.index({ sku: 1 });
productSchema.index({ slug: 1 });

// Virtual for calculating final price with discount
productSchema.virtual('finalPrice').get(function () {
  if (this.discount && this.originalPrice) {
    return this.originalPrice - (this.originalPrice * this.discount / 100);
  }
  return this.price;
});

// Virtual for stock status
productSchema.virtual('stockStatus').get(function () {
  if (this.stock === 0) return 'out_of_stock';
  if (this.stock <= 5) return 'low_stock';
  return 'in_stock';
});

// Virtual for discount amount
productSchema.virtual('discountAmount').get(function () {
  if (this.discount && this.originalPrice) {
    return this.originalPrice * this.discount / 100;
  }
  return 0;
});

// Pre-save middleware to auto-generate SKU if not provided
productSchema.pre('save', function (next) {
  if (!this.sku && this.name && this.category) {
    const nameCode = this.name.substring(0, 3).toUpperCase();
    const categoryCode = this.category.substring(0, 2).toUpperCase();
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.sku = `${nameCode}-${categoryCode}-${randomNum}`;
  }

  // Auto-generate slug from name
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  // Set primary image
  if (this.images && this.images.length > 0) {
    const primaryImage = this.images.find(img => img.isPrimary);
    if (primaryImage) {
      this.image = primaryImage.url;
    } else {
      this.image = this.images[0].url;
      this.images[0].isPrimary = true;
    }
  }

  // Auto-set status based on stock
  if (this.stock === 0) {
    this.status = 'out_of_stock';
  } else if (this.stock <= 5) {
    this.status = 'low_stock';
  } else if (this.status === 'out_of_stock' || this.status === 'low_stock') {
    this.status = 'active';
  }

  next();
});

// Pre-save middleware to ensure only one primary image
productSchema.pre('save', function (next) {
  if (this.images && this.images.length > 0) {
    let primaryCount = 0;
    let primaryIndex = -1;

    this.images.forEach((img, index) => {
      if (img.isPrimary) {
        primaryCount++;
        primaryIndex = index;
      }
    });

    // If no primary image, set first as primary
    if (primaryCount === 0) {
      this.images[0].isPrimary = true;
    }

    // If multiple primary images, keep only the first one
    if (primaryCount > 1) {
      this.images.forEach((img, index) => {
        img.isPrimary = index === primaryIndex;
      });
    }
  }

  next();
});

// Static methods
productSchema.statics.findByCategory = function (category) {
  return this.find({ category, status: 'active' });
};

productSchema.statics.findFeatured = function () {
  return this.find({ isFeatured: true, status: 'active' });
};

productSchema.statics.findLowStock = function () {
  return this.find({ stock: { $lte: 5 }, status: { $ne: 'out_of_stock' } });
};

// Instance methods
productSchema.methods.updateStock = function (quantity) {
  this.stock += quantity;
  if (this.stock < 0) this.stock = 0;
  return this.save();
};

productSchema.methods.addRating = function (rating) {
  const totalScore = this.rating * this.totalRatings + rating;
  this.totalRatings += 1;
  this.rating = totalScore / this.totalRatings;
  return this.save();
};

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

module.exports = Product;