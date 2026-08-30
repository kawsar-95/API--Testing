'use strict';

const { UnauthorizedError, ForbiddenError } = require('../errors');
const asyncHandler = require('../utils/asyncHandler');

// Factory over a class: Express middleware must keep the plain (req,res,next)
// signature, so this returns closures wired to injected collaborators
// (DIP) rather than requiring utils/jwt / models directly.
const createAuthMiddleware = ({ tokenService, userRepository }) => {
  // Authenticate requests via `Authorization: Bearer <token>`.
  const authenticate = asyncHandler(async (req, _res, next) => {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');
    if (scheme !== 'Bearer' || !token) {
      return next(new UnauthorizedError('Authentication required.'));
    }
    let decoded;
    try {
      decoded = tokenService.verify(token);
    } catch (err) {
      return next(new UnauthorizedError('Invalid or expired token.'));
    }
    const user = await userRepository.findById(decoded.id);
    if (!user) {
      return next(new UnauthorizedError('User no longer exists.'));
    }
    if (!user.isActive) {
      return next(new ForbiddenError('Your account is deactivated.'));
    }
    req.user = user;
    return next();
  });

  // Role guard — use after authenticate().
  const authorize = (...roles) => (req, _res, next) => {
    if (!req.user) return next(new UnauthorizedError('Authentication required.'));
    if (!roles.includes(req.user.role)) {
      return next(new ForbiddenError('You do not have permission to perform this action.'));
    }
    return next();
  };

  return { authenticate, authorize };
};

module.exports = createAuthMiddleware;
