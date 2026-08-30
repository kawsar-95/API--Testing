'use strict';

// Tiny wrapper so async controllers automatically forward errors to Express.
module.exports = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
