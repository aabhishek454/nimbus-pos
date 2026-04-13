const express = require('express');
const { createOrder, getTodayOrders, getOrderSummary, getEmployeeActivity, getAllOrders, getDateWiseAnalytics, markPaid, updateOrder, deleteOrder } = require('../controllers/orderController');
const { protect } = require('../middleware/auth');
const { attachBusiness } = require('../middleware/business');
const { checkSubscription } = require('../middleware/subscription');

const router = express.Router();

// All order routes require auth, business context, and active subscription
router.use(protect, attachBusiness, checkSubscription);

router.route('/')
    .post(createOrder)
    .get(getAllOrders);

router.get('/today', getTodayOrders);
router.get('/summary', getOrderSummary);
router.get('/employee-activity', getEmployeeActivity);
router.get('/analytics', getDateWiseAnalytics);
router.patch('/:id/pay', markPaid);

router.route('/:id')
    .put(updateOrder)
    .delete(deleteOrder);

module.exports = router;
