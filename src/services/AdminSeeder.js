'use strict';

// Per the assignment: an admin is just a user whose role is 'admin'.
// On first run we seed a default admin so the reviewer can immediately log in.
class AdminSeeder {
  constructor(userRepository, passwordHasher) {
    this.userRepository = userRepository;
    this.passwordHasher = passwordHasher;
  }

  async seed() {
    const email = process.env.SEED_ADMIN_EMAIL || 'admin@example.com';
    const password = process.env.SEED_ADMIN_PASSWORD || 'password123';
    const firstname = process.env.SEED_ADMIN_FIRSTNAME || 'System';
    const lastname = process.env.SEED_ADMIN_LASTNAME || 'Admin';

    const existing = await this.userRepository.findByEmail(email);
    if (existing) {
      if (existing.role !== 'admin') {
        existing.role = 'admin';
        await this.userRepository.save(existing);
        console.log(`Promoted ${email} to admin role.`);
      } else {
        console.log(`Admin already exists: ${email}`);
      }
      return;
    }

    const hashed = await this.passwordHasher.hash(password);
    await this.userRepository.create({
      firstname,
      lastname,
      email,
      password: hashed,
      role: 'admin',
      isActive: true,
    });
    console.log(`Seeded admin user: ${email} / ${password}`);
  }
}

module.exports = AdminSeeder;
