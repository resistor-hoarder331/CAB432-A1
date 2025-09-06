const bcrypt = require('bcryptjs');

// In-memory user storage
const users = [];
let nextId = 1;

// Pre-populate with some test users
async function initializeUsers() {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash('password123', saltRounds);
  
  const testUsers = [
    { username: 'john_musician', email: 'john@example.com', role: 'musician', password_hash: hashedPassword },
    { username: 'sarah_singer', email: 'sarah@example.com', role: 'musician', password_hash: hashedPassword },
    { username: 'mike_listener', email: 'mike@example.com', role: 'listener', password_hash: hashedPassword },
    { username: 'admin_user', email: 'admin@example.com', role: 'admin', password_hash: hashedPassword },
    { username: 'test_user', email: 'test@example.com', role: 'musician', password_hash: hashedPassword }
  ];
  
  testUsers.forEach(userData => {
    users.push({
      id: nextId++,
      ...userData,
      bio: null,
      profile_picture: null,
      created_at: new Date()
    });
  });
  
  console.log(`Initialized ${users.length} test users. Default password: password123`);
}

// Initialize users immediately
initializeUsers();

class InMemoryUser {
  // Find user by email
  static async findByEmail(email) {
    return users.find(user => user.email === email) || null;
  }

  // Find user by username
  static async findByUsername(username) {
    return users.find(user => user.username === username) || null;
  }

  // Find user by ID
  static async findById(id) {
    const user = users.find(user => user.id === parseInt(id));
    if (!user) return null;
    
    // Return user without password_hash
    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  // Create new user
  static async create(userData) {
    const { username, email, password, role = 'musician' } = userData;
    
    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    const newUser = {
      id: nextId++,
      username,
      email,
      password_hash: passwordHash,
      role,
      bio: null,
      profile_picture: null,
      created_at: new Date()
    };
    
    users.push(newUser);
    return newUser.id;
  }

  // Verify password
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  // Update user profile
  static async updateProfile(id, updateData) {
    const userIndex = users.findIndex(user => user.id === parseInt(id));
    if (userIndex === -1) return false;
    
    const { bio, profile_picture } = updateData;
    users[userIndex] = {
      ...users[userIndex],
      bio: bio !== undefined ? bio : users[userIndex].bio,
      profile_picture: profile_picture !== undefined ? profile_picture : users[userIndex].profile_picture
    };
    
    return true;
  }

  // Get all users (for debugging)
  static async getAll() {
    return users.map(user => {
      const { password_hash, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
  }
}

module.exports = InMemoryUser;
