const express = require('express');
const User = require('../models/InMemoryUser'); 
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get current user's profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        bio: user.bio,
        profile_picture: user.profile_picture,
        created_at: user.created_at
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile'
    });
  }
});

// Get public profile of any user
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Return only public information
    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        bio: user.bio,
        profile_picture: user.profile_picture,
        created_at: user.created_at
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user'
    });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { bio, profile_picture } = req.body;
    
    const success = await User.updateProfile(req.user.id, {
      bio,
      profile_picture
    });

    if (!success) {
      return res.status(400).json({
        success: false,
        message: 'Failed to update profile'
      });
    }

    // Get updated user data
    const updatedUser = await User.findById(req.user.id);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        role: updatedUser.role,
        bio: updatedUser.bio,
        profile_picture: updatedUser.profile_picture
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile'
    });
  }
});

module.exports = router;