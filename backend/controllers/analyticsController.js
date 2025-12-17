// backend/controllers/analyticsController.js
const Task = require('../models/task');
const Note = require('../models/note');
const Goal = require('../models/goal');
const Mood = require('../models/mood');
const CalendarEvent = require('../models/calendarEvent');

// Helper function to get date ranges
const getDateRange = (period) => {
  const now = new Date();
  const startDate = new Date();
  
  switch(period) {
    case 'day':
      startDate.setHours(0, 0, 0, 0);
      break;
    case 'week':
      startDate.setDate(now.getDate() - 7);
      break;
    case 'month':
      startDate.setMonth(now.getMonth() - 1);
      break;
    case 'year':
      startDate.setFullYear(now.getFullYear() - 1);
      break;
    default: // week
      startDate.setDate(now.getDate() - 7);
  }
  
  return { startDate, endDate: now };
};

// @desc    Get today's stats
// @route   GET /api/analytics/today-stats
// @access  Private
const getTodayStats = async (req, res) => {
  try {
    const userId = req.userId;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get today's tasks
    const tasks = await Task.find({
      userId,
      createdAt: { $gte: today, $lt: tomorrow }
    });

    // Get today's completed tasks
    const completedTasks = tasks.filter(task => task.completed);

    // Get focus time (simulated - you'd track this separately)
    const focusTime = 135; // minutes (2h 15m)
    const deepWorkTime = 90; // minutes (1.5h)

    // Calculate stats
    const stats = [
      {
        id: 'focusTime',
        label: 'Focus Time',
        value: `${Math.floor(focusTime / 60)}h ${focusTime % 60}m`,
        icon: 'Zap',
        color: 'electric-red',
        change: '+25%'
      },
      {
        id: 'tasksDone',
        label: 'Tasks Done',
        value: `${completedTasks.length}/${tasks.length}`,
        icon: 'Target',
        color: 'emerald-green',
        change: tasks.length > 0 ? `+${Math.round((completedTasks.length / tasks.length) * 100)}%` : '0%'
      },
      {
        id: 'productivity',
        label: 'Productivity',
        value: tasks.length > 0 ? `${Math.round((completedTasks.length / tasks.length) * 100)}%` : '0%',
        icon: 'TrendingUp',
        color: 'vibrant-yellow',
        change: '+12%'
      },
      {
        id: 'aiSuggestions',
        label: 'AI Suggestions',
        value: '15',
        icon: 'Brain',
        color: 'bright-blue',
        change: 'NEW'
      },
      {
        id: 'weeklyGoal',
        label: 'Weekly Goal',
        value: '5/7 days',
        icon: 'Trophy',
        color: 'electric-red',
        change: '71%'
      },
      {
        id: 'deepWork',
        label: 'Deep Work',
        value: `${Math.floor(deepWorkTime / 60)}h ${deepWorkTime % 60}m`,
        icon: 'Clock',
        color: 'emerald-green',
        change: '+40m'
      }
    ];

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error getting today stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch today\'s stats'
    });
  }
};

// @desc    Get daily summary with AI insights
// @route   GET /api/analytics/daily-summary
// @access  Private
const getDailySummary = async (req, res) => {
  try {
    const userId = req.userId;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Get today's and yesterday's data for comparison
    const todayTasks = await Task.find({
      userId,
      createdAt: { $gte: today }
    });

    const yesterdayTasks = await Task.find({
      userId,
      createdAt: { $gte: yesterday, $lt: today }
    });

    // Calculate metrics
    const todayCompleted = todayTasks.filter(t => t.completed).length;
    const yesterdayCompleted = yesterdayTasks.filter(t => t.completed).length;
    const completionRateChange = yesterdayCompleted > 0 
      ? Math.round(((todayCompleted - yesterdayCompleted) / yesterdayCompleted) * 100)
      : todayCompleted > 0 ? 100 : 0;

    // Generate insights based on data
    const insights = [
      {
        id: 'insight1',
        type: todayCompleted > 0 ? 'positive' : 'suggestion',
        text: todayCompleted > 3 
          ? `Great job! You completed ${todayCompleted} tasks today`
          : 'Try to complete at least 3 tasks per day for better productivity',
        icon: todayCompleted > 3 ? 'TrendingUp' : 'Brain',
        impact: todayCompleted > 3 ? 'High' : 'Low'
      },
      {
        id: 'insight2',
        type: completionRateChange >= 0 ? 'positive' : 'warning',
        text: completionRateChange >= 0 
          ? `Task completion rate increased by ${completionRateChange}% from yesterday`
          : `Task completion rate decreased by ${Math.abs(completionRateChange)}%`,
        icon: completionRateChange >= 0 ? 'Award' : 'TrendingDown',
        impact: 'Medium'
      },
      {
        id: 'insight3',
        type: 'suggestion',
        text: 'Schedule your most important tasks during your peak focus hours (9-11 AM)',
        icon: 'Brain',
        impact: 'High'
      }
    ];

    // Stats
    const stats = [
      {
        id: 'focusScore',
        label: 'Focus Score',
        value: '87%',
        change: '+5%',
        color: 'emerald-green',
        icon: 'Zap'
      },
      {
        id: 'deepWork',
        label: 'Deep Work',
        value: '3.2h',
        change: '+45m',
        color: 'bright-blue',
        icon: 'Clock'
      },
      {
        id: 'taskCompletion',
        label: 'Task Completion',
        value: `${Math.round((todayCompleted / Math.max(todayTasks.length, 1)) * 100)}%`,
        change: completionRateChange >= 0 ? `+${completionRateChange}%` : `${completionRateChange}%`,
        color: 'electric-red',
        icon: 'BarChart'
      },
      {
        id: 'distractions',
        label: 'Distractions',
        value: '12',
        change: '-4',
        color: 'vibrant-yellow',
        icon: 'TrendingDown'
      }
    ];

    // AI Recommendation
    const recommendations = [
      'Based on your patterns, try starting with creative work at 10 AM when your focus is highest.',
      'Schedule meetings in the afternoon when your energy naturally dips.',
      'Take a 5-minute break every 45 minutes to maintain productivity.'
    ];
    
    const randomRecommendation = recommendations[Math.floor(Math.random() * recommendations.length)];

    res.json({
      success: true,
      data: {
        insights,
        stats,
        recommendation: randomRecommendation
      }
    });

  } catch (error) {
    console.error('Error getting daily summary:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch daily summary'
    });
  }
};

// @desc    Get dashboard analytics
// @route   GET /api/analytics/dashboard-stats
// @access  Private
const getDashboardStats = async (req, res) => {
  try {
    const userId = req.userId;
    const period = req.query.period || 'week';
    const { startDate, endDate } = getDateRange(period);

    // Get tasks for period
    const tasks = await Task.find({
      userId,
      createdAt: { $gte: startDate, $lte: endDate }
    });

    // Calculate metrics
    const completedTasks = tasks.filter(task => task.completed);
    const completionRate = tasks.length > 0 
      ? Math.round((completedTasks.length / tasks.length) * 100)
      : 0;

    // Generate stats
    const stats = {
      focusTime: {
        value: '4h 20m',
        change: '+12%',
        trend: 'up',
        details: 'Average daily focus time for the selected period',
        icon: 'Clock'
      },
      tasksCompleted: {
        value: `${completedTasks.length} tasks`,
        change: tasks.length > 0 ? `+${completionRate}%` : '0%',
        trend: completionRate > 50 ? 'up' : 'down',
        details: `${completedTasks.length} out of ${tasks.length} tasks completed`,
        icon: 'Target'
      },
      distractions: {
        value: '6',
        change: '-18%',
        trend: 'down',
        details: 'Number of tracked distractions',
        icon: 'AlertTriangle'
      },
      aiSuggestions: {
        value: '12',
        change: '+30%',
        trend: 'up',
        details: 'AI-generated productivity suggestions',
        icon: 'Lightbulb'
      }
    };

    res.json({
      success: true,
      data: stats,
      period: period
    });

  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard statistics'
    });
  }
};

// @desc    Get focus time data
// @route   GET /api/analytics/focus-time
// @access  Private
const getFocusTime = async (req, res) => {
  try {
    const userId = req.userId;
    const period = req.query.period || 'week';
    
    // Sample focus time data (in production, you'd track this)
    const focusData = [
      { day: 'Mon', hours: 4.2, goal: 6 },
      { day: 'Tue', hours: 6.1, goal: 6 },
      { day: 'Wed', hours: 3.8, goal: 6 },
      { day: 'Thu', hours: 5.5, goal: 6 },
      { day: 'Fri', hours: 7.2, goal: 6 },
      { day: 'Sat', hours: 2.5, goal: 4 },
      { day: 'Sun', hours: 3.0, goal: 4 }
    ];

    res.json({
      success: true,
      data: focusData,
      period: period
    });

  } catch (error) {
    console.error('Error getting focus time:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch focus time data'
    });
  }
};

// @desc    Get productivity insights
// @route   GET /api/analytics/productivity-insights
// @access  Private
const getProductivityInsights = async (req, res) => {
  try {
    const insights = [
      {
        id: 'insight1',
        title: 'Morning Productivity Peak',
        description: 'You complete 40% more tasks between 9-11 AM',
        suggestion: 'Schedule important work during these hours',
        icon: 'Zap',
        color: 'bright-blue',
        impact: 'high'
      },
      {
        id: 'insight2',
        title: 'Meeting Impact',
        description: 'Productivity drops 25% after long meetings',
        suggestion: 'Keep meetings under 30 minutes when possible',
        icon: 'AlertTriangle',
        color: 'electric-red',
        impact: 'medium'
      },
      {
        id: 'insight3',
        title: 'Task Batching',
        description: 'Similar tasks completed 50% faster when batched',
        suggestion: 'Group similar tasks together',
        icon: 'Target',
        color: 'emerald-green',
        impact: 'high'
      }
    ];

    res.json({
      success: true,
      data: insights
    });

  } catch (error) {
    console.error('Error getting insights:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch productivity insights'
    });
  }
};

module.exports = {
  getTodayStats,
  getDailySummary,
  getDashboardStats,
  getFocusTime,
  getProductivityInsights
};