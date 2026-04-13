const Order = require('../models/Order');
const ExcelJS = require('exceljs');

// @desc Export orders as Excel
// @route GET /api/export/orders
const exportOrdersExcel = async (req, res, next) => {
    try {
        const orders = await Order.find({ businessId: req.businessId })
            .populate('employeeId', 'name')
            .sort({ createdAt: -1 });

        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Orders');

        sheet.columns = [
            { header: 'Date', key: 'date', width: 18 },
            { header: 'Customer', key: 'customer', width: 20 },
            { header: 'Items', key: 'items', width: 40 },
            { header: 'Total (₹)', key: 'total', width: 15 },
            { header: 'Payment', key: 'payment', width: 12 },
            { header: 'Status', key: 'status', width: 10 },
            { header: 'Employee', key: 'employee', width: 18 }
        ];

        // Style header
        sheet.getRow(1).eachCell(cell => {
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2563EB' } };
        });

        orders.forEach(order => {
            sheet.addRow({
                date: new Date(order.createdAt).toLocaleString('en-IN'),
                customer: order.customerName || 'Walk-in',
                items: (order.items || []).map(i => `${i.quantity}x ${i.name} (₹${i.price})`).join(', '),
                total: order.totalAmount,
                payment: order.paymentType,
                status: order.status,
                employee: order.employeeId?.name || 'Unknown'
            });
        });

        const date = new Date().toISOString().split("T")[0];
        const fileName = `orders-${date}.xlsx`;
        res.attachment(fileName);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        next(error);
    }
};

// @desc Export orders as JSON backup
// @route GET /api/export/backup
const exportBackupJSON = async (req, res, next) => {
    try {
        const orders = await Order.find({ businessId: req.businessId })
            .populate('employeeId', 'name email')
            .sort({ createdAt: -1 });

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', 'attachment; filename=backup.json');
        res.status(200).json({ success: true, exportedAt: new Date(), count: orders.length, data: orders });
    } catch (error) {
        next(error);
    }
};

module.exports = { exportOrdersExcel, exportBackupJSON };
