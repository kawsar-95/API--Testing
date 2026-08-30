'use strict';

const { Op } = require('sequelize');
const BaseRepository = require('./BaseRepository');
const { Blog, User } = require('../models');

const authorInclude = { model: User, as: 'User' };

class BlogRepository extends BaseRepository {
  constructor() {
    super(Blog);
  }

  findByIdWithAuthor(id) {
    return this.findById(id, { include: [authorInclude] });
  }

  search({ title, category } = {}) {
    const where = {};
    if (title) {
      where.blogTitle = { [Op.like]: `%${title}%` };
    }
    if (category) {
      where.category = category;
    }
    return this.findAll({
      where,
      include: [authorInclude],
      order: [['createAt', 'DESC']],
    });
  }
}

module.exports = BlogRepository;
