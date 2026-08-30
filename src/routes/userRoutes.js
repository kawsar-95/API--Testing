'use strict';

const express = require('express');
const { userController, authenticate, authorize } = require('../composition-root');
const validate = require('../middlewares/validate');
const {
  updateProfileSchema,
  updatePasswordSchema,
  updateStatusSchema,
} = require('../validators/authValidator');
const { idParamSchema } = require('../validators/blogValidator');

const router = express.Router();

// Static routes MUST come before the `:id` route, otherwise `/:id` would
// shadow `/profile`, `/password`, etc. (Express matches in declaration order.)
router.get('/profile', authenticate, userController.getOwnProfile);
router.put(
  '/profile/update',
  authenticate,
  validate(updateProfileSchema),
  userController.updateOwnProfile
);
router.patch(
  '/password',
  authenticate,
  validate(updatePasswordSchema),
  userController.updateOwnPassword
);

// Admin-only listing & lookup
router.get('/', authenticate, authorize('admin'), userController.getAllUsers);
router.get(
  '/:id',
  authenticate,
  authorize('admin'),
  validate(idParamSchema, 'params'),
  userController.getUserById
);
router.patch(
  '/:id/status',
  authenticate,
  authorize('admin'),
  validate(idParamSchema, 'params'),
  validate(updateStatusSchema),
  userController.updateUserStatus
);

module.exports = router;
