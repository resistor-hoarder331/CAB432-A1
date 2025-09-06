// In-memory video storage
const videos = [];
let nextId = 1;

class InMemoryVideo {
  // Create new video record
  static async create(videoData) {
    const {
      user_id,
      title,
      description,
      s3_key,
      s3_url,
      original_filename,
      file_size
    } = videoData;
    
    const newVideo = {
      id: nextId++,
      user_id,
      title,
      description,
      s3_key,
      s3_url,
      original_filename,
      file_size,
      duration: null,
      status: 'ready',
      views: 0,
      created_at: new Date(),
      updated_at: new Date()
    };
    
    videos.push(newVideo);
    return newVideo.id;
  }

  // Get all videos with user info
  static async getAll(limit = 20, offset = 0) {
    // For simplicity, we'll just return videos without joining user data
    // In a real app, you'd need to fetch user data separately
    const sortedVideos = videos
      .filter(v => v.status === 'ready')
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(offset, offset + limit);
    
    // Add mock username for display
    return sortedVideos.map(video => ({
      ...video,
      username: `user_${video.user_id}`,
      profile_picture: null
    }));
  }

  // Get video by ID
  static async findById(id) {
    const video = videos.find(v => v.id === parseInt(id));
    if (!video) return null;
    
    return {
      ...video,
      username: `user_${video.user_id}`,
      profile_picture: null
    };
  }

  // Get videos by user
  static async findByUserId(userId) {
    return videos
      .filter(v => v.user_id === parseInt(userId))
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  // Update video status
  static async updateStatus(id, status) {
    const videoIndex = videos.findIndex(v => v.id === parseInt(id));
    if (videoIndex === -1) return false;
    
    videos[videoIndex].status = status;
    videos[videoIndex].updated_at = new Date();
    return true;
  }

  // Delete video
  static async delete(id, userId) {
    const videoIndex = videos.findIndex(v => v.id === parseInt(id) && v.user_id === parseInt(userId));
    if (videoIndex === -1) return false;
    
    videos.splice(videoIndex, 1);
    return true;
  }

  // Increment view count
  static async incrementViews(id) {
    const videoIndex = videos.findIndex(v => v.id === parseInt(id));
    if (videoIndex !== -1) {
      videos[videoIndex].views += 1;
    }
  }

  // Get all videos (for debugging)
  static async getAll() {
    return videos;
  }
}

module.exports = InMemoryVideo;