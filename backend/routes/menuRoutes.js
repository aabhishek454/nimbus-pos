const express = require('express');
const multer = require('multer');
const { getMenu, createMenuItem, updateMenuItem, deleteMenuItem, uploadMenuCSV } = require('../controllers/menuController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const { attachBusiness } = require('../middleware/business');
const { checkSubscription } = require('../middleware/subscription');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// All menu routes require auth, business context, and subscription
router.use(protect, attachBusiness, checkSubscription);

router.route('/')
    .get(getMenu) // Employees can read menu
    .post(authorize('owner', 'manager'), createMenuItem); // Only owners/managers can create

router.post('/upload-csv', authorize('owner', 'manager'), upload.single('file'), uploadMenuCSV);

router.route('/:id')
    .put(authorize('owner', 'manager'), updateMenuItem)
    .delete(authorize('owner', 'manager'), deleteMenuItem);

module.exports = router;
