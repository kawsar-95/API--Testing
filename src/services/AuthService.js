'use strict';

const { ConflictError, UnauthorizedError, ForbiddenError } = require('../errors');

class AuthService {
  constructor(userRepository, passwordHasher, tokenService) {
    this.userRepository = userRepository;
    this.passwordHasher = passwordHasher;
    this.tokenService = tokenService;
  }

  async register({ firstname, lastname, email, password }) {
    const existing = await this.userRepository.findByEmail(email);
    if (existing) {
      throw new ConflictError('Email is already registered.');
    }

    const hashed = await this.passwordHasher.hash(password);
    // role and isActive are always defaulted server-side.
    return this.userRepository.create({
      firstname,
      lastname,
      email,
      password: hashed,
      role: 'user',
      isActive: true,
    });
  }

  async login({ email, password }) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password.');
    }

    if (!user.isActive) {
      throw new ForbiddenError('Your account is deactivated. Contact an admin.');
    }

    const ok = await this.passwordHasher.compare(password, user.password);
    if (!ok) {
      throw new UnauthorizedError('Invalid email or password.');
    }

    const token = this.tokenService.issue({ id: user.id, role: user.role });
    return { user, token };
  }
}

module.exports = AuthService;
