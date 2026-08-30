'use strict';

const { sign, verify } = require('../utils/jwt');

// Thin class seam so AuthService / the auth middleware depend on an
// injectable collaborator instead of requiring utils/jwt directly.
class TokenService {
  issue(payload) {
    return sign(payload);
  }

  verify(token) {
    return verify(token);
  }
}

module.exports = TokenService;
