// backend/routes/analyticsRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getTodayStats,
  getDailySummary,
  getDashboardStats,
  getFocusTime,
  getProductivityInsights
} = require('../controllers/analyticsController');

// All routes are protected
router.get('/today-stats', auth, getTodayStats);
router.get('/daily-summary', auth, getDailySummary);
router.get('/dashboard-stats', auth, getDashboardStats);
router.get('/focus-time', auth, getFocusTime);
router.get('/productivity-insights', auth, getProductivityInsights);

router.get('/dashboard', (req, res) => {
  try {
    const { period = 'week' } = req.query;
    
    // Mock data - in real app, this would come from database
    const stats = {
      period: period,
      focusTime: {
        value: '4h 20m',
        change: '+12%',
        trend: 'up',
        details: 'Daily average: 45 minutes'
      },
      tasksCompleted: {
        value: '87%',
        change: '+5%',
        trend: 'up',
        details: '32 out of 37 tasks'
      },
      distractions: {
        value: '6',
        change: '-18%',
        trend: 'down',
        details: 'Daily average: 0.85'
      },
      aiSuggestions: {
        value: '12',
        change: '+30%',
        trend: 'up',
        details: 'Most used: Task prioritization'
      },
      productivityScore: {
        value: '84',
        change: '+8%',
        trend: 'up',
        details: 'Above average for your peers'
      },
      moodCorrelation: {
        value: '0.72',
        change: '+0.15',
        trend: 'up',
        details: 'Strong positive correlation'
      }
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard stats'
    });
  }
});

// GET focus time data
router.get('/focus-time', (req, res) => {
  try {
    const { period = 'week' } = req.query;
    
    // Generate focus time data for the selected period
    let focusData = [];
    
    if (period === 'week') {
      focusData = [
        { day: 'Mon', hours: 4.2, goal: 6, productive: true },
        { day: 'Tue', hours: 6.1, goal: 6, productive: true },
        { day: 'Wed', hours: 3.8, goal: 6, productive: false },
        { day: 'Thu', hours: 5.5, goal: 6, productive: true },
        { day: 'Fri', hours: 7.2, goal: 6, productive: true },
        { day: 'Sat', hours: 2.5, goal: 4, productive: false },
        { day: 'Sun', hours: 3.0, goal: 4, productive: false }
      ];
    } else if (period === 'month') {
      // Monthly data (simplified)
      focusData = Array.from({ length: 30 }, (_, i) => ({
        day: `Day ${i + 1}`,
        hours: 3 + Math.random() * 4,
        goal: 6,
        productive: Math.random() > 0.3
      }));
    }

    res.json({
      success: true,
      data: focusData,
      summary: {
        totalHours: focusData.reduce((sum, day) => sum + day.hours, 0).toFixed(1),
        averageHours: (focusData.reduce((sum, day) => sum + day.hours, 0) / focusData.length).toFixed(1),
        productiveDays: focusData.filter(day => day.productive).length,
        goalAchievement: ((focusData.filter(day => day.hours >= day.goal).length / focusData.length) * 100).toFixed(1) + '%'
      }
    });
  } catch (error) {
    console.error('Error getting focus time:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch focus time data'
    });
  }
});

// GET productivity insights
router.get('/insights', (req, res) => {
  try {
    const insights = [
      {
        id: 1,
        type: 'peak_performance',
        title: 'Peak Performance Hours',
        description: 'You are most productive between 10 AM - 12 PM',
        icon: 'Zap',
        color: 'emerald-green',
        impact: 'high',
        suggestion: 'Schedule important tasks during this window'
      },
      {
        id: 2,
        type: 'distraction_pattern',
        title: 'Distraction Pattern Detected',
        description: 'Highest distractions occur around 3 PM',
        icon: 'AlertTriangle',
        color: 'electric-red',
        impact: 'medium',
        suggestion: 'Try the Pomodoro technique during afternoon hours'
      },
      {
        id: 3,
        type: 'task_completion',
        title: 'Task Completion Rate',
        description: 'You complete 92% of morning tasks vs 68% of afternoon tasks',
        icon: 'Target',
        color: 'bright-blue',
        impact: 'high',
        suggestion: 'Prioritize critical tasks for the morning'
      },
      {
        id: 4,
        type: 'mood_impact',
        title: 'Mood Impact on Productivity',
        description: 'Productivity increases by 40% when mood is "Energetic"',
        icon: 'TrendingUp',
        color: 'vibrant-yellow',
        impact: 'medium',
        suggestion: 'Consider starting your day with a short workout'
      }
    ];

    res.json({
      success: true,
      data: insights,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting insights:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch productivity insights'
    });
  }
});

// GET productivity trends
router.get('/trends', (req, res) => {
  try {
    const trends = {
      weeklyTrend: '+8%',
      monthlyTrend: '+15%',
      comparison: 'You are 12% more productive than last month',
      milestones: [
        { label: '10 consecutive productive days', achieved: true },
        { label: '20 hours of deep focus this week', achieved: true },
        { label: 'Reduce distractions by 25%', achieved: false, progress: 18 }
      ]
    };

    res.json({
      success: true,
      data: trends
    });
  } catch (error) {
    console.error('Error getting trends:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch productivity trends'
    });
  }
});

module.exports = router;