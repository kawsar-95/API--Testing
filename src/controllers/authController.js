'use strict';

const asyncHandler = require('../utils/asyncHandler');

class AuthController {
  constructor(authService) {
    this.authService = authService;
  }

  // POST /api/auth/register
  register = asyncHandler(async (req, res) => {
    const user = await this.authService.register(req.body);
    return res.status(201).json({
      message: 'User registered successfully.',
      user: user.toSafeJSON(),
    });
  });

  // POST /api/auth/login
  login = asyncHandler(async (req, res) => {
    const { user, token } = await this.authService.login(req.body);
    return res.status(200).json({
      message: 'Login successful.',
      token,
      user: user.toSafeJSON(),
    });
  });
}

module.exports = AuthController;
