const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['employee', 'manager', 'owner', 'admin'],
        default: 'owner'
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'deactivated'],
        default: 'approved'
    },
    businessId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Business',
        index: true
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
