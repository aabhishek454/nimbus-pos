const express = require('express');
const { getSalesTrend, getBestSellers, getPeakHours, getInsights } = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const { attachBusiness } = require('../middleware/business');

const router = express.Router();

// All analytics routes require auth + business context
// Accessible by owner and manager
router.use(protect, authorize('owner', 'manager', 'admin'), attachBusiness);

router.get('/sales-trend', getSalesTrend);
router.get('/best-sellers', getBestSellers);
router.get('/peak-hours', getPeakHours);
router.get('/insights', getInsights);

module.exports = router;
