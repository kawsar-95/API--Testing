'use strict';

const { NotFoundError, BadRequestError, ConflictError } = require('../errors');

const UPDATABLE_PROFILE_FIELDS = ['firstname', 'lastname', 'email'];

class UserService {
  constructor(userRepository, passwordHasher) {
    this.userRepository = userRepository;
    this.passwordHasher = passwordHasher;
  }

  listAll() {
    return this.userRepository.findAll({ order: [['id', 'ASC']] });
  }

  async getById(id) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundError('User not found.');
    }
    return user;
  }

  async updateStatus(actingAdmin, targetId, isActive) {
    const user = await this.getById(targetId);
    // Admins should not be able to deactivate themselves accidentally.
    if (user.id === actingAdmin.id && isActive === false) {
      throw new BadRequestError('You cannot deactivate your own admin account.');
    }
    user.isActive = isActive;
    await this.userRepository.save(user);
    return user;
  }

  async updateOwnProfile(user, rawUpdates) {
    const updates = {};
    UPDATABLE_PROFILE_FIELDS.forEach((field) => {
      if (Object.prototype.hasOwnProperty.call(rawUpdates, field)) {
        updates[field] = rawUpdates[field];
      }
    });
    if (Object.keys(updates).length === 0) {
      throw new BadRequestError('No updatable fields provided.');
    }

    if (updates.email && updates.email !== user.email) {
      const conflict = await this.userRepository.findByEmail(updates.email);
      if (conflict) {
        throw new ConflictError('Email is already registered.');
      }
    }

    Object.assign(user, updates);
    await this.userRepository.save(user);
    return user;
  }

  async updatePassword(user, newPlainPassword) {
    user.password = await this.passwordHasher.hash(newPlainPassword);
    await this.userRepository.save(user);
  }
}

module.exports = UserService;
