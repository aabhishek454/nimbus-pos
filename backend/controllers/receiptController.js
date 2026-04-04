const Receipt = require('../models/Receipt');
const Order = require('../models/Order');
const Business = require('../models/Business');
const { generateReceiptPDF } = require('../utils/pdfGenerator');

// @desc Generate new receipt PDF
// @route POST /api/receipts/:orderId
const generateReceipt = async (req, res, next) => {
    try {
        const { orderId } = req.params;

        const order = await Order.findOne({ _id: orderId, businessId: req.businessId });
        if (!order) {
            return res.status(404).json({ success: false, error: 'Order not found for this business' });
        }

        let receipt = await Receipt.findOne({ orderId });
        if (receipt) {
            // Already generated, return existing url
            return res.status(200).json({ success: true, pdfUrl: receipt.pdfUrl, message: 'Receipt already exists' });
        }

        const business = await Business.findById(req.businessId);

        // Generate PDF
        const pdfUrl = await generateReceiptPDF(order, business);

        // Save receipt info in DB
        receipt = await Receipt.create({
            orderId,
            pdfUrl
        });

        res.status(201).json({ success: true, pdfUrl: receipt.pdfUrl });
    } catch (error) {
        next(error);
    }
};

// @desc Get receipt details
// @route GET /api/receipts/:id
const getReceipt = async (req, res, next) => {
    try {
        const receipt = await Receipt.findById(req.params.id).populate({
            path: 'orderId',
            match: { businessId: req.businessId } // Ensures tenant isolation
        });

        if (!receipt || !receipt.orderId) {
            return res.status(404).json({ success: false, error: 'Receipt not found' });
        }

        res.status(200).json({ success: true, data: receipt });
    } catch (error) {
        next(error);
    }
};

module.exports = { generateReceipt, getReceipt };
