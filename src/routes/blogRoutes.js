'use strict';

const express = require('express');
const {
  createBlog,
  getAllBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
} = require('../controllers/blogController');
const validate = require('../middlewares/validate');
const { authenticate } = require('../middlewares/auth');
const {
  createBlogSchema,
  updateBlogSchema,
  idParamSchema,
  listQuerySchema,
} = require('../validators/blogValidator');

const router = express.Router();

// IMPORTANT: Specific routes MUST come before the `:id` route, otherwise
// `/:id` would swallow verbs like `/create`, `/update`, `/delete`.
router.get('/', validate(listQuerySchema, 'query'), getAllBlogs);
router.post('/create', authenticate, validate(createBlogSchema), createBlog);
router.put('/update/:id', authenticate, validate(idParamSchema, 'params'), validate(updateBlogSchema), updateBlog);
router.delete('/delete/:id', authenticate, validate(idParamSchema, 'params'), deleteBlog);
router.get('/:id', validate(idParamSchema, 'params'), getBlogById);

module.exports = router;
