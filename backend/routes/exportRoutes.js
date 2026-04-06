const express = require('express');
const { exportOrdersExcel, exportBackupJSON } = require('../controllers/exportController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const { attachBusiness } = require('../middleware/business');

const router = express.Router();

router.use(protect, authorize('owner', 'admin'), attachBusiness);

router.get('/orders', exportOrdersExcel);
router.get('/backup', exportBackupJSON);

module.exports = router;
