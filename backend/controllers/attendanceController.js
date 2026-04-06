const Attendance = require('../models/Attendance');

// @desc Employee check-in
// @route POST /api/attendance/check-in
const checkIn = async (req, res, next) => {
    try {
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        
        const existing = await Attendance.findOne({
            employeeId: req.user._id,
            date: today
        });

        if (existing) {
            return res.status(400).json({ success: false, error: 'Already checked in today' });
        }

        const record = await Attendance.create({
            employeeId: req.user._id,
            businessId: req.businessId,
            checkInTime: new Date(),
            date: today
        });

        res.status(201).json({ success: true, data: record });
    } catch (error) {
        next(error);
    }
};

// @desc Employee check-out
// @route POST /api/attendance/check-out
const checkOut = async (req, res, next) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        
        const record = await Attendance.findOne({
            employeeId: req.user._id,
            date: today
        });

        if (!record) {
            return res.status(400).json({ success: false, error: 'You haven\'t checked in today' });
        }

        if (record.checkOutTime) {
            return res.status(400).json({ success: false, error: 'Already checked out today' });
        }

        record.checkOutTime = new Date();
        const diffMs = record.checkOutTime - record.checkInTime;
        record.totalHours = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));
        await record.save();

        res.status(200).json({ success: true, data: record });
    } catch (error) {
        next(error);
    }
};

// @desc Get my attendance status today
// @route GET /api/attendance/my-status
const getMyStatus = async (req, res, next) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const record = await Attendance.findOne({
            employeeId: req.user._id,
            date: today
        });

        res.status(200).json({
            success: true,
            data: record || { checkedIn: false, checkedOut: false }
        });
    } catch (error) {
        next(error);
    }
};

// @desc Get attendance for all employees (owner view)
// @route GET /api/attendance
const getAttendance = async (req, res, next) => {
    try {
        const { dateFilter } = req.query;
        let filter = { businessId: req.businessId };

        if (dateFilter === 'today') {
            filter.date = new Date().toISOString().split('T')[0];
        } else if (dateFilter === '7days') {
            const start = new Date();
            start.setDate(start.getDate() - 7);
            filter.date = { $gte: start.toISOString().split('T')[0] };
        }

        const records = await Attendance.find(filter)
            .populate('employeeId', 'name email')
            .sort({ date: -1, checkInTime: -1 });

        res.status(200).json({ success: true, data: records });
    } catch (error) {
        next(error);
    }
};

module.exports = { checkIn, checkOut, getMyStatus, getAttendance };
