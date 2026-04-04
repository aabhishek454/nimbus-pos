const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    amount: {
        type: Number,
        required: true
    },
    paymentType: {
        type: String,
        enum: ['cash', 'online'],
        required: true
    },
    status: {
        type: String,
        enum: ['paid', 'pending'],
        default: 'paid'
    },
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    businessId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Business',
        required: true,
        index: true
    }
}, { timestamps: true });

// Index for getting today's orders fast
orderSchema.index({ createdAt: 1, businessId: 1 });

module.exports = mongoose.model('Order', orderSchema);
