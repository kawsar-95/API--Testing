'use strict';

const User = require('./User');
const Blog = require('./Blog');

// A user owns many blogs; a blog belongs to one user.
User.hasMany(Blog, {
  foreignKey: 'userId',
  as: 'Blogs',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

Blog.belongsTo(User, {
  foreignKey: 'userId',
  as: 'User',
});

module.exports = { User, Blog };
