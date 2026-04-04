const express = require('express');
const { register, login, addEmployee, getEmployees } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const { attachBusiness } = require('../middleware/business');
const { checkSubscription } = require('../middleware/subscription');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post(
    '/add-employee', 
    protect, 
    authorize('owner'), 
    attachBusiness, 
    checkSubscription, 
    addEmployee
);

router.get(
    '/employees',
    protect,
    authorize('owner'),
    attachBusiness,
    getEmployees
);

module.exports = router;
