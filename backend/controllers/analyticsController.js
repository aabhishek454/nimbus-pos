const Order = require('../models/Order');
const Inventory = require('../models/Inventory');

// @desc Get sales trend (grouped by date)
// @route GET /api/analytics/sales-trend
const getSalesTrend = async (req, res, next) => {
    try {
        const { period } = req.query; // 'daily', 'weekly', 'monthly'
        let start = new Date();
        
        if (period === 'weekly') {
            start.setDate(start.getDate() - 7 * 4); // 4 weeks
        } else if (period === 'monthly') {
            start.setMonth(start.getMonth() - 6); // 6 months
        } else {
            start.setDate(start.getDate() - 30); // default: last 30 days
        }

        let groupFormat = "%Y-%m-%d";
        if (period === 'monthly') groupFormat = "%Y-%m";

        const trend = await Order.aggregate([
            { $match: { businessId: req.businessId, createdAt: { $gte: start } } },
            {
                $group: {
                    _id: { $dateToString: { format: groupFormat, date: "$createdAt" } },
                    totalSales: { $sum: '$totalAmount' },
                    totalOrders: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } },
            { $project: { date: '$_id', totalSales: 1, totalOrders: 1, _id: 0 } }
        ]);

        res.status(200).json({ success: true, data: trend });
    } catch (error) {
        next(error);
    }
};

// @desc Get best selling dishes
// @route GET /api/analytics/best-sellers
const getBestSellers = async (req, res, next) => {
    try {
        const bestSellers = await Order.aggregate([
            { $match: { businessId: req.businessId } },
            { $unwind: '$items' },
            {
                $group: {
                    _id: '$items.name',
                    totalQuantity: { $sum: '$items.quantity' },
                    totalRevenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } }
                }
            },
            { $sort: { totalQuantity: -1 } },
            { $limit: 10 },
            { $project: { name: '$_id', totalQuantity: 1, totalRevenue: 1, _id: 0 } }
        ]);

        res.status(200).json({ success: true, data: bestSellers });
    } catch (error) {
        next(error);
    }
};

// @desc Get peak hours
// @route GET /api/analytics/peak-hours
const getPeakHours = async (req, res, next) => {
    try {
        const peakHours = await Order.aggregate([
            { $match: { businessId: req.businessId } },
            {
                $group: {
                    _id: { $hour: '$createdAt' },
                    orderCount: { $sum: 1 },
                    revenue: { $sum: '$totalAmount' }
                }
            },
            { $sort: { orderCount: -1 } },
            { $project: { hour: '$_id', orderCount: 1, revenue: 1, _id: 0 } }
        ]);

        res.status(200).json({ success: true, data: peakHours });
    } catch (error) {
        next(error);
    }
};

// @desc Get AI-generated insights
// @route GET /api/analytics/insights
const getInsights = async (req, res, next) => {
    try {
        const insights = [];

        // 1. Find best selling item
        const bestItem = await Order.aggregate([
            { $match: { businessId: req.businessId } },
            { $unwind: '$items' },
            { $group: { _id: '$items.name', qty: { $sum: '$items.quantity' } } },
            { $sort: { qty: -1 } },
            { $limit: 1 }
        ]);
        if (bestItem.length > 0) {
            insights.push({ type: 'success', icon: '🏆', text: `Top selling item is "${bestItem[0]._id}" with ${bestItem[0].qty} units sold` });
        }

        // 2. Find peak hour
        const peakHour = await Order.aggregate([
            { $match: { businessId: req.businessId } },
            { $group: { _id: { $hour: '$createdAt' }, count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 1 }
        ]);
        if (peakHour.length > 0) {
            const h = peakHour[0]._id;
            const ampm = h >= 12 ? 'PM' : 'AM';
            const h12 = h % 12 || 12;
            insights.push({ type: 'info', icon: '⏰', text: `Peak business hour is ${h12}:00 ${ampm} with ${peakHour[0].count} orders` });
        }

        // 3. Day-wise analysis — find weakest day
        const dayWise = await Order.aggregate([
            { $match: { businessId: req.businessId } },
            { $group: { _id: { $dayOfWeek: '$createdAt' }, total: { $sum: '$totalAmount' }, count: { $sum: 1 } } },
            { $sort: { total: 1 } }
        ]);
        const dayNames = ['', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        if (dayWise.length > 0) {
            const weakest = dayWise[0];
            const strongest = dayWise[dayWise.length - 1];
            insights.push({ type: 'warning', icon: '📉', text: `Sales tend to dip on ${dayNames[weakest._id]}s (avg ${weakest.count} orders)` });
            insights.push({ type: 'success', icon: '📈', text: `${dayNames[strongest._id]}s are your strongest day!` });
        }

        // 4. Low stock warnings
        const lowStock = await Inventory.find({
            businessId: req.businessId,
            $expr: { $lte: ['$quantity', '$lowStockThreshold'] }
        });
        lowStock.forEach(item => {
            insights.push({ type: 'danger', icon: '🚨', text: `Stock alert: "${item.itemName}" is low (${item.quantity} ${item.unit} remaining)` });
        });

        // 5. Revenue trend insight
        const now = new Date();
        const thisWeekStart = new Date(now); thisWeekStart.setDate(now.getDate() - 7);
        const lastWeekStart = new Date(now); lastWeekStart.setDate(now.getDate() - 14);
        
        const [thisWeek] = await Order.aggregate([
            { $match: { businessId: req.businessId, createdAt: { $gte: thisWeekStart } } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);
        const [lastWeek] = await Order.aggregate([
            { $match: { businessId: req.businessId, createdAt: { $gte: lastWeekStart, $lt: thisWeekStart } } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);

        const thisTotal = thisWeek?.total || 0;
        const lastTotal = lastWeek?.total || 0;
        if (lastTotal > 0) {
            const change = ((thisTotal - lastTotal) / lastTotal * 100).toFixed(1);
            if (thisTotal > lastTotal) {
                insights.push({ type: 'success', icon: '🚀', text: `Revenue is up ${change}% compared to last week!` });
            } else {
                insights.push({ type: 'warning', icon: '⚠️', text: `Revenue dropped ${Math.abs(parseFloat(change))}% vs last week` });
            }
        }

        res.status(200).json({ success: true, data: insights });
    } catch (error) {
        next(error);
    }
};

module.exports = { getSalesTrend, getBestSellers, getPeakHours, getInsights };
