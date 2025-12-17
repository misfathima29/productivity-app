const express = require('express');
const router = express.Router();
const TimerSession = require('../models/timerSession');
const auth = require('../middleware/auth'); // ← ADD THIS

// Timer settings (per user - in memory for now, could move to DB)
// Each user will get their own copy
const userTimerSettings = {}; // Will store settings per userId

// Helper to get/set user settings
const getUserSettings = (userId) => {
  if (!userTimerSettings[userId]) {
    // Default settings for new user
    userTimerSettings[userId] = {
      focusDuration: 1500, // 25 minutes
      breakDuration: 300,  // 5 minutes
      longBreakDuration: 900, // 15 minutes
      sessionsBeforeLongBreak: 4,
      autoStartBreaks: true,
      autoStartFocus: false,
      soundEnabled: true,
      notifications: true
    };
  }
  return userTimerSettings[userId];
};

// GET all timer sessions - PROTECTED
router.get('/sessions', auth, async (req, res) => {
  try {
    const { limit, timerType, startDate, endDate } = req.query;
    
    // Build query - USING REAL userId
    let query = { userId: req.userId }; // ← CHANGED
    
    // Filter by type if provided
    if (timerType) {
      query.timerType = timerType;
    }
    
    // Filter by date range if provided
    if (startDate || endDate) {
      query.startTime = {};
      if (startDate) query.startTime.$gte = new Date(startDate);
      if (endDate) query.startTime.$lte = new Date(endDate);
    }
    
    // Get sessions from database
    let sessionsQuery = TimerSession.find(query).sort({ startTime: -1 });
    
    // Limit results if provided
    if (limit) {
      sessionsQuery = sessionsQuery.limit(parseInt(limit));
    }
    
    const sessions = await sessionsQuery.exec();

    res.json({
      success: true,
      count: sessions.length,
      data: sessions
    });
  } catch (error) {
    console.error('❌ Error getting timer sessions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch timer sessions'
    });
  }
});

// GET timer statistics - PROTECTED
router.get('/stats', auth, async (req, res) => {
  try {
    const { period = 'week' } = req.query;
    
    // Get all sessions for the user
    const sessions = await TimerSession.find({ 
      userId: req.userId // ← CHANGED
    });
    
    // Calculate statistics
    const focusSessions = sessions.filter(s => s.timerType === 'pomodoro' || s.timerType === 'deep-work');
    const breakSessions = sessions.filter(s => s.timerType === 'break');
    
    const totalFocusTime = focusSessions.reduce((sum, session) => sum + session.duration, 0);
    const totalBreakTime = breakSessions.reduce((sum, session) => sum + session.duration, 0);
    
    // Calculate streak
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentSessions = sessions.filter(s => s.startTime >= sevenDaysAgo);
    const uniqueDays = new Set(recentSessions.map(s => s.startTime.toDateString())).size;
    
    const stats = {
      period: period,
      userId: req.userId, // ← Added
      totalSessions: sessions.length,
      focusSessions: focusSessions.length,
      breakSessions: breakSessions.length,
      totalFocusTime: totalFocusTime,
      totalBreakTime: totalBreakTime,
      averageFocusPerSession: focusSessions.length > 0 ? Math.round(totalFocusTime / focusSessions.length) : 0,
      streak: Math.min(uniqueDays, 7),
      bestDay: {
        date: sessions.length > 0 ? sessions[0].startTime.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        sessions: focusSessions.length,
        focusTime: totalFocusTime
      },
      weeklyGoal: {
        target: 20,
        current: focusSessions.length,
        progress: Math.min(100, (focusSessions.length / 20) * 100)
      }
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('❌ Error getting timer stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch timer statistics'
    });
  }
});

// GET timer settings - PROTECTED
router.get('/settings', auth, (req, res) => {
  try {
    const settings = getUserSettings(req.userId);
    
    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('❌ Error getting timer settings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch timer settings'
    });
  }
});

// POST save new timer session - PROTECTED
router.post('/sessions', auth, async (req, res) => {
  try {
    const { duration, timerType, notes, startTime, endTime } = req.body;
    
    if (!duration || !timerType) {
      return res.status(400).json({
        success: false,
        error: 'Please provide session duration and type'
      });
    }

    const session = new TimerSession({
      userId: req.userId, // ← CHANGED
      duration: parseInt(duration),
      timerType,
      notes: notes || '',
      startTime: startTime ? new Date(startTime) : new Date(),
      endTime: endTime ? new Date(endTime) : new Date(),
      completed: true
    });

    await session.save();
    console.log('✅ Timer session saved for user:', req.userId);

    res.status(201).json({
      success: true,
      data: session,
      message: 'Timer session saved successfully'
    });
  } catch (error) {
    console.error('❌ Error saving timer session:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save timer session'
    });
  }
});

// PUT update timer session - PROTECTED
router.put('/sessions/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { notes, endTime, duration } = req.body;

    const session = await TimerSession.findOneAndUpdate(
      { 
        _id: id,
        userId: req.userId // ← CHANGED
      },
      {
        notes,
        endTime: endTime ? new Date(endTime) : undefined,
        duration: duration ? parseInt(duration) : undefined
      },
      { new: true, runValidators: true }
    );
    
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Timer session not found'
      });
    }

    console.log('✅ Timer session updated for user:', req.userId);

    res.json({
      success: true,
      data: session,
      message: 'Timer session updated successfully'
    });
  } catch (error) {
    console.error('❌ Error updating timer session:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update timer session'
    });
  }
});

// DELETE timer session - PROTECTED
router.delete('/sessions/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const session = await TimerSession.findOneAndDelete({
      _id: id,
      userId: req.userId // ← CHANGED
    });
    
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Timer session not found'
      });
    }

    console.log('✅ Timer session deleted for user:', req.userId);

    res.json({
      success: true,
      message: 'Timer session deleted successfully',
      data: session
    });
  } catch (error) {
    console.error('❌ Error deleting timer session:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete timer session'
    });
  }
});

// PUT update timer settings - PROTECTED
router.put('/settings', auth, (req, res) => {
  try {
    const updates = req.body;
    
    // Update user's settings
    const currentSettings = getUserSettings(req.userId);
    userTimerSettings[req.userId] = {
      ...currentSettings,
      ...updates
    };

    console.log('✅ Timer settings updated for user:', req.userId);

    res.json({
      success: true,
      data: userTimerSettings[req.userId],
      message: 'Timer settings updated successfully'
    });
  } catch (error) {
    console.error('❌ Error updating timer settings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update timer settings'
    });
  }
});

// GET today's sessions - PROTECTED
router.get('/sessions/today', auth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todaySessions = await TimerSession.find({
      userId: req.userId, // ← CHANGED
      startTime: { $gte: today, $lt: tomorrow }
    }).sort({ startTime: -1 });
    
    const todayFocus = todaySessions.filter(s => s.timerType === 'pomodoro' || s.timerType === 'deep-work');
    const todayBreak = todaySessions.filter(s => s.timerType === 'break');
    
    const totalFocusToday = todayFocus.reduce((sum, s) => sum + s.duration, 0);
    const totalBreakToday = todayBreak.reduce((sum, s) => sum + s.duration, 0);

    res.json({
      success: true,
      data: todaySessions,
      summary: {
        totalSessions: todaySessions.length,
        focusSessions: todayFocus.length,
        breakSessions: todayBreak.length,
        totalFocusTime: totalFocusToday,
        totalBreakTime: totalBreakToday,
        streakMaintained: todayFocus.length > 0
      }
    });
  } catch (error) {
    console.error('❌ Error getting today\'s sessions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch today\'s sessions'
    });
  }
});

module.exports = router;