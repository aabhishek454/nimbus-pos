const express = require('express');
const { getInventory, addInventoryItem, updateInventoryItem, deleteInventoryItem } = require('../controllers/inventoryController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const { attachBusiness } = require('../middleware/business');

const router = express.Router();

router.use(protect, authorize('owner', 'manager'), attachBusiness);

router.route('/')
    .get(getInventory)
    .post(addInventoryItem);

router.route('/:id')
    .put(updateInventoryItem)
    .delete(deleteInventoryItem);

module.exports = router;
