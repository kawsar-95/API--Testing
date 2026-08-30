'use strict';

const { User } = require('../models');

// Per the assignment: an admin is just a user whose role is 'admin'.
// On first run we seed a default admin so the reviewer can immediately log in.
const seedAdmin = async () => {
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@example.com';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'password123';
  const adminFirstname = process.env.SEED_ADMIN_FIRSTNAME || 'System';
  const adminLastname = process.env.SEED_ADMIN_LASTNAME || 'Admin';

  const existing = await User.findOne({ where: { email: adminEmail } });
  if (existing) {
    // Keep the seeded admin's role correct even if someone flipped it.
    if (existing.role !== 'admin') {
      existing.role = 'admin';
      await existing.save();
      console.log(`Promoted ${adminEmail} to admin role.`);
    } else {
      console.log(`Admin already exists: ${adminEmail}`);
    }
    return;
  }

  await User.create({
    firstname: adminFirstname,
    lastname: adminLastname,
    email: adminEmail,
    password: adminPassword,
    role: 'admin',
    isActive: true,
  });
  console.log(`Seeded admin user: ${adminEmail} / ${adminPassword}`);
};

module.exports = { seedAdmin };
