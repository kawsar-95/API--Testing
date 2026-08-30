'use strict';

const Joi = require('joi');

const createBlogSchema = Joi.object({
  blogTitle: Joi.string().trim().min(1).max(255).required(),
  blog: Joi.string().trim().min(1).required(),
  category: Joi.string().trim().min(1).max(100).required(),
  // userId must never come from the client.
  userId: Joi.forbidden(),
});

const updateBlogSchema = Joi.object({
  blogTitle: Joi.string().trim().min(1).max(255),
  blog: Joi.string().trim().min(1),
  category: Joi.string().trim().min(1).max(100),
  userId: Joi.forbidden(),
}).min(1);

const idParamSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

const listQuerySchema = Joi.object({
  title: Joi.string().trim().allow(''),
  category: Joi.string().trim().allow(''),
});

module.exports = {
  createBlogSchema,
  updateBlogSchema,
  idParamSchema,
  listQuerySchema,
};
