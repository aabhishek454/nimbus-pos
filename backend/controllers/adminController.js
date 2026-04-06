const Business = require('../models/Business');
const User = require('../models/User');
const Order = require('../models/Order');

const getSystemStats = async (req, res, next) => {
    try {
        const totalBusinesses = await Business.countDocuments();
        const totalUsers = await User.countDocuments();
        const totalOrders = await Order.countDocuments();
        
        const proBusinesses = await Business.countDocuments();
        const monthlyRevenue = proBusinesses * 49; 
        
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

const getPendingOwners = async (req, res, next) => {
    try {
        const pendingOwners = await User.find({ role: 'owner', status: 'pending' }).select('-password').populate('businessId', 'name');
        res.status(200).json({ success: true, data: pendingOwners });
    } catch (error) {
        next(error);
    }
};

const approveOwner = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user || user.role !== 'owner') {
            return res.status(404).json({ success: false, error: 'Owner not found' });
        }
        user.status = 'approved';
        await user.save();
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        next(error);
    }
};

// NEW: Reject (Delete) Pending Owner
const rejectOwner = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user || user.status !== 'pending') {
            return res.status(404).json({ success: false, error: 'Pending owner not found' });
        }
        // If owner created a business object before approval, delete it too
        if (user.businessId) {
            await Business.findByIdAndDelete(user.businessId);
        }
        await User.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        next(error);
    }
};

// NEW: Deactivate Approved Owner
const deactivateOwner = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user || user.role !== 'owner') {
            return res.status(404).json({ success: false, error: 'Owner not found' });
        }
        user.status = 'deactivated';
        await user.save();
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        next(error);
    }
};

// NEW: Delete Approved Owner (Cascading)
const deleteOwner = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user || user.role !== 'owner') {
            return res.status(404).json({ success: false, error: 'Owner not found' });
        }
        
        const businessId = user.businessId;

        // Cascade Delete
        if (businessId) {
            await Order.deleteMany({ businessId }); // Orders
            await User.deleteMany({ businessId, role: 'employee' }); // Employees
            await Business.findByIdAndDelete(businessId); // The Business itself
        }
        await User.findByIdAndDelete(user._id); // Delete the owner account

        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        next(error);
    }
};

const getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find({ role: { $ne: 'admin' } }).select('-password').populate('businessId', 'name');
        res.status(200).json({ success: true, data: users });
    } catch (error) {
        next(error);
    }
};

// NEW: All Platform Orders
const getAllOrders = async (req, res, next) => {
    try {
        const filter = {};
        if (req.query.businessId) filter.businessId = req.query.businessId;

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
            .populate('businessId', 'name')
            .populate('employeeId', 'name')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, data: orders });
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
                    totalRevenue: { $sum: '$totalAmount' }
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
                    businessId: '$_id',
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
                    revenueGenerated: { $sum: '$totalAmount' }
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

module.exports = { 
    getSystemStats, 
    getBusinessesList, 
    getActivityTracking, 
    getPendingOwners, 
    approveOwner, 
    rejectOwner, 
    deleteOwner, 
    deactivateOwner,
    getAllUsers,
    getAllOrders
};
