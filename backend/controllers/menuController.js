const MenuItem = require('../models/MenuItem');

// @desc Get all menu items for the business
// @route GET /api/menu
const getMenu = async (req, res, next) => {
    try {
        const menu = await MenuItem.find({ businessId: req.businessId }).sort({ category: 1, name: 1 });
        res.status(200).json({ success: true, count: menu.length, data: menu });
    } catch (error) {
        next(error);
    }
};

// @desc Create a new menu item
// @route POST /api/menu
const createMenuItem = async (req, res, next) => {
    try {
        req.body.businessId = req.businessId;
        const item = await MenuItem.create(req.body);
        res.status(201).json({ success: true, data: item });
    } catch (error) {
        next(error);
    }
};

// @desc Update a menu item
// @route PUT /api/menu/:id
const updateMenuItem = async (req, res, next) => {
    try {
        let item = await MenuItem.findOne({ _id: req.params.id, businessId: req.businessId });
        if (!item) return res.status(404).json({ success: false, error: 'Menu item not found' });

        item = await MenuItem.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        
        res.status(200).json({ success: true, data: item });
    } catch (error) {
        next(error);
    }
};

// @desc Delete a menu item
// @route DELETE /api/menu/:id
const deleteMenuItem = async (req, res, next) => {
    try {
        const item = await MenuItem.findOne({ _id: req.params.id, businessId: req.businessId });
        if (!item) return res.status(404).json({ success: false, error: 'Menu item not found' });

        await item.deleteOne();
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        next(error);
    }
};

module.exports = { getMenu, createMenuItem, updateMenuItem, deleteMenuItem };
