const bcrypt = require('bcryptjs');
const db = require('../src/models/database');

async function createTestUsers() {
  try {
    const saltRounds = 10;
    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const users = [
      { username: 'john_musician', email: 'john@example.com', role: 'musician' },
      { username: 'sarah_singer', email: 'sarah@example.com', role: 'musician' },
      { username: 'mike_listener', email: 'mike@example.com', role: 'listener' },
      { username: 'admin_user', email: 'admin@example.com', role: 'admin' }
    ];

    for (const user of users) {
      await db.execute(
        'INSERT IGNORE INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
        [user.username, user.email, hashedPassword, user.role]
      );
      console.log(`Created user: ${user.username}`);
    }

    console.log('All test users created successfully!');
    console.log('Default password for all users: password123');
    process.exit(0);
  } catch (error) {
    console.error('Error creating test users:', error);
    process.exit(1);
  }
}

createTestUsers();