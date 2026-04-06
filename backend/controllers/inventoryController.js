const Inventory = require('../models/Inventory');

// @desc Get all inventory items for the business
// @route GET /api/inventory
const getInventory = async (req, res, next) => {
    try {
        const items = await Inventory.find({ businessId: req.businessId }).sort({ itemName: 1 });
        
        // Also flag low-stock items
        const lowStockItems = items.filter(i => i.quantity <= i.lowStockThreshold);
        
        res.status(200).json({
            success: true,
            data: items,
            lowStockAlerts: lowStockItems.map(i => ({
                itemName: i.itemName,
                quantity: i.quantity,
                unit: i.unit,
                threshold: i.lowStockThreshold
            }))
        });
    } catch (error) {
        next(error);
    }
};

// @desc Add a new inventory item
// @route POST /api/inventory
const addInventoryItem = async (req, res, next) => {
    try {
        const { itemName, quantity, unit, lowStockThreshold } = req.body;
        
        const existing = await Inventory.findOne({
            itemName: { $regex: new RegExp(`^${itemName}$`, 'i') },
            businessId: req.businessId
        });
        
        if (existing) {
            return res.status(400).json({ success: false, error: 'Item already exists. Use update instead.' });
        }

        const item = await Inventory.create({
            itemName,
            quantity,
            unit: unit || 'pcs',
            lowStockThreshold: lowStockThreshold || 5,
            businessId: req.businessId
        });

        res.status(201).json({ success: true, data: item });
    } catch (error) {
        next(error);
    }
};

// @desc Update inventory item quantity
// @route PUT /api/inventory/:id
const updateInventoryItem = async (req, res, next) => {
    try {
        const item = await Inventory.findById(req.params.id);
        if (!item || item.businessId.toString() !== req.businessId.toString()) {
            return res.status(404).json({ success: false, error: 'Inventory item not found' });
        }

        const { quantity, lowStockThreshold, unit } = req.body;
        if (quantity !== undefined) item.quantity = quantity;
        if (lowStockThreshold !== undefined) item.lowStockThreshold = lowStockThreshold;
        if (unit) item.unit = unit;

        await item.save();
        res.status(200).json({ success: true, data: item });
    } catch (error) {
        next(error);
    }
};

// @desc Delete inventory item
// @route DELETE /api/inventory/:id
const deleteInventoryItem = async (req, res, next) => {
    try {
        const item = await Inventory.findById(req.params.id);
        if (!item || item.businessId.toString() !== req.businessId.toString()) {
            return res.status(404).json({ success: false, error: 'Inventory item not found' });
        }
        await Inventory.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        next(error);
    }
};

// Helper: Deduct inventory when order is placed (called from orderController)
const deductInventory = async (items, businessId) => {
    for (const orderItem of items) {
        await Inventory.findOneAndUpdate(
            {
                itemName: { $regex: new RegExp(`^${orderItem.name}$`, 'i') },
                businessId
            },
            { $inc: { quantity: -orderItem.quantity } }
        );
    }
};

module.exports = { getInventory, addInventoryItem, updateInventoryItem, deleteInventoryItem, deductInventory };
