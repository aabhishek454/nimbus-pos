const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
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
    },
    checkInTime: {
        type: Date,
        required: true,
        default: Date.now
    },
    checkOutTime: {
        type: Date,
        default: null
    },
    totalHours: {
        type: Number,
        default: 0
    },
    date: {
        type: String, // YYYY-MM-DD for easy grouping
        required: true
    }
}, { timestamps: true });

attendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
