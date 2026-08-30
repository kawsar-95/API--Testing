'use strict';

const { Op } = require('sequelize');
const { Blog, User } = require('../models');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

// POST /api/blogs/create — auth required (user or admin)
const createBlog = asyncHandler(async (req, res) => {
  const { blogTitle, blog, category } = req.body;
  const created = await Blog.create({
    blogTitle,
    blog,
    category,
    userId: req.user.id,
  });
  const full = await Blog.findByPk(created.id, { include: [{ model: User, as: 'User' }] });
  return res
    .status(201)
    .json({ message: 'Blog created successfully.', blog: full.toPublicJSON() });
});

// GET /api/blogs — public, supports ?title=&category= (partial match)
const getAllBlogs = asyncHandler(async (req, res) => {
  const where = {};
  if (req.query.title) {
    where.blogTitle = { [Op.like]: `%${req.query.title}%` };
  }
  if (req.query.category) {
    where.category = req.query.category;
  }
  const blogs = await Blog.findAll({
    where,
    include: [{ model: User, as: 'User' }],
    order: [['createAt', 'DESC']],
  });
  return res
    .status(200)
    .json({ message: 'Blogs fetched.', blogs: blogs.map((b) => b.toPublicJSON()) });
});

// GET /api/blogs/:id — public
const getBlogById = asyncHandler(async (req, res) => {
  const blog = await Blog.findByPk(req.params.id, {
    include: [{ model: User, as: 'User' }],
  });
  if (!blog) {
    throw new ApiError(404, 'Blog not found.');
  }
  return res.status(200).json({ message: 'Blog fetched.', blog: blog.toPublicJSON() });
});

// PUT /api/blogs/update/:id — user (own) or admin (any)
const updateBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findByPk(req.params.id);
  if (!blog) {
    throw new ApiError(404, 'Blog not found.');
  }
  if (req.user.role !== 'admin' && blog.userId !== req.user.id) {
    throw new ApiError(403, 'You are not authorized to update this blog.');
  }
  ['blogTitle', 'blog', 'category'].forEach((f) => {
    if (Object.prototype.hasOwnProperty.call(req.body, f)) blog[f] = req.body[f];
  });
  await blog.save();
  const full = await Blog.findByPk(blog.id, { include: [{ model: User, as: 'User' }] });
  return res.status(200).json({ message: 'Blog updated.', blog: full.toPublicJSON() });
});

// DELETE /api/blogs/delete/:id — user (own) or admin (any)
const deleteBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findByPk(req.params.id);
  if (!blog) {
    throw new ApiError(404, 'Blog not found.');
  }
  if (req.user.role !== 'admin' && blog.userId !== req.user.id) {
    throw new ApiError(403, 'You are not authorized to delete this blog.');
  }
  await blog.destroy();
  return res.status(200).json({ message: 'Blog deleted.' });
});

module.exports = {
  createBlog,
  getAllBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
};
