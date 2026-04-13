const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    orderNumber: {
        type: String,
        required: true,
        unique: true
    },
    customerName: {
        type: String,
        required: true
    },
    customerPhone: {
        type: String
    },
    tableNumber: {
        type: String
    },
    orderType: {
        type: String,
        enum: ['dine-in', 'takeaway'],
        default: 'dine-in'
    },
    items: [
        {
            name: { type: String, required: true },
            variant: { type: String, default: 'full' },
            quantity: { type: Number, required: true },
            price: { type: Number, required: true }
        }
    ],
    totalAmount: {
        type: Number,
        required: true
    },
    paymentType: {
        type: String,
        enum: ['cash', 'online'],
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['paid', 'pending'],
        default: 'pending'
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
