const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
    itemName: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        default: 0
    },
    unit: {
        type: String,
        enum: ['kg', 'pcs', 'litre', 'grams', 'dozen', 'units'],
        default: 'pcs'
    },
    lowStockThreshold: {
        type: Number,
        default: 5
    },
    businessId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Business',
        required: true,
        index: true
    }
}, { timestamps: true });

inventorySchema.index({ itemName: 1, businessId: 1 }, { unique: true });

module.exports = mongoose.model('Inventory', inventorySchema);
