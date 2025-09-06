const db = require('../db');

class Video {
  // Create new video record
  static async create(videoData) {
    let conn;
    try {
      const {
        user_id,
        title,
        description,
        s3_key,
        s3_url,
        original_filename,
        file_size
      } = videoData;
      
      conn = await db.getConnection();
      const result = await conn.query(
        `INSERT INTO videos (user_id, title, description, s3_key, s3_url, original_filename, file_size) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [user_id, title, description, s3_key, s3_url, original_filename, file_size]
      );
      
      return result.insertId;
    } catch (error) {
      throw error;
    } finally {
      if (conn) conn.release();
    }
  }

  // Get all videos with user info
  static async getAll(limit = 20, offset = 0) {
    let conn;
    try {
      conn = await db.getConnection();
      const rows = await conn.query(
        `SELECT v.*, u.username, u.profile_picture 
         FROM videos v 
         JOIN users u ON v.user_id = u.id 
         WHERE v.status = 'ready'
         ORDER BY v.created_at DESC 
         LIMIT ? OFFSET ?`,
        [limit, offset]
      );
      return rows;
    } catch (error) {
      throw error;
    } finally {
      if (conn) conn.release();
    }
  }

  // Get video by ID
  static async findById(id) {
    let conn;
    try {
      conn = await db.getConnection();
      const rows = await conn.query(
        `SELECT v.*, u.username, u.profile_picture 
         FROM videos v 
         JOIN users u ON v.user_id = u.id 
         WHERE v.id = ?`,
        [id]
      );
      return rows[0] || null;
    } catch (error) {
      throw error;
    } finally {
      if (conn) conn.release();
    }
  }

  // Get videos by user
  static async findByUserId(userId) {
    let conn;
    try {
      conn = await db.getConnection();
      const rows = await conn.query(
        `SELECT * FROM videos WHERE user_id = ? ORDER BY created_at DESC`,
        [userId]
      );
      return rows;
    } catch (error) {
      throw error;
    } finally {
      if (conn) conn.release();
    }
  }

  // Update video status (for processing)
  static async updateStatus(id, status) {
    let conn;
    try {
      conn = await db.getConnection();
      const result = await conn.query(
        'UPDATE videos SET status = ? WHERE id = ?',
        [status, id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    } finally {
      if (conn) conn.release();
    }
  }

  // Delete video
  static async delete(id, userId) {
    let conn;
    try {
      conn = await db.getConnection();
      const result = await conn.query(
        'DELETE FROM videos WHERE id = ? AND user_id = ?',
        [id, userId]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    } finally {
      if (conn) conn.release();
    }
  }

  // Increment view count
  static async incrementViews(id) {
    let conn;
    try {
      conn = await db.getConnection();
      await conn.query(
        'UPDATE videos SET views = views + 1 WHERE id = ?',
        [id]
      );
    } catch (error) {
      console.error('Error incrementing views:', error);
    } finally {
      if (conn) conn.release();
    }
  }
}

module.exports = Video;