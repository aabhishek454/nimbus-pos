const Order = require('../models/Order');
const { deductInventory } = require('./inventoryController');
const { sendWhatsAppMessage } = require('../utils/whatsappService');
const crypto = require('crypto');

// @desc Create new order
// @route POST /api/orders
const createOrder = async (req, res, next) => {
    const { customerName, customerPhone, tableNumber, orderType, items, totalAmount, paymentType, paymentStatus } = req.body;

    const orderNumber = 'KOT-' + Math.random().toString(36).substring(2, 6).toUpperCase();
    const shareToken = crypto.randomBytes(32).toString('hex');

    try {
        const order = await Order.create({
            orderNumber,
            shareToken,
            customerName: customerName || 'Walk-in',
            customerPhone,
            tableNumber,
            orderType: orderType || 'dine-in',
            items,
            totalAmount,
            paymentType,
            paymentStatus: paymentStatus || 'pending',
            employeeId: req.user._id,
            businessId: req.businessId
        });

        try {
            await deductInventory(items, req.businessId);
        } catch (invErr) {
            console.log('Inventory deduction skipped:', invErr.message);
        }

        // WhatsApp Hook
        if (customerPhone) {
            const baseUrl = req.protocol + '://' + req.get('host') + '/api';
            const kotUrl = `${baseUrl}/reports/public/slip/${order._id}?token=${shareToken}`;
            const msg = `Hi ${order.customerName},\nYour order (*${orderNumber}*) has been confirmed! We have attached your Order Slip below.`;
            
            // Fire and forget
            sendWhatsAppMessage(customerPhone, msg, kotUrl);
        }

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

// @desc Get all orders (history)
// @route GET /api/orders
const getAllOrders = async (req, res, next) => {
    try {
        const filter = { businessId: req.businessId };
        
        let dateRange = {};
        const now = new Date();
        if (req.query.dateFilter === 'today') {
            const startOfToday = new Date(now.setHours(0, 0, 0, 0));
            dateRange = { $gte: startOfToday };
        } else if (req.query.dateFilter === '7days') {
            const last7Days = new Date(now.setDate(now.getDate() - 7));
            dateRange = { $gte: last7Days };
        } else if (req.query.dateFilter === 'monthly') {
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            dateRange = { $gte: startOfMonth };
        }
        
        if (Object.keys(dateRange).length > 0) {
            filter.createdAt = dateRange;
        }

        const orders = await Order.find(filter)
            .populate('employeeId', 'name')
            .sort({ createdAt: -1 });

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
            totalSales += order.totalAmount;
            if (order.paymentType === 'cash') totalCash += order.totalAmount;
            if (order.paymentType === 'online') totalOnline += order.totalAmount;
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
                    totalSales: { $sum: '$totalAmount' }
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

// @desc Get Date-wise analytics
// @route GET /api/orders/analytics
const getDateWiseAnalytics = async (req, res, next) => {
    try {
        const { filter } = req.query; // 'today', '7days', 'monthly'
        
        let start = new Date();
        if (filter === 'today') {
            start.setHours(0, 0, 0, 0);
        } else if (filter === '7days') {
            start.setDate(start.getDate() - 7);
        } else if (filter === 'monthly') {
            start.setMonth(start.getMonth() - 1);
        } else {
            start.setHours(0, 0, 0, 0); // default to today
        }

        const stats = await Order.aggregate([
            {
                $match: {
                    businessId: req.businessId,
                    createdAt: { $gte: start }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    totalSales: { $sum: '$totalAmount' },
                    totalOrders: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.status(200).json({ success: true, data: stats });
    } catch (error) {
        next(error);
    }
};

// @desc Mark order as paid
// @route PATCH /api/orders/:id/pay
const markPaid = async (req, res, next) => {
    try {
        const order = await Order.findOne({ _id: req.params.id, businessId: req.businessId });
        if (!order) return res.status(404).json({ success: false, error: 'Order not found' });
        
        if (order.paymentStatus === 'paid') {
            return res.status(400).json({ success: false, error: 'Order is already marked as paid' });
        }

        order.paymentStatus = 'paid';
        await order.save();
        
        // WhatsApp Hook
        if (order.customerPhone && order.shareToken) {
            const baseUrl = req.protocol + '://' + req.get('host') + '/api';
            const invoiceUrl = `${baseUrl}/reports/public/invoice/${order._id}?token=${order.shareToken}`;
            const msg = `Payment Successful! Thank you for dining with us.\nYour final Invoice for order *${order.orderNumber || order._id.toString().slice(-6)}* is attached below.`;
            
            sendWhatsAppMessage(order.customerPhone, msg, invoiceUrl);
        }

        res.status(200).json({ success: true, data: order });
    } catch (error) {
        next(error);
    }
};

// @desc Update existing order
// @route PUT /api/orders/:id
const updateOrder = async (req, res, next) => {
    const { items, totalAmount, customerName, customerPhone, tableNumber, orderType } = req.body;

    try {
        const order = await Order.findOne({ _id: req.params.id, businessId: req.businessId });
        if (!order) return res.status(404).json({ success: false, error: 'Order not found' });

        if (order.paymentStatus === 'paid') {
            return res.status(403).json({ success: false, error: 'Cannot modify paid order' });
        }

        order.items = items || order.items;
        order.totalAmount = totalAmount || order.totalAmount;
        if (customerName) order.customerName = customerName;
        if (customerPhone !== undefined) order.customerPhone = customerPhone;
        if (tableNumber !== undefined) order.tableNumber = tableNumber;
        if (orderType) order.orderType = orderType;

        await order.save();
        
        res.status(200).json({ success: true, data: order });
    } catch (error) {
        next(error);
    }
};

// @desc Delete an order
// @route DELETE /api/orders/:id
const deleteOrder = async (req, res, next) => {
    try {
        const order = await Order.findOne({ _id: req.params.id, businessId: req.businessId });
        if (!order) return res.status(404).json({ success: false, error: 'Order not found' });

        if (order.paymentStatus === 'paid') {
            return res.status(403).json({ success: false, error: 'Cannot delete a paid order' });
        }

        await order.deleteOne();
        
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        next(error);
    }
};

module.exports = { createOrder, getTodayOrders, getOrderSummary, getEmployeeActivity, getAllOrders, getDateWiseAnalytics, markPaid, updateOrder, deleteOrder };
