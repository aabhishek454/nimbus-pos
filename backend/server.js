require('dotenv').config();
const http = require('http');
const app = require('./app');
const connectDB = require('./config/db');

// Pre-connect to database at module load (for both local & serverless)
connectDB().catch((err) => {
    console.error('Initial DB connection failed:', err.message);
});

const PORT = process.env.PORT || 5000;

// Export app for Vercel multi-service routing
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    const server = http.createServer(app);
    server.listen(PORT, () => {
        console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });
}

module.exports = app;
