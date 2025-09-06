const express = require('express');
const { videoUpload, getPublicUrl, deleteFile } = require('../services/s3services');
const { authenticateToken } = require('../middleware/auth');
const Video = require('../models/video');

const router = express.Router();

// Upload video
router.post('/upload', authenticateToken, (req, res) => {
  videoUpload.single('video')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No video file uploaded'
      });
    }

    try {
      const { title, description } = req.body;

      if (!title) {
        return res.status(400).json({
          success: false,
          message: 'Video title is required'
        });
      }

      // Create video record in database
      const videoId = await Video.create({
        user_id: req.user.id,
        title,
        description: description || '',
        s3_key: req.file.key,
        s3_url: req.file.location,
        original_filename: req.file.originalname,
        file_size: req.file.size
      });

      await Video.updateStatus(videoId, 'ready');

      res.json({
        success: true,
        message: 'Video uploaded successfully',
        video: {
          id: videoId,
          title,
          description,
          url: req.file.location,
          filename: req.file.key
        }
      });
    } catch (error) {
      console.error('Video upload error:', error);
      res.status(500).json({
        success: false,
        message: 'Error saving video information'
      });
    }
  });
});

// Get all videos
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const videos = await Video.getAll(limit, offset);

    res.json({
      success: true,
      videos,
      pagination: {
        page,
        limit,
        total: videos.length
      }
    });
  } catch (error) {
    console.error('Get videos error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching videos'
    });
  }
});

// Get specific video
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const video = await Video.findById(id);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    // Increment view count
    await Video.incrementViews(id);

    res.json({
      success: true,
      video
    });
  } catch (error) {
    console.error('Get video error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching video'
    });
  }
});

// Get user's videos
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const videos = await Video.findByUserId(userId);

    res.json({
      success: true,
      videos
    });
  } catch (error) {
    console.error('Get user videos error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user videos'
    });
  }
});

// Delete video
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get video to check ownership and get S3 key
    const video = await Video.findById(id);
    
    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    // Check if user owns the video
    if (video.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this video'
      });
    }

    // Delete from S3
    await deleteFile(video.s3_key);

    // Delete from database
    const deleted = await Video.delete(id, req.user.id);

    if (deleted) {
      res.json({
        success: true,
        message: 'Video deleted successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to delete video'
      });
    }
  } catch (error) {
    console.error('Delete video error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting video'
    });
  }
});

module.exports = router;