'use strict';

const asyncHandler = require('../utils/asyncHandler');

class UserController {
  constructor(userService) {
    this.userService = userService;
  }

  // GET /api/users — admin only
  getAllUsers = asyncHandler(async (_req, res) => {
    const users = await this.userService.listAll();
    return res
      .status(200)
      .json({ message: 'Users fetched successfully.', users: users.map((u) => u.toSafeJSON()) });
  });

  // GET /api/users/:id — admin only
  getUserById = asyncHandler(async (req, res) => {
    const user = await this.userService.getById(req.params.id);
    return res.status(200).json({ message: 'User fetched successfully.', user: user.toSafeJSON() });
  });

  // PATCH /api/users/:id/status — admin only
  updateUserStatus = asyncHandler(async (req, res) => {
    const user = await this.userService.updateStatus(req.user, req.params.id, req.body.isActive);
    return res.status(200).json({ message: 'User status updated.', user: user.toSafeJSON() });
  });

  // GET /api/users/profile — self
  getOwnProfile = asyncHandler(async (req, res) => {
    return res.status(200).json({ message: 'Profile fetched.', user: req.user.toSafeJSON() });
  });

  // PUT /api/users/profile/update — self
  updateOwnProfile = asyncHandler(async (req, res) => {
    const user = await this.userService.updateOwnProfile(req.user, req.body);
    return res.status(200).json({ message: 'Profile updated.', user: user.toSafeJSON() });
  });

  // PATCH /api/users/password — self
  updateOwnPassword = asyncHandler(async (req, res) => {
    await this.userService.updatePassword(req.user, req.body.password);
    return res.status(200).json({ message: 'Password updated successfully.' });
  });
}

module.exports = UserController;
