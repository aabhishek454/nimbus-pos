const express = require('express');
const { getMonthlyReport, getInvoice, getKOT, getPublicKOT, getPublicInvoice } = require('../controllers/reportController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const { attachBusiness } = require('../middleware/business');

const router = express.Router();

// Public routes for WhatsApp PDF forwarding (Uses shareToken instead of JWT)
router.get('/public/slip/:orderId', getPublicKOT);
router.get('/public/invoice/:orderId', getPublicInvoice);

// Below routes require Auth
router.use(protect, attachBusiness);

router.get('/monthly', authorize('owner', 'manager'), getMonthlyReport);
router.get('/invoice/:orderId', getInvoice);
router.get('/slip/:orderId', getKOT);

module.exports = router;
