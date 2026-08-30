'use strict';

const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

class User extends Model {
  // Helper: strip sensitive fields before returning to clients.
  toSafeJSON() {
    const { id, firstname, lastname, email, isActive, role, createAt, updateAt } =
      this.get();
    return { id, firstname, lastname, email, isActive, role, createAt, updateAt };
  }

  async checkPassword(plain) {
    return bcrypt.compare(plain, this.password);
  }
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    firstname: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Firstname is required.' },
        len: {
          args: [1, 100],
          msg: 'Firstname must be 1–100 characters.',
        },
      },
    },
    lastname: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Lastname is required.' },
        len: {
          args: [1, 100],
          msg: 'Lastname must be 1–100 characters.',
        },
      },
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: { msg: 'Email is already registered.' },
      validate: {
        notEmpty: { msg: 'Email is required.' },
        isEmail: { msg: 'Email must be a valid email address.' },
      },
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Password is required.' },
        len: {
          args: [8, 255],
          msg: 'Password must be at least 8 characters long.',
        },
      },
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    role: {
      type: DataTypes.ENUM('user', 'admin'),
      allowNull: false,
      defaultValue: 'user',
    },
    createAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'createAt',
    },
    updateAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'updateAt',
    },
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
    createdAt: 'createAt',
    updatedAt: 'updateAt',
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
    },
  }
);

module.exports = User;
