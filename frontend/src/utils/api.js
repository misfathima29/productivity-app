// API Configuration
const API_BASE_URL = 'http://localhost:5000'; // Change this to your backend URL

// Helper function to get headers with auth token
const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Task CRUD operations
export const taskAPI = {
  // Get all tasks
  getTasks: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/tasks`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return await response.json();
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
  },

  // Add a new task
  addTask: async (taskData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/tasks`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(taskData),
      });
      return await response.json();
    } catch (error) {
      console.error('Error adding task:', error);
      throw error;
    }
  },

  // Update a task
  updateTask: async (taskId, taskData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(taskData),
      });
      return await response.json();
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  },

  // Delete a task
  deleteTask: async (taskId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      return await response.json();
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  },
};

// Authentication functions
export const authAPI = {
  // Login user
  login: async (credentials) => {
    try {
      console.log('📤 Sending login request:', credentials.email);
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
      
      const data = await response.json();
      console.log('📥 Login response:', data);
      
      // Your backend returns: { success: true, data: { token, user } }
      if (data.success && data.data) {
        return {
          success: true,
          token: data.data.token,
          user: data.data.user
        };
      } else {
        return {
          success: false,
          error: data.error || 'Login failed'
        };
      }
    } catch (error) {
      console.error('Error logging in:', error);
      return {
        success: false,
        error: 'Network error. Please check your connection.'
      };
    }
  },

  // Register user - ADD THIS FUNCTION
  register: async (userData) => {
    try {
      console.log('📤 Sending register request:', userData.email);
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      const data = await response.json();
      console.log('📥 Register response:', data);
      
      if (data.success && data.data) {
        return {
          success: true,
          token: data.data.token,
          user: data.data.user
        };
      } else {
        return {
          success: false,
          error: data.error || 'Registration failed'
        };
      }
    } catch (error) {
      console.error('Error registering:', error);
      return {
        success: false,
        error: 'Network error. Please check your connection.'
      };
    }
  },

  // Logout user
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
};

// Utility for making API calls
export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = getHeaders();
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// Notes CRUD operations
export const notesAPI = {
  // Get all notes
  getNotes: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/notes`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return await response.json();
    } catch (error) {
      console.error('Error fetching notes:', error);
      throw error;
    }
  },

  // Add a new note
  addNote: async (noteData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/notes`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(noteData),
      });
      return await response.json();
    } catch (error) {
      console.error('Error adding note:', error);
      throw error;
    }
  },

  // Update a note
  updateNote: async (noteId, noteData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/notes/${noteId}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(noteData),
      });
      return await response.json();
    } catch (error) {
      console.error('Error updating note:', error);
      throw error;
    }
  },

  // Delete a note
  deleteNote: async (noteId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/notes/${noteId}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      return await response.json();
    } catch (error) {
      console.error('Error deleting note:', error);
      throw error;
    }
  },
};

// Calendar Events CRUD operations
export const calendarAPI = {
  // Get all events
  getEvents: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/calendar/events`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return await response.json();
    } catch (error) {
      console.error('Error fetching events:', error);
      throw error;
    }
  },

  // Add a new event
  addEvent: async (eventData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/calendar/events`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(eventData),
      });
      return await response.json();
    } catch (error) {
      console.error('Error adding event:', error);
      throw error;
    }
  },

  // Update an event
  updateEvent: async (eventId, eventData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/calendar/events/${eventId}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(eventData),
      });
      return await response.json();
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  },

  // Delete an event
  deleteEvent: async (eventId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/calendar/events/${eventId}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      return await response.json();
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  },
};

// Mood Tracking CRUD operations
export const moodAPI = {
  // Get all mood entries
  getMoods: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/moods`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return await response.json();
    } catch (error) {
      console.error('Error fetching moods:', error);
      throw error;
    }
  },

  // Add a new mood entry
  addMood: async (moodData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/moods`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(moodData),
      });
      return await response.json();
    } catch (error) {
      console.error('Error adding mood:', error);
      throw error;
    }
  },

  // Update a mood entry
  updateMood: async (moodId, moodData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/moods/${moodId}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(moodData),
      });
      return await response.json();
    } catch (error) {
      console.error('Error updating mood:', error);
      throw error;
    }
  },

  // Delete a mood entry
  deleteMood: async (moodId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/moods/${moodId}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      return await response.json();
    } catch (error) {
      console.error('Error deleting mood:', error);
      throw error;
    }
  },

  // Get today's mood
  getTodayMood: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/moods/today`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return await response.json();
    } catch (error) {
      console.error('Error fetching today\'s mood:', error);
      throw error;
    }
  },

  // Get mood statistics
  getMoodStats: async (period = 'week') => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/moods/stats?period=${period}`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return await response.json();
    } catch (error) {
      console.error('Error fetching mood stats:', error);
      throw error;
    }
  },
};

// Analytics operations - UPDATED WITH CORRECT ENDPOINTS
export const analyticsAPI = {
  // Get today's stats
  getTodayStats: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/analytics/today-stats`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return await response.json();
    } catch (error) {
      console.error('Error fetching today stats:', error);
      throw error;
    }
  },

  // Get daily summary
  getDailySummary: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/analytics/daily-summary`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return await response.json();
    } catch (error) {
      console.error('Error fetching daily summary:', error);
      throw error;
    }
  },

  // Get dashboard stats
  getDashboardStats: async (period = 'week') => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/analytics/dashboard-stats?period=${period}`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return await response.json();
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  },

  // Get focus time
  getFocusTime: async (period = 'week') => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/analytics/focus-time?period=${period}`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return await response.json();
    } catch (error) {
      console.error('Error fetching focus time:', error);
      throw error;
    }
  },

  // Get productivity insights
  getProductivityInsights: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/analytics/productivity-insights`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return await response.json();
    } catch (error) {
      console.error('Error fetching productivity insights:', error);
      throw error;
    }
  },
};

// Timer operations
export const timerAPI = {
  // Get timer sessions
  getTimerSessions: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/timer/sessions`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return await response.json();
    } catch (error) {
      console.error('Error fetching timer sessions:', error);
      throw error;
    }
  },

  // Save a timer session
  saveTimerSession: async (sessionData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/timer/sessions`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(sessionData),
      });
      return await response.json();
    } catch (error) {
      console.error('Error saving timer session:', error);
      throw error;
    }
  },

  // Update a timer session
  updateTimerSession: async (sessionId, sessionData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/timer/sessions/${sessionId}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(sessionData),
      });
      return await response.json();
    } catch (error) {
      console.error('Error updating timer session:', error);
      throw error;
    }
  },

  // Delete a timer session
  deleteTimerSession: async (sessionId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/timer/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      return await response.json();
    } catch (error) {
      console.error('Error deleting timer session:', error);
      throw error;
    }
  },

  // Get timer statistics
  getTimerStats: async (period = 'week') => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/timer/stats?period=${period}`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return await response.json();
    } catch (error) {
      console.error('Error fetching timer stats:', error);
      throw error;
    }
  },

  // Get timer settings
  getTimerSettings: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/timer/settings`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return await response.json();
    } catch (error) {
      console.error('Error fetching timer settings:', error);
      throw error;
    }
  },

  // Update timer settings
  updateTimerSettings: async (settings) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/timer/settings`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(settings),
      });
      return await response.json();
    } catch (error) {
      console.error('Error updating timer settings:', error);
      throw error;
    }
  },
};

// Goal operations
export const goalAPI = {
  // Get all goals
  getGoals: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/goals`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return await response.json();
    } catch (error) {
      console.error('Error fetching goals:', error);
      throw error;
    }
  },

  // Add a new goal
  addGoal: async (goalData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/goals`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(goalData),
      });
      return await response.json();
    } catch (error) {
      console.error('Error adding goal:', error);
      throw error;
    }
  },

  // Update a goal
  updateGoal: async (goalId, goalData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/goals/${goalId}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(goalData),
      });
      return await response.json();
    } catch (error) {
      console.error('Error updating goal:', error);
      throw error;
    }
  },

  // Delete a goal
  deleteGoal: async (goalId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/goals/${goalId}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      return await response.json();
    } catch (error) {
      console.error('Error deleting goal:', error);
      throw error;
    }
  },

  // Update goal progress
  updateGoalProgress: async (goalId, progress) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/goals/${goalId}/progress`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ progress }),
      });
      return await response.json();
    } catch (error) {
      console.error('Error updating goal progress:', error);
      throw error;
    }
  },

  // Toggle goal completion
  toggleGoalCompletion: async (goalId, completed) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/goals/${goalId}/complete`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ completed }),
      });
      return await response.json();
    } catch (error) {
      console.error('Error toggling goal completion:', error);
      throw error;
    }
  },
};

// AI Assistant operations
export const aiAssistantAPI = {
  // Get chat history
  getChatHistory: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/ai/chat`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return await response.json();
    } catch (error) {
      console.error('Error fetching chat history:', error);
      throw error;
    }
  },

  // Send message to AI
  sendMessage: async (message) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/ai/chat`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ message }),
      });
      return await response.json();
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  // Clear chat history
  clearChatHistory: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/ai/chat`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      return await response.json();
    } catch (error) {
      console.error('Error clearing chat history:', error);
      throw error;
    }
  },

  // Get AI suggestions
  getSuggestions: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/ai/suggestions`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return await response.json();
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      throw error;
    }
  },

  // Get AI analysis
  getAnalysis: async (type) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/ai/analysis?type=${type}`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return await response.json();
    } catch (error) {
      console.error('Error fetching analysis:', error);
      throw error;
    }
  },
};

// Settings operations
export const settingsAPI = {
  // Get user settings
  getSettings: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/settings`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return await response.json();
    } catch (error) {
      console.error('Error fetching settings:', error);
      throw error;
    }
  },

  // Update user settings
  updateSettings: async (settings) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/settings`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ settings }),
      });
      return await response.json();
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  },

  // Update dark mode
  updateDarkMode: async (darkMode) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/settings/dark-mode`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ darkMode }),
      });
      return await response.json();
    } catch (error) {
      console.error('Error updating dark mode:', error);
      throw error;
    }
  },
};