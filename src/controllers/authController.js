'use strict';

const { User } = require('../models');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { sign } = require('../utils/jwt');

// POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const { firstname, lastname, email, password } = req.body;

  const existing = await User.findOne({ where: { email } });
  if (existing) {
    throw new ApiError(409, 'Email is already registered.');
  }

  // role and isActive are always defaulted server-side.
  const user = await User.create({
    firstname,
    lastname,
    email,
    password,
    role: 'user',
    isActive: true,
  });

  return res.status(201).json({
    message: 'User registered successfully.',
    user: user.toSafeJSON(),
  });
});

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  if (!user.isActive) {
    throw new ApiError(403, 'Your account is deactivated. Contact an admin.');
  }

  const ok = await user.checkPassword(password);
  if (!ok) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  const token = sign({ id: user.id, role: user.role });

  return res.status(200).json({
    message: 'Login successful.',
    token,
    user: user.toSafeJSON(),
  });
});

module.exports = { register, login };
