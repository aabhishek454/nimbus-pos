const express = require('express');
const { checkIn, checkOut, getMyStatus, getAttendance } = require('../controllers/attendanceController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const { attachBusiness } = require('../middleware/business');

const router = express.Router();

router.use(protect, attachBusiness);

// Employee routes
router.post('/check-in', checkIn);
router.post('/check-out', checkOut);
router.get('/my-status', getMyStatus);

// Owner/Manager view
router.get('/', authorize('owner', 'manager'), getAttendance);

module.exports = router;
