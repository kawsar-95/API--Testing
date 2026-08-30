'use strict';

// Generic Sequelize-model data access. Concrete repositories extend this and
// add only the query shapes their domain actually needs (LSP: any subclass
// can stand in wherever this base contract is expected).
class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  findAll(options = {}) {
    return this.model.findAll(options);
  }

  findById(id, options = {}) {
    return this.model.findByPk(id, options);
  }

  findOne(where, options = {}) {
    return this.model.findOne({ where, ...options });
  }

  create(attrs) {
    return this.model.create(attrs);
  }

  save(instance) {
    return instance.save();
  }

  delete(instance) {
    return instance.destroy();
  }
}

module.exports = BaseRepository;
