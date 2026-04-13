const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const orderRoutes = require('./routes/orderRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const receiptRoutes = require('./routes/receiptRoutes');
const adminRoutes = require('./routes/adminRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const exportRoutes = require('./routes/exportRoutes');
const reportRoutes = require('./routes/reportRoutes');

const app = express();

// Middleware
const allowedOrigins = [
    'https://nimbus-pos-seven.vercel.app',
    'http://localhost:3000',
    'http://localhost:3001'
];
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, curl, server-to-server)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
            return callback(null, true);
        }
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true
}));
app.use(express.json());

// Ensure DB is connected before handling ANY request (critical for serverless)
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (error) {
        console.error('DB connection middleware failed:', error.message);
        res.status(503).json({
            success: false,
            error: 'Database connection failed. Please try again shortly.'
        });
    }
});

// Serve static receipts
app.use('/receipts', express.static(path.join(__dirname, 'receipts')));

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/receipts', receiptRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/reports', reportRoutes);

// Centralized error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        success: false,
        error: err.message || 'Server Error'
    });
});

module.exports = app;
