const express = require('express');
const { generateReceipt, getReceipt } = require('../controllers/receiptController');
const { protect } = require('../middleware/auth');
const { attachBusiness } = require('../middleware/business');
const { checkSubscription } = require('../middleware/subscription');

const router = express.Router();

router.use(protect, attachBusiness, checkSubscription);

router.post('/:orderId', generateReceipt);
router.get('/:id', getReceipt);

module.exports = router;
