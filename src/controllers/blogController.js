'use strict';

const asyncHandler = require('../utils/asyncHandler');

class BlogController {
  constructor(blogService) {
    this.blogService = blogService;
  }

  // POST /api/blogs/create — auth required (user or admin)
  createBlog = asyncHandler(async (req, res) => {
    const blog = await this.blogService.create(req.user.id, req.body);
    return res.status(201).json({ message: 'Blog created successfully.', blog: blog.toPublicJSON() });
  });

  // GET /api/blogs — public, supports ?title=&category= (partial match)
  getAllBlogs = asyncHandler(async (req, res) => {
    const blogs = await this.blogService.list(req.query);
    return res
      .status(200)
      .json({ message: 'Blogs fetched.', blogs: blogs.map((b) => b.toPublicJSON()) });
  });

  // GET /api/blogs/:id — public
  getBlogById = asyncHandler(async (req, res) => {
    const blog = await this.blogService.getById(req.params.id);
    return res.status(200).json({ message: 'Blog fetched.', blog: blog.toPublicJSON() });
  });

  // PUT /api/blogs/update/:id — user (own) or admin (any)
  updateBlog = asyncHandler(async (req, res) => {
    const blog = await this.blogService.update(req.user, req.params.id, req.body);
    return res.status(200).json({ message: 'Blog updated.', blog: blog.toPublicJSON() });
  });

  // DELETE /api/blogs/delete/:id — user (own) or admin (any)
  deleteBlog = asyncHandler(async (req, res) => {
    await this.blogService.delete(req.user, req.params.id);
    return res.status(200).json({ message: 'Blog deleted.' });
  });
}

module.exports = BlogController;
