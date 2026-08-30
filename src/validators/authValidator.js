'use strict';

const Joi = require('joi');

const registerSchema = Joi.object({
  firstname: Joi.string().trim().min(1).max(100).required(),
  lastname: Joi.string().trim().min(1).max(100).required(),
  email: Joi.string().trim().lowercase().email().required(),
  password: Joi.string().min(8).max(255).required(),
  // Explicitly forbid role/isActive from the registration payload per spec.
  role: Joi.forbidden(),
  isActive: Joi.forbidden(),
});

const loginSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required(),
  password: Joi.string().required(),
});

const updateProfileSchema = Joi.object({
  firstname: Joi.string().trim().min(1).max(100),
  lastname: Joi.string().trim().min(1).max(100),
  email: Joi.string().trim().lowercase().email(),
  // Users must never be able to escalate themselves.
  role: Joi.forbidden(),
  isActive: Joi.forbidden(),
}).min(1);

const updatePasswordSchema = Joi.object({
  password: Joi.string().min(8).max(255).required(),
});

const updateStatusSchema = Joi.object({
  isActive: Joi.boolean().required(),
});

module.exports = {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  updatePasswordSchema,
  updateStatusSchema,
};
