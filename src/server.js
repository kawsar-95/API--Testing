'use strict';

const app = require('./app');
const { connectDB } = require('./config/database');
const { adminSeeder } = require('./composition-root');
const config = require('./config');

(async () => {
  try {
    await connectDB();
    await adminSeeder.seed();
    app.listen(config.port, () => {
      console.log(`Server is running on http://localhost:${config.port}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
})();
