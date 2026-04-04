const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Business = require('../models/Business');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc Register owner & create business
// @route POST /api/auth/register
const register = async (req, res, next) => {
    const { name, email, password, businessName } = req.body;

    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ success: false, error: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // We create the user first without businessId, then after business is created we update it
        let user = new User({
            name,
            email,
            password: hashedPassword,
            role: 'owner'
        });
        await user.save();

        const business = new Business({
            name: businessName,
            ownerId: user._id
        });
        await business.save();

        // Update user with businessId
        user.businessId = business._id;
        await user.save();

        res.status(201).json({
            success: true,
            user: { _id: user._id, name: user.name, email: user.email, role: user.role, businessId: user.businessId },
            token: generateToken(user._id)
        });
    } catch (error) {
        next(error);
    }
};

// @desc Login user
// @route POST /api/auth/login
const login = async (req, res, next) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        res.status(200).json({
            success: true,
            user: { _id: user._id, name: user.name, email: user.email, role: user.role, businessId: user.businessId },
            token: generateToken(user._id)
        });
    } catch (error) {
        next(error);
    }
};

// @desc Add employee
// @route POST /api/auth/add-employee (Owner only)
const addEmployee = async (req, res, next) => {
    const { name, email, password } = req.body;

    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ success: false, error: 'Email already used' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const employee = await User.create({
            name,
            email,
            password: hashedPassword,
            role: 'employee',
            businessId: req.businessId
        });

        res.status(201).json({
            success: true,
            data: { _id: employee._id, name: employee.name, email: employee.email, role: employee.role, businessId: employee.businessId }
        });
    } catch (error) {
        next(error);
    }
};

// @desc Get all employees for the business
// @route GET /api/auth/employees (Owner only)
const getEmployees = async (req, res, next) => {
    try {
        const employees = await User.find({ businessId: req.businessId, role: 'employee' }).select('-password');
        res.status(200).json({
            success: true,
            data: employees
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { register, login, addEmployee, getEmployees };
