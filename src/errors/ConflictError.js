'use strict';

const ApiError = require('./ApiError');

class ConflictError extends ApiError {
  constructor(message) {
    super(409, message);
  }
}

module.exports = ConflictError;
