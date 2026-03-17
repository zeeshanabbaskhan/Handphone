const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
        trim: true,
        select: false,
    },
    phone: {
        type: String,
        trim: true,
    },
    profileImg: {
        type: String,
        trim: true,
        default: 'https://res.cloudinary.com/demo/image/upload/d_avatar.png/non_existing_id.png'
    },
    role: {
        type: String,
        enum: ['admin', 'customer'],
        default: 'customer',
    },
    // Customer-specific fields
    status: {
        type: String,
        enum: ['active', 'inactive', 'new'],
        default: 'new',
    },
    segment: {
        type: String,
        enum: ['vip', 'loyal', 'regular', 'new'],
        default: 'new',
    },

    totalOrders: {
        type: Number,
        default: 0,
    },
    totalSpent: {
        type: Number,
        default: 0,
    },
    averageOrderValue: {
        type: Number,
        default: 0,
    },

    address: {
        location: {
            type: String,
            trim: true,
        },
        city: {
            type: String,
            trim: true,
        },
        state: {
            type: String,
            trim: true,
        },
        zipCode: {
            type: String,
            trim: true,
        },
        country: {
            type: String,
            trim: true,
        },
        createdAt: {
            type: Date,
            default: Date.now,
        }

    },


}, {
    timestamps: true,
});

// Pre-save middleware for password hashing
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) { return next(); }

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        console.error(err);
        next(err);
    }
});

// Method to calculate average order value
userSchema.methods.updateAverageOrderValue = function () {
    if (this.totalOrders > 0) {
        this.averageOrderValue = this.totalSpent / this.totalOrders;
    } else {
        this.averageOrderValue = 0;
    }
};

const User = mongoose.models.User || mongoose.model('User', userSchema);
module.exports = User;