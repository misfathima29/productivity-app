const express = require('express');
const router = express.Router();
const User = require('../models/user');
const auth = require('../middleware/auth');

// @route   GET /api/settings
// @desc    Get user settings
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('settings');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user.settings || {}
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @route   PUT /api/settings
// @desc    Update user settings
// @access  Private
router.put('/', auth, async (req, res) => {
  try {
    const { settings } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: { settings } },
      { new: true, runValidators: true }
    ).select('settings');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user.settings,
      message: 'Settings updated successfully'
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @route   PUT /api/settings/dark-mode
// @desc    Toggle dark mode
// @access  Private
router.put('/dark-mode', auth, async (req, res) => {
  try {
    const { darkMode } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: { 'settings.darkMode': darkMode } },
      { new: true }
    ).select('settings.darkMode');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user.settings.darkMode,
      message: 'Dark mode updated'
    });
  } catch (error) {
    console.error('Error updating dark mode:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

module.exports = router;