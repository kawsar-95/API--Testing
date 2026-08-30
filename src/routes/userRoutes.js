'use strict';

const express = require('express');
const {
  getAllUsers,
  getUserById,
  updateUserStatus,
  getOwnProfile,
  updateOwnProfile,
  updateOwnPassword,
} = require('../controllers/userController');
const validate = require('../middlewares/validate');
const { authenticate, authorize } = require('../middlewares/auth');
const {
  updateProfileSchema,
  updatePasswordSchema,
  updateStatusSchema,
} = require('../validators/authValidator');
const { idParamSchema } = require('../validators/blogValidator');

const router = express.Router();

// Static routes MUST come before the `:id` route, otherwise `/:id` would
// shadow `/profile`, `/password`, etc. (Express matches in declaration order.)
router.get('/profile', authenticate, getOwnProfile);
router.put('/profile/update', authenticate, validate(updateProfileSchema), updateOwnProfile);
router.patch('/password', authenticate, validate(updatePasswordSchema), updateOwnPassword);

// Admin-only listing & lookup
router.get('/', authenticate, authorize('admin'), getAllUsers);
router.get(
  '/:id',
  authenticate,
  authorize('admin'),
  validate(idParamSchema, 'params'),
  getUserById
);
router.patch(
  '/:id/status',
  authenticate,
  authorize('admin'),
  validate(idParamSchema, 'params'),
  validate(updateStatusSchema),
  updateUserStatus
);

module.exports = router;
