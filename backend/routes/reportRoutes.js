const express = require('express');
const { getMonthlyReport, getInvoice, getKOT } = require('../controllers/reportController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const { attachBusiness } = require('../middleware/business');

const router = express.Router();

router.use(protect, attachBusiness);

router.get('/monthly', authorize('owner', 'manager'), getMonthlyReport);
router.get('/invoice/:orderId', getInvoice);
router.get('/slip/:orderId', getKOT);

module.exports = router;
