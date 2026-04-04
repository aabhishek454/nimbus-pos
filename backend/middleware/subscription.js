const Business = require('../models/Business');

const checkSubscription = async (req, res, next) => {
    if (!req.user || !req.businessId) {
        return res.status(401).json({ success: false, error: 'Not permitted' });
    }

    // Admins bypass subscription checks
    if (req.user.role === 'admin') {
        return next();
    }

    try {
        const business = await Business.findById(req.businessId);
        if (!business) {
            return res.status(404).json({ success: false, error: 'Business not found' });
        }

        if (business.subscriptionStatus === 'expired') {
            return res.status(403).json({
                success: false,
                error: 'Account has been deactivated.',
                subscriptionExpired: true
            });
        }

        next();
    } catch (error) {
        return res.status(500).json({ success: false, error: 'Server error checking subscription' });
    }
};

module.exports = { checkSubscription };
