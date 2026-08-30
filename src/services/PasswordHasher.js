'use strict';

const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 10;

class PasswordHasher {
  async hash(plain) {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    return bcrypt.hash(plain, salt);
  }

  compare(plain, hash) {
    return bcrypt.compare(plain, hash);
  }
}

module.exports = PasswordHasher;
