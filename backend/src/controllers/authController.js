const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
    });
};

// Register a new user(Driver)
// POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role, phone } = req.body;

    if (role === 'admin') {
      return res.status(403).json({ 
        success: false,
        error: 'Admin creation not allowed via public register' 
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ 
        success: false,
        error: 'User already exists' 
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'driver',
      phone,
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      data: {
        token,
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Login user
// POST /api/auth/login
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ 
              success: false,
              error: 'Please provide an email and password' 
            });
        }

        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({ 
              success: false,
              error: 'Invalid credentials' 
            });
        }

        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({ 
              success: false,
              error: 'Invalid credentials' 
            });
        }

        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            data: {
                token,
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        next(error);
    }
};

// Get current logged in user infos
// GET /api/auth/me
exports.getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);

        res.status(200).json({
            success: true,
            data: user,
        });
    } catch (error) {
        next(error);
    }
};

// Log user out / clear cookie
// GET /api/auth/logout
exports.logout = async (req, res, next) => {
    res.status(200).json({
        success: true,
        data: {},
        message: 'Successfully logged out'
    });
};

// Get all users (Admin only)
// GET /api/auth/users
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find({});
    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

