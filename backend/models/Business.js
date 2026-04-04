const mongoose = require('mongoose');

const businessSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    subscriptionStatus: {
        type: String,
        enum: ['trial', 'active', 'expired'],
        default: 'active'
    },
    plan: {
        type: String,
        enum: ['trial', 'pro', 'free'],
        default: 'free'
    }
}, { timestamps: true });

module.exports = mongoose.model('Business', businessSchema);
