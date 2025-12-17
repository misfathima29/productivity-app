const express = require('express');
const router = express.Router();
const CalendarEvent = require('../models/calendarEvent');
const auth = require('../middleware/auth'); // ← ADD THIS

// GET all events (with optional month/year filter) - PROTECTED
router.get('/events', auth, async (req, res) => {
  try {
    const { month, year } = req.query;
    console.log('📅 GET events for user:', req.userId);

    // Build query - USING REAL userId
    let query = { userId: req.userId }; // ← CHANGED
    
    if (month && year) {
      query.month = parseInt(month);
      query.year = parseInt(year);
    }

    const events = await CalendarEvent.find(query);
    
    res.json({
      success: true,
      count: events.length,
      data: events
    });
  } catch (error) {
    console.error('❌ Error getting events:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch events'
    });
  }
});

// GET single event - PROTECTED
router.get('/events/:id', auth, async (req, res) => {
  try {
    const event = await CalendarEvent.findOne({
      _id: req.params.id,
      userId: req.userId // ← CHANGED
    });
    
    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }

    res.json({
      success: true,
      data: event
    });
  } catch (error) {
    console.error('❌ Error getting event:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch event'
    });
  }
});

// POST create new event - PROTECTED
router.post('/events', auth, async (req, res) => {
  try {
    const { title, description, day, month, year, color } = req.body;
    console.log('➕ Creating event for user:', req.userId);

    if (!title || !day || !month || !year) {
      return res.status(400).json({
        success: false,
        error: 'Please provide title, day, month, and year'
      });
    }

    const event = new CalendarEvent({
      userId: req.userId, // ← CHANGED
      title,
      description: description || '',
      day: parseInt(day),
      month: parseInt(month),
      year: parseInt(year),
      color: color || 'bright-blue'
    });

    await event.save();
    console.log('✅ Event created for user:', req.userId);

    res.status(201).json({
      success: true,
      data: event,
      message: 'Event created successfully'
    });
  } catch (error) {
    console.error('❌ Error creating event:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create event'
    });
  }
});

// PUT update event - PROTECTED
router.put('/events/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, day, month, year, color } = req.body;
    console.log('✏️ Updating event:', id, 'for user:', req.userId);

    const event = await CalendarEvent.findOneAndUpdate(
      { 
        _id: id,
        userId: req.userId // ← CHANGED
      },
      {
        title,
        description,
        day: day !== undefined ? parseInt(day) : undefined,
        month: month !== undefined ? parseInt(month) : undefined,
        year: year !== undefined ? parseInt(year) : undefined,
        color,
        updatedAt: Date.now()
      },
      { new: true, runValidators: true }
    );
    
    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }

    console.log('✅ Event updated:', event._id);

    res.json({
      success: true,
      data: event,
      message: 'Event updated successfully'
    });
  } catch (error) {
    console.error('❌ Error updating event:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update event'
    });
  }
});

// DELETE event - PROTECTED
router.delete('/events/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🗑️ Deleting event:', id, 'for user:', req.userId);

    const event = await CalendarEvent.findOneAndDelete({
      _id: id,
      userId: req.userId // ← CHANGED
    });
    
    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }

    console.log('✅ Event deleted:', event._id);

    res.json({
      success: true,
      message: 'Event deleted successfully',
      data: event
    });
  } catch (error) {
    console.error('❌ Error deleting event:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete event'
    });
  }
});

// GET events count for debugging - PROTECTED
router.get('/debug', auth, async (req, res) => {
  const events = await CalendarEvent.find({ userId: req.userId }); // ← CHANGED
  res.json({
    success: true,
    totalEvents: events.length,
    events: events
  });
});

module.exports = router;