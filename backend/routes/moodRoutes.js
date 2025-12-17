const express = require('express');
const router = express.Router();
const Mood = require('../models/mood');
const auth = require('../middleware/auth'); // ← ADD THIS

// Available mood types
const moodTypes = [
  { id: 'excited', label: 'Excited', icon: 'Zap', color: 'electric-red', emoji: '⚡' },
  { id: 'happy', label: 'Happy', icon: 'Smile', color: 'emerald-green', emoji: '😊' },
  { id: 'neutral', label: 'Neutral', icon: 'Meh', color: 'bright-blue', emoji: '😐' },
  { id: 'sad', label: 'Sad', icon: 'Frown', color: 'vibrant-yellow', emoji: '😔' },
  { id: 'stressed', label: 'Stressed', icon: 'AlertTriangle', color: 'electric-red', emoji: '😫' },
  { id: 'angry', label: 'Angry', icon: 'Frown', color: 'electric-red', emoji: '😠' }
];

// GET all mood entries - PROTECTED
router.get('/', auth, async (req, res) => {
  try {
    const { date, limit } = req.query;
    
    // Build query - USING REAL userId
    let query = { userId: req.userId }; // ← CHANGED
    
    // Filter by date if provided
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      query.date = { $gte: startDate, $lte: endDate };
    }
    
    // Get moods from database
    let moodsQuery = Mood.find(query).sort({ date: -1 });
    
    // Limit results if provided
    if (limit) {
      moodsQuery = moodsQuery.limit(parseInt(limit));
    }
    
    const moods = await moodsQuery.exec();

    res.json({
      success: true,
      count: moods.length,
      data: moods,
      moodTypes: moodTypes
    });
  } catch (error) {
    console.error('❌ Error getting moods:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch mood entries'
    });
  }
});

// GET today's mood entries - PROTECTED
router.get('/today', auth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayMoods = await Mood.find({
      userId: req.userId, // ← CHANGED
      date: { $gte: today, $lt: tomorrow }
    }).sort({ date: -1 });
    
    // Calculate average energy for today
    const avgEnergy = todayMoods.length > 0
      ? todayMoods.reduce((sum, entry) => sum + entry.energyLevel, 0) / todayMoods.length
      : 0;

    res.json({
      success: true,
      data: todayMoods,
      averageEnergy: Math.round(avgEnergy),
      count: todayMoods.length
    });
  } catch (error) {
    console.error('❌ Error getting today\'s moods:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch today\'s mood entries'
    });
  }
});

// GET mood statistics - PROTECTED
router.get('/stats', auth, async (req, res) => {
  try {
    const { period = 'week' } = req.query;
    
    // For now, return sample stats
    const stats = {
      period: period,
      userId: req.userId, // ← Added to show it's personalized
      averageEnergy: 72,
      mostCommonMood: 'happy',
      energyTrend: '+5%',
      moodsByDay: [
        { day: 'Mon', energy: 75, mood: 'productive' },
        { day: 'Tue', energy: 80, mood: 'excited' },
        { day: 'Wed', energy: 65, mood: 'neutral' },
        { day: 'Thu', energy: 70, mood: 'happy' },
        { day: 'Fri', energy: 85, mood: 'excited' },
        { day: 'Sat', energy: 60, mood: 'neutral' },
        { day: 'Sun', energy: 55, mood: 'sad' }
      ]
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('❌ Error getting mood stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch mood statistics'
    });
  }
});

// GET single mood entry - PROTECTED
router.get('/:id', auth, async (req, res) => {
  try {
    const mood = await Mood.findOne({
      _id: req.params.id,
      userId: req.userId // ← CHANGED
    });
    
    if (!mood) {
      return res.status(404).json({
        success: false,
        error: 'Mood entry not found'
      });
    }

    res.json({
      success: true,
      data: mood
    });
  } catch (error) {
    console.error('❌ Error getting mood:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch mood entry'
    });
  }
});

// POST create new mood entry - PROTECTED
router.post('/', auth, async (req, res) => {
  try {
    const { mood, energyLevel, notes, factors } = req.body;
    
    if (!mood || energyLevel === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Please provide mood and energy level'
      });
    }

    const moodEntry = new Mood({
      userId: req.userId, // ← CHANGED
      mood,
      energyLevel: parseInt(energyLevel),
      notes: notes || '',
      factors: factors || []
    });

    await moodEntry.save();
    console.log('✅ Mood created for user:', req.userId);

    res.status(201).json({
      success: true,
      data: moodEntry,
      message: 'Mood recorded successfully'
    });
  } catch (error) {
    console.error('❌ Error creating mood:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to record mood'
    });
  }
});

// PUT update mood entry - PROTECTED
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { mood, energyLevel, notes, factors } = req.body;

    const moodEntry = await Mood.findOneAndUpdate(
      { 
        _id: id,
        userId: req.userId // ← CHANGED
      },
      {
        mood,
        energyLevel: energyLevel !== undefined ? parseInt(energyLevel) : undefined,
        notes,
        factors,
        date: Date.now()
      },
      { new: true, runValidators: true }
    );
    
    if (!moodEntry) {
      return res.status(404).json({
        success: false,
        error: 'Mood entry not found'
      });
    }

    console.log('✅ Mood updated for user:', req.userId);

    res.json({
      success: true,
      data: moodEntry,
      message: 'Mood updated successfully'
    });
  } catch (error) {
    console.error('❌ Error updating mood:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update mood'
    });
  }
});

// DELETE mood entry - PROTECTED
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const moodEntry = await Mood.findOneAndDelete({
      _id: id,
      userId: req.userId // ← CHANGED
    });
    
    if (!moodEntry) {
      return res.status(404).json({
        success: false,
        error: 'Mood entry not found'
      });
    }

    console.log('✅ Mood deleted for user:', req.userId);

    res.json({
      success: true,
      message: 'Mood deleted successfully',
      data: moodEntry
    });
  } catch (error) {
    console.error('❌ Error deleting mood:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete mood'
    });
  }
});

module.exports = router;