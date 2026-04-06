const mongoose = require('mongoose');
const readline = require('readline');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const Business = require('../models/Business');
const Order = require('../models/Order');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const executeReset = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/saas-restaurant');
        
        console.log('--- SYSTEM PURGE INITIATED ---');
        await User.deleteMany({});
        await Business.deleteMany({});
        await Order.deleteMany({});
        
        console.log('Database cleared successfully');

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash('12345', salt);
        await User.create({
            name: 'Super Admin',
            email: 'abhishekvishal@gmail.com',
            password: hash,
            role: 'admin'
        });
        
        console.log('Admin account created: abhishekvishal@gmail.com');
        process.exit(0);
    } catch (err) {
        console.error('Error during reset:', err);
        process.exit(1);
    }
};

rl.question('Are you sure you want to delete all data? (yes/no): ', (answer) => {
    if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
        executeReset();
    } else {
        console.log('Operation cancelled.');
        process.exit(0);
    }
});
