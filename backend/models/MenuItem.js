const mongoose = require('mongoose');

const MenuItemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a menu item name'],
        trim: true
    },
    category: {
        type: String,
        trim: true,
        default: 'General'
    },
    variants: [{
        type: {
            type: String, // 'half', 'full', 'custom', 'regular', etc.
            required: true
        },
        price: {
            type: Number,
            required: true,
            min: 0
        }
    }],
    businessId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Business',
        required: true,
        index: true
    }
}, { timestamps: true });

module.exports = mongoose.model('MenuItem', MenuItemSchema);
