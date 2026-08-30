'use strict';

require('dotenv').config();

const config = {
  port: parseInt(process.env.PORT, 10) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwt: {
    secret: process.env.JWT_SECRET || 'change-me',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  db: {
    dialect: (process.env.DB_DIALECT || 'mysql').toLowerCase(),
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    name: process.env.DB_NAME || 'blogdb',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    storage: process.env.DB_STORAGE || './blogdb.sqlite',
  },
};

module.exports = config;
