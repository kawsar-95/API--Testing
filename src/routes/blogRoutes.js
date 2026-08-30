'use strict';

const express = require('express');
const { blogController, authenticate } = require('../composition-root');
const validate = require('../middlewares/validate');
const {
  createBlogSchema,
  updateBlogSchema,
  idParamSchema,
  listQuerySchema,
} = require('../validators/blogValidator');

const router = express.Router();

// IMPORTANT: Specific routes MUST come before the `:id` route, otherwise
// `/:id` would swallow verbs like `/create`, `/update`, `/delete`.
router.get('/', validate(listQuerySchema, 'query'), blogController.getAllBlogs);
router.post('/create', authenticate, validate(createBlogSchema), blogController.createBlog);
router.put(
  '/update/:id',
  authenticate,
  validate(idParamSchema, 'params'),
  validate(updateBlogSchema),
  blogController.updateBlog
);
router.delete(
  '/delete/:id',
  authenticate,
  validate(idParamSchema, 'params'),
  blogController.deleteBlog
);
router.get('/:id', validate(idParamSchema, 'params'), blogController.getBlogById);

module.exports = router;
