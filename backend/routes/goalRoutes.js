const express = require('express');
const router = express.Router();
const Goal = require('../models/goal');
const auth = require('../middleware/auth'); // ← ADD THIS

// Available colors
const availableColors = [
  { name: 'electric-red', label: 'Red' },
  { name: 'emerald-green', label: 'Green' },
  { name: 'bright-blue', label: 'Blue' },
  { name: 'vibrant-yellow', label: 'Yellow' }
];

// Available categories
const availableCategories = ['learning', 'health', 'work', 'personal', 'financial', 'creative'];

// GET all goals - PROTECTED
router.get('/', auth, async (req, res) => {
  try {
    const { category, completed, limit } = req.query;
    
    // Build query - USING REAL userId
    let query = { userId: req.userId }; // ← CHANGED
    
    // Filter by category if provided
    if (category) {
      query.category = category;
    }
    
    // Filter by completion status if provided
    if (completed !== undefined) {
      query.completed = completed === 'true';
    }
    
    // Get goals from database
    let goalsQuery = Goal.find(query);
    
    // Limit results if provided
    if (limit) {
      goalsQuery = goalsQuery.limit(parseInt(limit));
    }
    
    // Sort: active goals first, then by progress
    goalsQuery = goalsQuery.sort({ completed: 1, progress: -1 });
    
    const goals = await goalsQuery.exec();
    
    // Calculate overall statistics
    const totalGoals = await Goal.countDocuments(query);
    const completedGoals = await Goal.countDocuments({ ...query, completed: true });
    const avgProgressAgg = await Goal.aggregate([
      { $match: query },
      { $group: { _id: null, avgProgress: { $avg: "$progress" } } }
    ]);
    const avgProgress = avgProgressAgg.length > 0 ? Math.round(avgProgressAgg[0].avgProgress) : 0;

    res.json({
      success: true,
      data: goals,
      stats: {
        total: totalGoals,
        completed: completedGoals,
        inProgress: totalGoals - completedGoals,
        averageProgress: avgProgress,
        completionRate: totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0
      },
      meta: {
        colors: availableColors,
        categories: availableCategories
      }
    });
  } catch (error) {
    console.error('❌ Error getting goals:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch goals'
    });
  }
});

// GET single goal - PROTECTED
router.get('/:id', auth, async (req, res) => {
  try {
    const goal = await Goal.findOne({
      _id: req.params.id,
      userId: req.userId // ← CHANGED
    });
    
    if (!goal) {
      return res.status(404).json({
        success: false,
        error: 'Goal not found'
      });
    }

    res.json({
      success: true,
      data: goal
    });
  } catch (error) {
    console.error('❌ Error getting goal:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch goal'
    });
  }
});

// POST create new goal - PROTECTED
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, target, deadline, color, category } = req.body;
    
    if (!title || !target) {
      return res.status(400).json({
        success: false,
        error: 'Please provide goal title and target'
      });
    }

    const goal = new Goal({
      userId: req.userId, // ← CHANGED
      title,
      description: description || '',
      progress: 0,
      target: parseInt(target),
      deadline: deadline || 'No deadline',
      deadlineType: deadline ? 'date' : 'none',
      completed: false,
      color: color || 'electric-red',
      category: category || 'personal'
    });

    await goal.save();
    console.log('✅ Goal created for user:', req.userId);

    res.status(201).json({
      success: true,
      data: goal,
      message: 'Goal created successfully'
    });
  } catch (error) {
    console.error('❌ Error creating goal:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create goal'
    });
  }
});

// PUT update goal - PROTECTED
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, target, deadline, color, category } = req.body;

    const goal = await Goal.findOneAndUpdate(
      { 
        _id: id,
        userId: req.userId // ← CHANGED
      },
      {
        title,
        description,
        target: target ? parseInt(target) : undefined,
        deadline,
        deadlineType: deadline ? 'date' : undefined,
        color,
        category,
        updatedAt: Date.now()
      },
      { new: true, runValidators: true }
    );
    
    if (!goal) {
      return res.status(404).json({
        success: false,
        error: 'Goal not found'
      });
    }

    console.log('✅ Goal updated for user:', req.userId);

    res.json({
      success: true,
      data: goal,
      message: 'Goal updated successfully'
    });
  } catch (error) {
    console.error('❌ Error updating goal:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update goal'
    });
  }
});

// PUT update goal progress - PROTECTED
router.put('/:id/progress', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { progress } = req.body;

    const newProgress = Math.min(Math.max(parseInt(progress) || 0, 0), 100);
    const completed = newProgress === 100;

    const goal = await Goal.findOneAndUpdate(
      { 
        _id: id,
        userId: req.userId // ← CHANGED
      },
      {
        progress: newProgress,
        completed: completed,
        updatedAt: Date.now()
      },
      { new: true }
    );
    
    if (!goal) {
      return res.status(404).json({
        success: false,
        error: 'Goal not found'
      });
    }

    console.log('✅ Goal progress updated for user:', req.userId);

    res.json({
      success: true,
      data: goal,
      message: `Progress updated to ${newProgress}%`
    });
  } catch (error) {
    console.error('❌ Error updating goal progress:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update goal progress'
    });
  }
});

// PUT toggle goal completion - PROTECTED
router.put('/:id/complete', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { completed } = req.body;

    const goal = await Goal.findOneAndUpdate(
      { 
        _id: id,
        userId: req.userId // ← CHANGED
      },
      {
        completed: completed,
        progress: completed ? 100 : { $min: ["$progress", 99] },
        updatedAt: Date.now()
      },
      { new: true }
    );
    
    if (!goal) {
      return res.status(404).json({
        success: false,
        error: 'Goal not found'
      });
    }

    console.log('✅ Goal completion toggled for user:', req.userId);

    res.json({
      success: true,
      data: goal,
      message: completed ? 'Goal marked as completed!' : 'Goal marked as in progress'
    });
  } catch (error) {
    console.error('❌ Error toggling goal completion:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to toggle goal completion'
    });
  }
});

// DELETE goal - PROTECTED
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const goal = await Goal.findOneAndDelete({
      _id: id,
      userId: req.userId // ← CHANGED
    });
    
    if (!goal) {
      return res.status(404).json({
        success: false,
        error: 'Goal not found'
      });
    }

    console.log('✅ Goal deleted for user:', req.userId);

    res.json({
      success: true,
      message: 'Goal deleted successfully',
      data: goal
    });
  } catch (error) {
    console.error('❌ Error deleting goal:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete goal'
    });
  }
});

module.exports = router;