const express = require('express');
const { createExpense, getExpenses } = require('../controllers/expenseController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const { attachBusiness } = require('../middleware/business');
const { checkSubscription } = require('../middleware/subscription');

const router = express.Router();

// Expense routes require auth, business context, and active subscription. Available mostly to owners.
router.use(protect, authorize('owner', 'admin'), attachBusiness, checkSubscription);

router.route('/')
    .post(createExpense)
    .get(getExpenses);

module.exports = router;
