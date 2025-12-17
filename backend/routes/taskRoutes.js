const express = require('express');
const router = express.Router();
const Task = require('../models/task');
const auth = require('../middleware/auth'); // ← ADD THIS

// GET all tasks (PROTECTED)
router.get('/', auth, async (req, res) => {
  try {
    console.log('📋 Fetching tasks for user:', req.userId);
    
    const tasks = await Task.find({ userId: req.userId });
    res.json(tasks);
  } catch (error) {
    console.error('❌ Error fetching tasks:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST create new task (PROTECTED)
router.post('/', auth, async (req, res) => {
  try {
    console.log('➕ Creating task for user:', req.userId);
    
    const task = new Task({
      ...req.body,
      userId: req.userId  // ← REAL userId from JWT
    });
    
    await task.save();
    console.log('✅ Task created:', task._id);
    
    res.status(201).json(task);
  } catch (error) {
    console.error('❌ Error creating task:', error);
    res.status(400).json({ error: error.message });
  }
});

// PUT update task (PROTECTED)
router.put('/:id', auth, async (req, res) => {
  try {
    console.log('✏️ Updating task:', req.params.id, 'for user:', req.userId);
    
    const task = await Task.findOneAndUpdate(
      { 
        _id: req.params.id, 
        userId: req.userId  // ← Ensure user owns the task
      },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.json(task);
  } catch (error) {
    console.error('❌ Error updating task:', error);
    res.status(400).json({ error: error.message });
  }
});

// DELETE task (PROTECTED)
router.delete('/:id', auth, async (req, res) => {
  try {
    console.log('🗑️ Deleting task:', req.params.id, 'for user:', req.userId);
    
    const task = await Task.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.userId  // ← Ensure user owns the task
    });
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.json({ success: true, message: 'Task deleted' });
  } catch (error) {
    console.error('❌ Error deleting task:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;