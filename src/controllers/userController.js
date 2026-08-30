'use strict';

const { User } = require('../models');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/users — admin only
const getAllUsers = asyncHandler(async (_req, res) => {
  const users = await User.findAll({ order: [['id', 'ASC']] });
  return res
    .status(200)
    .json({ message: 'Users fetched successfully.', users: users.map((u) => u.toSafeJSON()) });
});

// GET /api/users/:id — admin only
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) {
    throw new ApiError(404, 'User not found.');
  }
  return res.status(200).json({ message: 'User fetched successfully.', user: user.toSafeJSON() });
});

// PATCH /api/users/:id/status — admin only
const updateUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) {
    throw new ApiError(404, 'User not found.');
  }
  // Admins should not be able to deactivate themselves accidentally.
  if (user.id === req.user.id && req.body.isActive === false) {
    throw new ApiError(400, 'You cannot deactivate your own admin account.');
  }
  user.isActive = req.body.isActive;
  await user.save();
  return res
    .status(200)
    .json({ message: 'User status updated.', user: user.toSafeJSON() });
});

// GET /api/users/profile — self
const getOwnProfile = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json({ message: 'Profile fetched.', user: req.user.toSafeJSON() });
});

// PUT /api/users/profile/update — self
const updateOwnProfile = asyncHandler(async (req, res) => {
  const updates = {};
  ['firstname', 'lastname', 'email'].forEach((f) => {
    if (Object.prototype.hasOwnProperty.call(req.body, f)) updates[f] = req.body[f];
  });
  if (Object.keys(updates).length === 0) {
    throw new ApiError(400, 'No updatable fields provided.');
  }
  // If email is changing, make sure no other user owns it.
  if (updates.email && updates.email !== req.user.email) {
    const conflict = await User.findOne({ where: { email: updates.email } });
    if (conflict) {
      throw new ApiError(409, 'Email is already registered.');
    }
  }
  Object.assign(req.user, updates);
  await req.user.save();
  return res
    .status(200)
    .json({ message: 'Profile updated.', user: req.user.toSafeJSON() });
});

// PATCH /api/users/password — self
const updateOwnPassword = asyncHandler(async (req, res) => {
  req.user.password = req.body.password;
  await req.user.save(); // beforeUpdate hook re-hashes.
  return res.status(200).json({ message: 'Password updated successfully.' });
});

module.exports = {
  getAllUsers,
  getUserById,
  updateUserStatus,
  getOwnProfile,
  updateOwnProfile,
  updateOwnPassword,
};
