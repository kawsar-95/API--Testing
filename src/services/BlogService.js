'use strict';

const { NotFoundError, ForbiddenError } = require('../errors');

const UPDATABLE_BLOG_FIELDS = ['blogTitle', 'blog', 'category'];

class BlogService {
  constructor(blogRepository, blogAuthorizationPolicy) {
    this.blogRepository = blogRepository;
    this.blogAuthorizationPolicy = blogAuthorizationPolicy;
  }

  async create(userId, { blogTitle, blog, category }) {
    const created = await this.blogRepository.create({ blogTitle, blog, category, userId });
    return this.blogRepository.findByIdWithAuthor(created.id);
  }

  list(filters) {
    return this.blogRepository.search(filters);
  }

  async getById(id) {
    const blog = await this.blogRepository.findByIdWithAuthor(id);
    if (!blog) {
      throw new NotFoundError('Blog not found.');
    }
    return blog;
  }

  async update(user, blogId, updates) {
    const blog = await this.blogRepository.findById(blogId);
    if (!blog) {
      throw new NotFoundError('Blog not found.');
    }
    if (!this.blogAuthorizationPolicy.canModify(user, blog)) {
      throw new ForbiddenError('You are not authorized to update this blog.');
    }
    UPDATABLE_BLOG_FIELDS.forEach((field) => {
      if (Object.prototype.hasOwnProperty.call(updates, field)) {
        blog[field] = updates[field];
      }
    });
    await this.blogRepository.save(blog);
    return this.blogRepository.findByIdWithAuthor(blog.id);
  }

  async delete(user, blogId) {
    const blog = await this.blogRepository.findById(blogId);
    if (!blog) {
      throw new NotFoundError('Blog not found.');
    }
    if (!this.blogAuthorizationPolicy.canModify(user, blog)) {
      throw new ForbiddenError('You are not authorized to delete this blog.');
    }
    await this.blogRepository.delete(blog);
  }
}

module.exports = BlogService;
