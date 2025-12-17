const express = require('express');
const router = express.Router();
const Note = require('../models/note');
const auth = require('../middleware/auth'); // ← ADD THIS

// GET all notes - PROTECTED
router.get('/', auth, async (req, res) => {
  try {
    console.log('📝 Getting notes for user:', req.userId);
    
    const notes = await Note.find({ userId: req.userId }); // ← CHANGED
    
    res.json({
      success: true,
      count: notes.length,
      data: notes,
      source: 'mongodb'
    });
  } catch (error) {
    console.error('❌ Error getting notes:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET single note - PROTECTED
router.get('/:id', auth, async (req, res) => {
  try {
    console.log('🔍 Getting note:', req.params.id, 'for user:', req.userId);
    
    const note = await Note.findOne({
      _id: req.params.id,
      userId: req.userId // ← CHANGED
    });
    
    if (!note) {
      return res.status(404).json({ success: false, error: 'Note not found' });
    }
    
    res.json({ success: true, data: note });
  } catch (error) {
    console.error('❌ Error getting note:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// CREATE a new note - PROTECTED
router.post('/', auth, async (req, res) => {
  try {
    console.log('➕ Creating note for user:', req.userId);
    
    const note = new Note({
      ...req.body,
      userId: req.userId // ← CHANGED
    });
    
    await note.save();
    console.log('✅ Note created:', note._id);
    
    res.status(201).json({
      success: true,
      data: note
    });
  } catch (error) {
    console.error('❌ Error creating note:', error);
    res.status(400).json({ success: false, error: error.message });
  }
});

// UPDATE a note - PROTECTED
router.put('/:id', auth, async (req, res) => {
  try {
    console.log('✏️ Updating note:', req.params.id, 'for user:', req.userId);
    
    const note = await Note.findOneAndUpdate(
      { 
        _id: req.params.id,
        userId: req.userId // ← CHANGED
      },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!note) {
      return res.status(404).json({ success: false, error: 'Note not found' });
    }
    
    console.log('✅ Note updated:', note._id);
    
    res.json({ success: true, data: note });
  } catch (error) {
    console.error('❌ Error updating note:', error);
    res.status(400).json({ success: false, error: error.message });
  }
});

// DELETE a note - PROTECTED
router.delete('/:id', auth, async (req, res) => {
  try {
    console.log('🗑️ Deleting note:', req.params.id, 'for user:', req.userId);
    
    const note = await Note.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId // ← CHANGED
    });
    
    if (!note) {
      return res.status(404).json({ success: false, error: 'Note not found' });
    }
    
    console.log('✅ Note deleted:', note._id);
    
    res.json({ success: true, data: note });
  } catch (error) {
    console.error('❌ Error deleting note:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;