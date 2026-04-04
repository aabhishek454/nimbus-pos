const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    visits: {
        type: Number,
        default: 1
    },
    totalSpent: {
        type: Number,
        default: 0
    },
    businessId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Business',
        required: true,
        index: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Customer', customerSchema);
