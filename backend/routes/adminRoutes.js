const express = require('express');
const router = express.Router();
const { 
    getSystemStats, 
    getBusinessesList, 
    getActivityTracking, 
    getPendingOwners, 
    approveOwner,
    rejectOwner,
    deleteOwner,
    deactivateOwner,
    getAllUsers,
    getAllOrders
} = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.get('/stats', protect, authorize('admin'), getSystemStats);
router.get('/businesses', protect, authorize('admin'), getBusinessesList);
router.get('/activity', protect, authorize('admin'), getActivityTracking);
router.get('/pending-owners', protect, authorize('admin'), getPendingOwners);
router.patch('/approve-owner/:id', protect, authorize('admin'), approveOwner);
router.delete('/reject-owner/:id', protect, authorize('admin'), rejectOwner);
router.delete('/owner/:id', protect, authorize('admin'), deleteOwner);
router.patch('/deactivate-owner/:id', protect, authorize('admin'), deactivateOwner);
router.get('/users', protect, authorize('admin'), getAllUsers);
router.get('/orders', protect, authorize('admin'), getAllOrders);

module.exports = router;
