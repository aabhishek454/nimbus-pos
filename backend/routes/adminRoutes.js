const express = require('express');
const { getSystemStats, getBusinessesList, getActivityTracking } = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

const router = express.Router();

// Admin routes require auth and admin role
router.use(protect, authorize('admin'));

router.get('/stats', getSystemStats);
router.get('/businesses', getBusinessesList);
router.get('/activity', getActivityTracking);

module.exports = router;
