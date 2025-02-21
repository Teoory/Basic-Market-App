const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
    isOrderButtonGloballyHidden: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('Setting', settingSchema); 