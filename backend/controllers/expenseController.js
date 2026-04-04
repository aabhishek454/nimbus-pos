const Expense = require('../models/Expense');
const Order = require('../models/Order');

// @desc Create new expense
// @route POST /api/expenses
const createExpense = async (req, res, next) => {
    const { amount, category } = req.body;

    try {
        const expense = await Expense.create({
            amount,
            category,
            businessId: req.businessId
        });
        res.status(201).json({ success: true, data: expense });
    } catch (error) {
        next(error);
    }
};

// @desc Get all expenses and calculate profit
// @route GET /api/expenses
const getExpenses = async (req, res, next) => {
    try {
        const expenses = await Expense.find({ businessId: req.businessId }).sort({ createdAt: -1 });

        // Calculate profit (Sales - Expenses)
        let totalExpenses = 0;
        expenses.forEach(exp => totalExpenses += exp.amount);

        const orders = await Order.find({ businessId: req.businessId });
        let totalSales = 0;
        orders.forEach(order => totalSales += order.amount);

        const netProfit = totalSales - totalExpenses;

        res.status(200).json({
            success: true,
            data: {
                expenses,
                totalExpenses,
                totalSales,
                netProfit
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { createExpense, getExpenses };
