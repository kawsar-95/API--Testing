'use strict';

const { Sequelize } = require('sequelize');
const config = require('./index');

const sequelize = new Sequelize(
  config.db.name,
  config.db.user,
  config.db.password,
  {
    host: config.db.host,
    port: config.db.port,
    dialect: config.db.dialect,
    storage: config.db.dialect === 'sqlite' ? config.db.storage : undefined,
    logging: false,
    define: {
      underscored: false,
      freezeTableName: false,
    },
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    // `alter: true` is too aggressive for SQLite — it tries to drop tables on
    // every restart and trips the FK constraint from `blogs.userId`. For dev
    // we just create-if-missing; for production the schema is managed by
    // migrations, not by `sync()`.
    await sequelize.sync({ alter: false, force: false });
    console.log(
      `Database connection established (${config.db.dialect}: ${
        config.db.dialect === 'sqlite' ? config.db.storage : config.db.name
      })`
    );
  } catch (error) {
    console.error('Unable to connect to the database:', error.message);
    throw error;
  }
};

module.exports = { sequelize, connectDB };
