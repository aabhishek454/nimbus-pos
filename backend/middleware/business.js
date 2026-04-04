const Business = require('../models/Business');

const attachBusiness = async (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ success: false, error: 'Not authenticated' });
    }

    if (!req.user.businessId) {
        // Admin user might not have a business ID, but they normally wouldn't hit standard tenant routes.
        if (req.user.role === 'admin') {
            return next();
        }
        return res.status(400).json({ success: false, error: 'User does not belong to any business' });
    }

    req.businessId = req.user.businessId;
    next();
};

module.exports = { attachBusiness };
