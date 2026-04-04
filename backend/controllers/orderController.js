const Order = require('../models/Order');

// @desc Create new order
// @route POST /api/orders
const createOrder = async (req, res, next) => {
    const { amount, paymentType, status } = req.body;

    try {
        const order = await Order.create({
            amount,
            paymentType,
            status: status || 'paid',
            employeeId: req.user._id,
            businessId: req.businessId
        });

        res.status(201).json({ success: true, data: order });
    } catch (error) {
        next(error);
    }
};

// @desc Get today's orders
// @route GET /api/orders/today
const getTodayOrders = async (req, res, next) => {
    try {
        const start = new Date();
        start.setHours(0, 0, 0, 0);

        const end = new Date();
        end.setHours(23, 59, 59, 999);

        const orders = await Order.find({
            businessId: req.businessId,
            createdAt: { $gte: start, $lt: end }
        }).sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: orders.length, data: orders });
    } catch (error) {
        next(error);
    }
};

// @desc Get orders summary
// @route GET /api/orders/summary
const getOrderSummary = async (req, res, next) => {
    try {
        const orders = await Order.find({ businessId: req.businessId });

        let totalSales = 0;
        let totalCash = 0;
        let totalOnline = 0;

        orders.forEach(order => {
            totalSales += order.amount;
            if (order.paymentType === 'cash') totalCash += order.amount;
            if (order.paymentType === 'online') totalOnline += order.amount;
        });

        res.status(200).json({
            success: true,
            data: { totalSales, totalCash, totalOnline }
        });
    } catch (error) {
        next(error);
    }
};

// @desc Get employee activity summary
// @route GET /api/orders/employee-activity
const getEmployeeActivity = async (req, res, next) => {
    try {
        const activity = await Order.aggregate([
            { $match: { businessId: req.businessId } },
            {
                $group: {
                    _id: '$employeeId',
                    totalOrders: { $sum: 1 },
                    totalSales: { $sum: '$amount' }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'employee'
                }
            },
            { $unwind: '$employee' },
            {
                $project: {
                    _id: 0,
                    employeeName: '$employee.name',
                    totalOrders: 1,
                    totalSales: 1
                }
            },
            { $sort: { totalSales: -1 } }
        ]);

        res.status(200).json({ success: true, data: activity });
    } catch (error) {
        next(error);
    }
};

module.exports = { createOrder, getTodayOrders, getOrderSummary, getEmployeeActivity };
