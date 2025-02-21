const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    discountPercentage: {
        type: Number,
        default: 0
    },
    originalPrice: {
        type: Number
    },
    stock: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['normal', 'car'],
        default: 'normal'
    },
    images: [{
        url: String,
        order: Number
    }],
    viewCount: {
        type: Number,
        default: 0
    },
    isHidden: {
        type: Boolean,
        default: false
    },
    isOrderButtonHidden: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Product', ProductSchema); 