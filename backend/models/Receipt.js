const mongoose = require('mongoose');

const receiptSchema = new mongoose.Schema({
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true,
        unique: true
    },
    pdfUrl: {
        type: String,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Receipt', receiptSchema);
