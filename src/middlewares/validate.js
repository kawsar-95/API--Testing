'use strict';

const { ValidationError } = require('joi');
const { BadRequestError } = require('../errors');

// Reusable validator factory — wraps a Joi schema into an Express middleware.
const validate = (schema, target = 'body') => (req, _res, next) => {
  const data = target === 'query' ? req.query : target === 'params' ? req.params : req.body;
  const { error, value } = schema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
    convert: true,
  });
  if (error) {
    const message = error.details.map((d) => d.message).join('; ');
    return next(new BadRequestError(message));
  }
  // Persist the cleaned payload back onto the request.
  // `req.query` is read-only in Express 5, so copy properties onto it instead
  // of reassigning. `req.params` accepts Object.assign safely.
  if (target === 'query') {
    Object.keys(req.query).forEach((k) => delete req.query[k]);
    Object.assign(req.query, value);
  } else if (target === 'params') {
    Object.assign(req.params, value);
  } else {
    req.body = value;
  }
  return next();
};

module.exports = validate;
