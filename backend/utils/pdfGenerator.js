const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const generateReceiptPDF = async (order, business) => {
    return new Promise((resolve, reject) => {
        try {
            const receiptsDir = path.join(__dirname, '..', 'receipts');
            if (!fs.existsSync(receiptsDir)) {
                fs.mkdirSync(receiptsDir, { recursive: true });
            }

            const fileName = `receipt-${order._id}.pdf`;
            const filePath = path.join(receiptsDir, fileName);

            const doc = new PDFDocument({ margin: 50 });
            const stream = fs.createWriteStream(filePath);
            
            doc.pipe(stream);

            // Header - Business Name
            doc.fontSize(20).text(business.name, { align: 'center' });
            doc.moveDown();
            
            doc.fontSize(12).text(`Order ID: ${order._id}`);
            doc.text(`Date: ${new Date(order.createdAt).toLocaleString()}`);
            doc.text(`Payment Type: ${order.paymentType.toUpperCase()}`);
            doc.text(`Status: ${order.status.toUpperCase()}`);
            doc.moveDown();
            
            doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
            doc.moveDown();

            doc.fontSize(16).text(`Total Amount: $${order.amount.toFixed(2)}`, { align: 'right' });
            
            doc.moveDown(2);
            doc.fontSize(10).text('Thank you for your business!', { align: 'center' });

            doc.end();

            stream.on('finish', () => {
                const pdfUrl = `/receipts/${fileName}`;
                resolve(pdfUrl);
            });

            stream.on('error', (err) => {
                reject(err);
            });

        } catch (error) {
            reject(error);
        }
    });
};

module.exports = { generateReceiptPDF };
