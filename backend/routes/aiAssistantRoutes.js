const express = require('express');
const router = express.Router();
const AIAssistant = require('../models/aiAssistant');
const auth = require('../middleware/auth'); // ← ADD THIS LINE

// AI suggestions (static for now - same for all users)
const suggestions = [
  { id: '1', text: 'Prioritize my tasks', type: 'task_management' },
  { id: '2', text: 'Summarize my notes', type: 'notes' },
  { id: '3', text: 'Schedule my meetings', type: 'calendar' },
  { id: '4', text: 'Analyze my productivity', type: 'analytics' },
  { id: '5', text: 'Suggest focus techniques', type: 'productivity' },
  { id: '6', text: 'Review my goals progress', type: 'goals' },
  { id: '7', text: 'Analyze my mood patterns', type: 'mood' },
  { id: '8', text: 'Plan my week', type: 'planning' }
];

// ========== PROTECTED ROUTES ==========

// GET chat history - PROTECTED
router.get('/chat', auth, async (req, res) => {
  try {
    const { limit } = req.query;
    
    // Get chat history from database - USING REAL userId
    let chatQuery = AIAssistant.find({ 
      userId: req.userId // ← CHANGED TO REAL userId
    }).sort({ timestamp: -1 });
    
    // Limit results if provided
    if (limit) {
      chatQuery = chatQuery.limit(parseInt(limit));
    }
    
    const chatHistory = await chatQuery.exec();

    // Format for frontend
    const formattedHistory = [];
    chatHistory.forEach(entry => {
      // Add user message
      formattedHistory.push({
        id: entry._id.toString() + '_user',
        userId: entry.userId,
        message: entry.userMessage,
        sender: 'user',
        timestamp: entry.timestamp,
        type: 'user_message'
      });
      
      // Add AI response
      formattedHistory.push({
        id: entry._id.toString() + '_ai',
        userId: entry.userId,
        message: entry.aiResponse,
        sender: 'ai',
        timestamp: new Date(entry.timestamp.getTime() + 1000),
        type: 'ai_response'
      });
    });

    // Sort by timestamp
    formattedHistory.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json({
      success: true,
      data: formattedHistory,
      count: formattedHistory.length
    });
  } catch (error) {
    console.error('❌ Error getting chat history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch chat history'
    });
  }
});

// POST send message to AI - PROTECTED
router.post('/chat', auth, async (req, res) => {
  try {
    const { message, context } = req.body;
    
    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a message'
      });
    }

    // Generate AI response (mock for now)
    const aiResponses = [
      "I've analyzed your request. Based on your current tasks and schedule, I recommend focusing on high-priority items first.",
      "Great question! Let me check your data and provide some insights.",
      "I can help with that. Here's what I found based on your productivity patterns:",
      "Based on your recent activity, I suggest taking a different approach. Would you like me to explain?",
      "I've processed your request. Here are my recommendations:",
      "Interesting! Let me analyze your data and provide personalized suggestions.",
      "I understand what you're asking. Here's what I think based on your goals:",
      "Thanks for sharing! Here's my analysis and some actionable steps you can take."
    ];

    const aiResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)];

    // Save to database - USING REAL userId
    const chatEntry = new AIAssistant({
      userId: req.userId, // ← CHANGED TO REAL userId
      userMessage: message.trim(),
      aiResponse: aiResponse,
      context: context || 'general'
    });

    await chatEntry.save();

    console.log('✅ Chat message saved for user:', req.userId);

    res.json({
      success: true,
      data: {
        userMessage: {
          id: chatEntry._id.toString() + '_user',
          message: chatEntry.userMessage,
          sender: 'user',
          timestamp: chatEntry.timestamp
        },
        aiResponse: {
          id: chatEntry._id.toString() + '_ai',
          message: chatEntry.aiResponse,
          sender: 'ai',
          timestamp: new Date(chatEntry.timestamp.getTime() + 1000)
        }
      },
      message: 'Message processed successfully'
    });
  } catch (error) {
    console.error('❌ Error sending message:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process message'
    });
  }
});

// DELETE clear chat history - PROTECTED
router.delete('/chat', auth, async (req, res) => {
  try {
    const result = await AIAssistant.deleteMany({ 
      userId: req.userId // ← CHANGED TO REAL userId
    });
    
    console.log('✅ Chat history cleared for user:', req.userId);

    res.json({
      success: true,
      message: 'Chat history cleared successfully',
      clearedCount: result.deletedCount
    });
  } catch (error) {
    console.error('❌ Error clearing chat history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear chat history'
    });
  }
});

// ========== PUBLIC ROUTES (no auth needed) ==========

// GET AI suggestions - PUBLIC
router.get('/suggestions', (req, res) => {
  try {
    const { type, limit } = req.query;
    let filteredSuggestions = suggestions;

    // Filter by type if provided
    if (type) {
      filteredSuggestions = suggestions.filter(s => s.type === type);
    }

    // Limit results if provided
    if (limit) {
      filteredSuggestions = filteredSuggestions.slice(0, parseInt(limit));
    }

    res.json({
      success: true,
      data: filteredSuggestions,
      count: filteredSuggestions.length
    });
  } catch (error) {
    console.error('❌ Error getting suggestions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch suggestions'
    });
  }
});

// GET AI analysis - PUBLIC (but could be protected if personalized)
router.get('/analysis', (req, res) => {
  try {
    const { type } = req.query;
    
    // Mock analysis (same for all users)
    const analyses = {
      productivity: {
        type: 'productivity',
        summary: 'Your productivity score is 78/100 this week.',
        insights: [
          'You are most productive between 10 AM - 12 PM',
          'Focus time has increased by 15% compared to last week',
          'Task completion rate is 87%',
          'Consider reducing meeting time in the afternoon'
        ],
        recommendations: [
          'Schedule important tasks for morning hours',
          'Try the Pomodoro technique for afternoon work',
          'Take regular breaks to maintain focus'
        ]
      },
      tasks: {
        type: 'tasks',
        summary: 'You have 12 tasks, 8 completed, 4 pending.',
        insights: [
          'High priority tasks are 75% complete',
          'Average time per task: 45 minutes',
          'Most tasks are completed within deadline',
          'Tasks with clear descriptions have higher completion rate'
        ],
        recommendations: [
          'Break down complex tasks into smaller steps',
          'Set clearer deadlines for pending tasks',
          'Review task priorities daily'
        ]
      },
      goals: {
        type: 'goals',
        summary: 'Overall goal progress: 72%',
        insights: [
          'Learning goals: 85% complete',
          'Health goals: 60% complete', 
          'Work goals: 75% complete',
          'You are on track to complete 3/5 monthly goals'
        ],
        recommendations: [
          'Focus on health goals in the coming week',
          'Celebrate completed goals to maintain motivation',
          'Adjust deadlines if needed for realistic planning'
        ]
      }
    };

    const analysis = analyses[type] || {
      type: type || 'general',
      summary: 'Analysis data not available for this type.',
      insights: ['Try requesting a different analysis type'],
      recommendations: ['Check back later for more detailed analysis']
    };

    res.json({
      success: true,
      data: analysis,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error getting analysis:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch analysis'
    });
  }
});

// GET AI capabilities - PUBLIC
router.get('/capabilities', (req, res) => {
  try {
    const capabilities = [
      {
        id: '1',
        name: 'Task Management',
        description: 'Help prioritize and organize tasks',
        icon: '📋',
        examples: ['What should I work on next?', 'Organize my task list']
      },
      {
        id: '2',
        name: 'Note Analysis',
        description: 'Summarize and analyze your notes',
        icon: '📝',
        examples: ['Summarize my meeting notes', 'Find key points from yesterday']
      },
      {
        id: '3',
        name: 'Calendar Planning',
        description: 'Help schedule and plan your time',
        icon: '📅',
        examples: ['Schedule my meetings', 'Plan my week ahead']
      },
      {
        id: '4',
        name: 'Productivity Insights',
        description: 'Analyze your work patterns',
        icon: '📊',
        examples: ['How productive was I today?', 'Analyze my focus time']
      },
      {
        id: '5',
        name: 'Goal Tracking',
        description: 'Monitor and suggest goal improvements',
        icon: '🎯',
        examples: ['How are my goals progressing?', 'Suggest goal adjustments']
      },
      {
        id: '6',
        name: 'Mood Analysis',
        description: 'Analyze mood patterns and suggest improvements',
        icon: '😊',
        examples: ['How has my mood been?', 'Suggest mood improvement tips']
      }
    ];

    res.json({
      success: true,
      data: capabilities,
      count: capabilities.length
    });
  } catch (error) {
    console.error('❌ Error getting capabilities:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch capabilities'
    });
  }
});

module.exports = router;