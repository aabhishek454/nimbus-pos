const Business = require('../models/Business');
const User = require('../models/User');
const Order = require('../models/Order');

// @desc Get platform-wide statistics for admins
// @route GET /api/admin/stats
const getSystemStats = async (req, res, next) => {
    try {
        const totalBusinesses = await Business.countDocuments();
        const totalUsers = await User.countDocuments();
        const totalOrders = await Order.countDocuments();
        
        // Let's assume some dummy platform revenue based on Pro accounts active (just for show)
        const proBusinesses = await Business.countDocuments({ plan: 'pro' });
        const monthlyRevenue = proBusinesses * 49; // Let's say $49/mo
        
        res.status(200).json({
            success: true,
            data: {
                totalBusinesses,
                totalUsers,
                totalOrders,
                monthlyRevenue
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc Get list of all businesses
// @route GET /api/admin/businesses
const getBusinessesList = async (req, res, next) => {
    try {
        const businesses = await Business.find().populate('ownerId', 'name email').sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            data: businesses
        });
    } catch (error) {
        next(error);
    }
};

const getActivityTracking = async (req, res, next) => {
    try {
        const businessStats = await Order.aggregate([
            {
                $group: {
                    _id: '$businessId',
                    totalOrders: { $sum: 1 },
                    totalRevenue: { $sum: '$amount' }
                }
            },
            {
                $lookup: {
                    from: 'businesses',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'business'
                }
            },
            { $unwind: '$business' },
            {
                $project: {
                    businessName: '$business.name',
                    totalOrders: 1,
                    totalRevenue: 1
                }
            }
        ]);

        const employeeStatsRaw = await Order.aggregate([
            {
                $group: {
                    _id: { employeeId: '$employeeId', businessId: '$businessId' },
                    orderCount: { $sum: 1 },
                    revenueGenerated: { $sum: '$amount' }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id.employeeId',
                    foreignField: '_id',
                    as: 'employee'
                }
            },
            { $unwind: '$employee' },
            {
                $lookup: {
                    from: 'businesses',
                    localField: '_id.businessId',
                    foreignField: '_id',
                    as: 'business'
                }
            },
            { $unwind: '$business' },
            {
                $project: {
                    employeeName: '$employee.name',
                    businessName: '$business.name',
                    orderCount: 1,
                    revenueGenerated: 1
                }
            },
            { $sort: { orderCount: -1 } }
        ]);

        const formattedActivity = employeeStatsRaw.map(stat => 
            `${stat.employeeName} (Employee) created ${stat.orderCount} orders in ${stat.businessName} generating $${stat.revenueGenerated.toFixed(2)}`
        );

        res.status(200).json({
            success: true,
            data: {
                businessPerformance: businessStats,
                employeeActivity: formattedActivity
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { getSystemStats, getBusinessesList, getActivityTracking };
