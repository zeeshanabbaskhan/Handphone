const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  productSku: {
    type: String,
    required: true
  },
  productImage: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
 
    quantity: {
    type: Number,
    required: true,
    min: 1
    },
    selectedOptions: {
    type: Object,
    default: {}
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0
    }
}, {
  timestamps: true
});

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: [cartItemSchema],
  subtotal: {
    type: Number,
    default: 0,
    min: 0
  },
  totalItems: {
    type: Number,
    default: 0,
    min: 0
  },
  lastModified: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for cart status
cartSchema.virtual('isEmpty').get(function() {
  return this.items.length === 0;
});

// Virtual for total quantity
cartSchema.virtual('totalQuantity').get(function() {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

// Pre-save middleware to calculate totals
cartSchema.pre('save', function(next) {
  // Calculate subtotal and total items
  this.subtotal = this.items.reduce((total, item) => total + item.totalPrice, 0);
  this.totalItems = this.items.length;
  this.lastModified = new Date();
  
  next();
});

// Instance methods
cartSchema.methods.addItem = function(productData, quantity = 1, selectedOptions = {}   ) {
  const existingItemIndex = this.items.findIndex(item => 
    item.product.toString() === productData._id.toString() &&
    JSON.stringify(item.selectedOptions) === JSON.stringify(selectedOptions)
  );

  if (existingItemIndex > -1) {
    // Update existing item quantity
    this.items[existingItemIndex].quantity += quantity;
    this.items[existingItemIndex].totalPrice = this.items[existingItemIndex].quantity * this.items[existingItemIndex].price;
  } else {
    // Add new item
    const newItem = {
      product: productData._id,
      productName: productData.name,
      productSku: productData.sku,
      productImage: productData.image,
      price: productData.price,
      quantity: quantity,
      selectedOptions: selectedOptions,
      totalPrice: productData.price * quantity
    };
    this.items.push(newItem);
  }

  return this.save();
};

cartSchema.methods.removeItem = function(itemId) {
  this.items = this.items.filter(item => item._id.toString() !== itemId.toString());
  return this.save();
};

cartSchema.methods.updateItemQuantity = function(itemId, newQuantity) {
  if (newQuantity <= 0) {
    return this.removeItem(itemId);
  }

  const item = this.items.find(item => item._id.toString() === itemId.toString());
  if (item) {
    item.quantity = newQuantity;
    item.totalPrice = item.price * newQuantity;
    return this.save();
  }
  
  throw new Error('Item not found in cart');
};

cartSchema.methods.clearCart = function() {
  this.items = [];
  return this.save();
};

// Static methods
cartSchema.statics.findByUser = function(userId) {
  return this.findOne({ user: userId }).populate('items.product');
};

cartSchema.statics.createForUser = function(userId) {
  return this.create({
    user: userId,
    items: [],
    subtotal: 0,
    totalItems: 0
  });
};

const Cart = mongoose.models.Cart || mongoose.model('Cart', cartSchema);

module.exports = Cart;