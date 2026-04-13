const MenuItem = require('../models/MenuItem');
const csv = require('csv-parser');
const { Readable } = require('stream');

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

// @desc Upload menu items via CSV
// @route POST /api/menu/upload-csv
const uploadMenuCSV = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'Please upload a CSV file' });
        }

        const results = [];
        const stream = Readable.from(req.file.buffer.toString());

        stream
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', async () => {
                try {
                    const groupedItems = {};
                    let successCount = 0;
                    let failedRows = 0;

                    for (const row of results) {
                        const name = row.Name || row.name;
                        const category = row.Category || row.category || 'General';
                        const variantType = row.Variant || row.variant;
                        const price = parseFloat(row.Price || row.price);

                        if (!name || isNaN(price) || !variantType) {
                            failedRows++;
                            continue;
                        }

                        const key = `${name.trim()}|${category.trim()}`;
                        if (!groupedItems[key]) {
                            groupedItems[key] = {
                                name: name.trim(),
                                category: category.trim(),
                                variants: [],
                                businessId: req.businessId
                            };
                        }

                        groupedItems[key].variants.push({
                            type: variantType.trim(),
                            price: price
                        });
                    }

                    const itemsToCreate = Object.values(groupedItems);
                    
                    if (itemsToCreate.length > 0) {
                        // Optional: Clear existing menu if requested? No, user didn't ask for it.
                        // We use insertMany for performance
                        await MenuItem.insertMany(itemsToCreate);
                        successCount = itemsToCreate.length;
                    }

                    res.status(200).json({
                        success: true,
                        message: `Bulk search complete. Added ${successCount} menu items.`,
                        data: {
                            itemsAdded: successCount,
                            failedRows: failedRows
                        }
                    });
                } catch (err) {
                    next(err);
                }
            });
    } catch (error) {
        next(error);
    }
};

module.exports = { getMenu, createMenuItem, updateMenuItem, deleteMenuItem, uploadMenuCSV };
