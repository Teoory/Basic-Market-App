const mongoose = require('mongoose');

const SaleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: String,
    values: {
        type: [Number],
        required: true
    },
    profitRate: {
        type: Number,
        required: true
    },
    taxRate: {
        type: Number,
        required: true
    },
    totalCost: {
        type: Number,
        required: true
    },
    profitPrice: {
        type: Number,
        required: true
    },
    tax: {
        type: Number,
        required: true
    },
    finalPrice: {
        type: Number,
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Sale', SaleSchema); 