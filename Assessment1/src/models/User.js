const db = require('../db'); // Note: using ../db.js instead of ./database.js
const bcrypt = require('bcryptjs');

class User {
  // Find user by email
  static async findByEmail(email) {
    let conn;
    try {
      conn = await db.getConnection();
      const rows = await conn.query('SELECT * FROM users WHERE email = ?', [email]);
      return rows[0] || null;
    } catch (error) {
      throw error;
    } finally {
      if (conn) conn.release();
    }
  }

  // Find user by username
  static async findByUsername(username) {
    let conn;
    try {
      conn = await db.getConnection();
      const rows = await conn.query('SELECT * FROM users WHERE username = ?', [username]);
      return rows[0] || null;
    } catch (error) {
      throw error;
    } finally {
      if (conn) conn.release();
    }
  }

  // Find user by ID
  static async findById(id) {
    let conn;
    try {
      conn = await db.getConnection();
      const rows = await conn.query(
        'SELECT id, username, email, role, profile_picture, bio, created_at FROM users WHERE id = ?',
        [id]
      );
      return rows[0] || null;
    } catch (error) {
      throw error;
    } finally {
      if (conn) conn.release();
    }
  }

  // Create new user
  static async create(userData) {
    let conn;
    try {
      const { username, email, password, role = 'musician' } = userData;
      
      // Hash password
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);
      
      conn = await db.getConnection();
      const result = await conn.query(
        'INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
        [username, email, passwordHash, role]
      );
      
      return result.insertId;
    } catch (error) {
      throw error;
    } finally {
      if (conn) conn.release();
    }
  }

  // Verify password
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  // Update user profile
  static async updateProfile(id, updateData) {
    let conn;
    try {
      const { bio, profile_picture } = updateData;
      
      conn = await db.getConnection();
      const result = await conn.query(
        'UPDATE users SET bio = ?, profile_picture = ? WHERE id = ?',
        [bio, profile_picture, id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    } finally {
      if (conn) conn.release();
    }
  }
}

module.exports = User;