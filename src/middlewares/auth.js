'use strict';

const { verify } = require('../utils/jwt');
const { User } = require('../models');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

// Authenticate requests via `Authorization: Bearer <token>`.
const authenticate = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return next(new ApiError(401, 'Authentication required.'));
  }
  let decoded;
  try {
    decoded = verify(token);
  } catch (err) {
    return next(new ApiError(401, 'Invalid or expired token.'));
  }
  const user = await User.findByPk(decoded.id);
  if (!user) {
    return next(new ApiError(401, 'User no longer exists.'));
  }
  if (!user.isActive) {
    return next(new ApiError(403, 'Your account is deactivated.'));
  }
  req.user = user;
  return next();
});

// Role guard — use after authenticate().
const authorize = (...roles) => (req, _res, next) => {
  if (!req.user) return next(new ApiError(401, 'Authentication required.'));
  if (!roles.includes(req.user.role)) {
    return next(
      new ApiError(403, 'You do not have permission to perform this action.')
    );
  }
  return next();
};

module.exports = { authenticate, authorize };
