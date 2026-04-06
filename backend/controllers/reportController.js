const PDFDocument = require('pdfkit');
const Order = require('../models/Order');
const Business = require('../models/Business');

// @desc Generate monthly business report PDF
// @route GET /api/reports/monthly
const getMonthlyReport = async (req, res, next) => {
    try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const business = await Business.findById(req.businessId);
        const orders = await Order.find({
            businessId: req.businessId,
            createdAt: { $gte: startOfMonth }
        });

        const totalSales = orders.reduce((sum, o) => sum + o.totalAmount, 0);
        const totalOrders = orders.length;
        const cashSales = orders.filter(o => o.paymentType === 'cash').reduce((s, o) => s + o.totalAmount, 0);
        const onlineSales = orders.filter(o => o.paymentType === 'online').reduce((s, o) => s + o.totalAmount, 0);

        // Generate PDF
        const doc = new PDFDocument({ margin: 50 });
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=report-${now.getFullYear()}-${now.getMonth() + 1}.pdf`);
        doc.pipe(res);

        // Header
        doc.fontSize(24).fillColor('#1e40af').text(business?.name || 'Business Report', { align: 'center' });
        doc.moveDown(0.3);
        doc.fontSize(12).fillColor('#6b7280').text(`Monthly Report — ${now.toLocaleString('en-IN', { month: 'long', year: 'numeric' })}`, { align: 'center' });
        if (business?.gstNumber) {
            doc.fontSize(10).text(`GST: ${business.gstNumber}`, { align: 'center' });
        }
        doc.moveDown(1);
        doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeColor('#e5e7eb').stroke();
        doc.moveDown(1);

        // Summary Section
        doc.fontSize(16).fillColor('#111827').text('Executive Summary');
        doc.moveDown(0.5);
        
        const summaryData = [
            ['Total Revenue', `₹${totalSales.toLocaleString('en-IN')}`],
            ['Total Orders', totalOrders.toString()],
            ['Cash Revenue', `₹${cashSales.toLocaleString('en-IN')}`],
            ['Online Revenue', `₹${onlineSales.toLocaleString('en-IN')}`],
            ['Average Order Value', totalOrders > 0 ? `₹${(totalSales / totalOrders).toFixed(2)}` : '₹0']
        ];

        summaryData.forEach(([label, value]) => {
            doc.fontSize(11).fillColor('#374151').text(label, 70, doc.y, { continued: true, width: 200 });
            doc.fontSize(11).fillColor('#1e40af').text(value, { align: 'right' });
            doc.moveDown(0.3);
        });

        doc.moveDown(1);
        doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeColor('#e5e7eb').stroke();
        doc.moveDown(1);

        // Top items
        doc.fontSize(16).fillColor('#111827').text('Top Selling Items');
        doc.moveDown(0.5);

        const itemMap = {};
        orders.forEach(order => {
            (order.items || []).forEach(item => {
                if (!itemMap[item.name]) itemMap[item.name] = { qty: 0, rev: 0 };
                itemMap[item.name].qty += item.quantity;
                itemMap[item.name].rev += item.quantity * item.price;
            });
        });
        
        const topItems = Object.entries(itemMap)
            .sort((a, b) => b[1].qty - a[1].qty)
            .slice(0, 5);

        topItems.forEach(([name, { qty, rev }], i) => {
            doc.fontSize(11).fillColor('#374151').text(`${i + 1}. ${name}  — ${qty} sold  (₹${rev.toLocaleString('en-IN')})`);
            doc.moveDown(0.2);
        });

        doc.moveDown(2);
        doc.fontSize(9).fillColor('#9ca3af').text(`Generated on ${new Date().toLocaleString('en-IN')}`, { align: 'center' });

        doc.end();
    } catch (error) {
        next(error);
    }
};

// @desc Generate invoice PDF for a specific order
// @route GET /api/reports/invoice/:orderId
const getInvoice = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.orderId).populate('employeeId', 'name');
        if (!order) return res.status(404).json({ success: false, error: 'Order not found' });

        const business = await Business.findById(order.businessId);
        
        // Auto-increment invoice number
        business.invoiceCounter = (business.invoiceCounter || 0) + 1;
        await business.save();
        const invoiceNum = `INV-${String(business.invoiceCounter).padStart(5, '0')}`;

        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${invoiceNum}.pdf`);
        doc.pipe(res);

        // Invoice Header
        doc.fontSize(22).fillColor('#1e40af').text(business?.name || 'Restaurant', { align: 'center' });
        doc.moveDown(0.2);
        if (business?.gstNumber) {
            doc.fontSize(9).fillColor('#6b7280').text(`GSTIN: ${business.gstNumber}`, { align: 'center' });
        }
        doc.moveDown(0.5);
        doc.fontSize(16).fillColor('#111827').text('TAX INVOICE', { align: 'center' });
        doc.moveDown(0.5);
        doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeColor('#1e40af').lineWidth(2).stroke();
        doc.moveDown(0.8);

        // Invoice metadata
        doc.fontSize(10).fillColor('#374151');
        doc.text(`Invoice No: ${invoiceNum}`, 50);
        doc.text(`Date: ${new Date(order.createdAt).toLocaleString('en-IN')}`, 50);
        doc.text(`Customer: ${order.customerName || 'Walk-in'}`, 50);
        doc.text(`Payment: ${order.paymentType.toUpperCase()}`, 50);
        doc.text(`Served by: ${order.employeeId?.name || 'Staff'}`, 50);
        doc.moveDown(1);

        // Table header
        const tableTop = doc.y;
        doc.fontSize(10).fillColor('#ffffff');
        doc.rect(50, tableTop - 5, 500, 22).fill('#1e40af');
        doc.text('Item', 60, tableTop, { width: 200 });
        doc.text('Qty', 270, tableTop, { width: 60, align: 'center' });
        doc.text('Price', 340, tableTop, { width: 80, align: 'right' });
        doc.text('Amount', 440, tableTop, { width: 100, align: 'right' });

        // Table rows
        let y = tableTop + 25;
        (order.items || []).forEach((item, i) => {
            const bg = i % 2 === 0 ? '#f9fafb' : '#ffffff';
            doc.rect(50, y - 5, 500, 22).fill(bg);
            doc.fontSize(10).fillColor('#374151');
            doc.text(item.name, 60, y, { width: 200 });
            doc.text(item.quantity.toString(), 270, y, { width: 60, align: 'center' });
            doc.text(`₹${item.price}`, 340, y, { width: 80, align: 'right' });
            doc.text(`₹${(item.quantity * item.price).toLocaleString('en-IN')}`, 440, y, { width: 100, align: 'right' });
            y += 22;
        });

        // Total
        doc.moveDown(0.5);
        y += 10;
        doc.moveTo(50, y).lineTo(550, y).strokeColor('#1e40af').lineWidth(1).stroke();
        y += 10;
        doc.fontSize(14).fillColor('#1e40af').text(`Total: ₹${order.totalAmount.toLocaleString('en-IN')}`, 340, y, { width: 200, align: 'right' });

        doc.moveDown(4);
        doc.fontSize(9).fillColor('#9ca3af').text('Thank you for your visit!', { align: 'center' });

        doc.end();
    } catch (error) {
        next(error);
    }
};

module.exports = { getMonthlyReport, getInvoice };
