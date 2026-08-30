'use strict';

const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');

class Blog extends Model {
  // Shape the public payload expected by the Guest APIs (blog + safe author).
  toPublicJSON(author) {
    const safeAuthor = author
      ? {
          id: author.id,
          firstname: author.firstname,
          lastname: author.lastname,
        }
      : this.User
      ? {
          id: this.User.id,
          firstname: this.User.firstname,
          lastname: this.User.lastname,
        }
      : null;
    return {
      id: this.id,
      blogTitle: this.blogTitle,
      blog: this.blog,
      category: this.category,
      userId: this.userId,
      author: safeAuthor,
      createAt: this.createAt,
      updateAt: this.updateAt,
    };
  }
}

Blog.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    blogTitle: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Blog title is required.' },
        len: {
          args: [1, 255],
          msg: 'Blog title must be 1–255 characters.',
        },
      },
    },
    blog: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Blog content is required.' },
      },
    },
    category: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Category is required.' },
        len: {
          args: [1, 100],
          msg: 'Category must be 1–100 characters.',
        },
      },
    },
    createAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'createAt',
    },
    updateAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'updateAt',
    },
  },
  {
    sequelize,
    modelName: 'Blog',
    tableName: 'blogs',
    timestamps: true,
    createdAt: 'createAt',
    updatedAt: 'updateAt',
  }
);

module.exports = Blog;
