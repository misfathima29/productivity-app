import { useState, useEffect } from 'react';
import { User, Trophy, TrendingUp, Calendar, Award, Target, BarChart3, Clock, Zap, Star, Download, Share2, CheckSquare, FileText, CalendarDays, Target as TargetIcon } from 'lucide-react';
import { taskAPI, notesAPI, calendarAPI, goalAPI } from '../utils/api';

const ProfileAnalytics = () => {
  const [timeRange, setTimeRange] = useState('week');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [realStats, setRealStats] = useState({
    taskCount: 0,
    noteCount: 0,
    eventCount: 0,
    goalCount: 0,
    completedTasks: 0,
    pendingTasks: 0,
    highPriorityTasks: 0
  });
  
  const [weeklyData, setWeeklyData] = useState([]);
  const [achievements, setAchievements] = useState([]);

  // Get real user data and stats
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // Get user from localStorage
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        setUser(userData);
        
        // Fetch real data from your APIs
        const tasksResponse = await taskAPI.getTasks();
        const notesResponse = await notesAPI.getNotes();
        const calendarResponse = await calendarAPI.getEvents();
        const goalsResponse = await goalAPI.getGoals();
        
        const tasks = Array.isArray(tasksResponse) ? tasksResponse : [];
        const notes = Array.isArray(notesResponse) ? notesResponse : [];
        const events = Array.isArray(calendarResponse) ? calendarResponse : [];
        const goals = Array.isArray(goalsResponse) ? goalsResponse : [];
        
        // Calculate stats
        const completedTasks = tasks.filter(task => 
          task.status === 'completed' || task.status === 'done' || task.completed === true
        ).length;
        
        const pendingTasks = tasks.filter(task => 
          task.status === 'pending' || task.status === 'todo' || !task.completed
        ).length;
        
        const highPriorityTasks = tasks.filter(task => 
          task.priority === 'high' || task.priority === 'urgent'
        ).length;

        // Calculate weekly performance (simplified - using task dates)
        const today = new Date();
        const weekData = [];
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(today.getDate() - i);
          const dayName = days[date.getDay()];
          
          // Count tasks for this day (simplified - using creation date)
          const dayTasks = tasks.filter(task => {
            if (!task.createdAt) return false;
            const taskDate = new Date(task.createdAt);
            return taskDate.toDateString() === date.toDateString();
          });
          
          const dayCompleted = dayTasks.filter(task => 
            task.status === 'completed' || task.completed
          ).length;
          
          const score = dayTasks.length > 0 
            ? Math.round((dayCompleted / dayTasks.length) * 100) 
            : 0;
          
          weekData.push({
            day: dayName,
            focus: dayTasks.length * 0.5, // Simplified focus hours
            tasks: dayTasks.length,
            score: score
          });
        }

        // Calculate achievements based on real data
        const userAchievements = [
          { 
            id: 1, 
            title: 'Task Master', 
            desc: `${tasks.length} tasks created`, 
            unlocked: tasks.length >= 5, 
            icon: <CheckSquare size={20} /> 
          },
          { 
            id: 2, 
            title: 'Note Taker', 
            desc: `${notes.length} notes created`, 
            unlocked: notes.length >= 3, 
            icon: <FileText size={20} /> 
          },
          { 
            id: 3, 
            title: 'Planner', 
            desc: `${events.length} events scheduled`, 
            unlocked: events.length >= 2, 
            icon: <CalendarDays size={20} /> 
          },
          { 
            id: 4, 
            title: 'Goal Setter', 
            desc: `${goals.length} goals set`, 
            unlocked: goals.length >= 1, 
            icon: <TargetIcon size={20} /> 
          },
          { 
            id: 5, 
            title: 'Productive Week', 
            desc: 'Tasks completed this week', 
            unlocked: completedTasks >= 3, 
            icon: <Trophy size={20} /> 
          },
          { 
            id: 6, 
            title: 'Consistency', 
            desc: 'Active multiple days', 
            unlocked: weekData.filter(day => day.tasks > 0).length >= 3, 
            icon: <TrendingUp size={20} /> 
          },
        ];

        setRealStats({
          taskCount: tasks.length,
          noteCount: notes.length,
          eventCount: events.length,
          goalCount: goals.length,
          completedTasks: completedTasks,
          pendingTasks: pendingTasks,
          highPriorityTasks: highPriorityTasks
        });
        
        setWeeklyData(weekData);
        setAchievements(userAchievements);
        
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, []);

  // Calculate real user stats based on actual data
  const calculateRealStats = () => {
    const totalItems = realStats.taskCount + realStats.noteCount + realStats.eventCount;
    const completionRate = realStats.taskCount > 0 
      ? Math.round((realStats.completedTasks / realStats.taskCount) * 100) 
      : 0;
    
    // Calculate streak based on activity (simplified)
    const activeDays = weeklyData.filter(day => day.tasks > 0).length;
    const streak = activeDays;
    
    // Calculate level based on total activity
    const totalActivity = realStats.taskCount + realStats.noteCount + realStats.eventCount;
    const level = Math.min(Math.floor(totalActivity / 5) + 1, 10);
    
    // Calculate points
    const points = realStats.taskCount * 10 + 
                   realStats.noteCount * 5 + 
                   realStats.completedTasks * 20 +
                   realStats.eventCount * 8;
    
    // Calculate rank
    let rank = 'Beginner';
    if (points > 200) rank = 'Top 10%';
    else if (points > 100) rank = 'Top 25%';
    else if (points > 50) rank = 'Top 50%';
    else rank = 'Getting Started';
    
    return {
      streak,
      level,
      points,
      rank,
      completionRate,
      totalActivity,
      activeDays
    };
  };

  const userStats = calculateRealStats();

  // Calculate productivity areas based on real data
  const productivityAreas = [
    { 
      name: 'Tasks Completed', 
      current: realStats.completedTasks, 
      target: Math.max(realStats.taskCount, 1), 
      unit: 'tasks', 
      color: 'electric-red' 
    },
    { 
      name: 'Total Tasks', 
      current: realStats.taskCount, 
      target: Math.max(realStats.taskCount + 5, 10), 
      unit: 'tasks', 
      color: 'emerald-green' 
    },
    { 
      name: 'Completion Rate', 
      current: userStats.completionRate, 
      target: 90, 
      unit: '%', 
      color: 'bright-blue' 
    },
    { 
      name: 'Total Notes', 
      current: realStats.noteCount, 
      target: Math.max(realStats.noteCount + 3, 8), 
      unit: 'notes', 
      color: 'vibrant-yellow' 
    },
  ];

  // Calculate focus patterns based on task data
  const focusPatterns = [
    { 
      label: 'High Priority Tasks', 
      value: realStats.highPriorityTasks,
      total: realStats.taskCount,
      color: 'electric-red' 
    },
    { 
      label: 'Pending Tasks', 
      value: realStats.pendingTasks,
      total: realStats.taskCount,
      color: 'bright-blue' 
    },
    { 
      label: 'Notes Created', 
      value: realStats.noteCount,
      total: Math.max(realStats.noteCount + 5, 10),
      color: 'emerald-green' 
    },
  ];

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
        <div className="text-white">Analyzing your productivity data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-dark p-4 lg:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-electric-red via-vibrant-yellow to-emerald-green flex items-center justify-center">
                  <User size={32} className="text-white" />
                </div>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-bright-blue border-4 border-dark-primary flex items-center justify-center">
                  <span className="text-white font-bold">{userStats.level}</span>
                </div>
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-white">
                  {user?.username || 'User'}
                </h1>
                <p className="text-gray-400">
                  {user?.email || 'User'} • Level {userStats.level}
                </p>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-2">
                    <TrendingUp size={16} className="text-emerald-green" />
                    <span className="text-emerald-green font-medium">{userStats.rank}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap size={16} className="text-vibrant-yellow" />
                    <span className="text-vibrant-yellow font-medium">{userStats.streak} active days</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-dark-card text-gray-300 hover:text-white">
                <Download size={18} />
                Export
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-bright-blue to-emerald-green text-white">
                <Share2 size={18} />
                Share
              </button>
            </div>
          </div>

          {/* Real Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="glass-card rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-white">{realStats.taskCount}</div>
                  <div className="text-gray-400 text-sm">Total Tasks</div>
                </div>
                <div className="p-2 rounded-lg bg-electric-red/20 text-electric-red">
                  <CheckSquare size={20} />
                </div>
              </div>
            </div>
            <div className="glass-card rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-white">{realStats.completedTasks}</div>
                  <div className="text-gray-400 text-sm">Completed</div>
                </div>
                <div className="p-2 rounded-lg bg-emerald-green/20 text-emerald-green">
                  <Trophy size={20} />
                </div>
              </div>
            </div>
            <div className="glass-card rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-white">{realStats.noteCount}</div>
                  <div className="text-gray-400 text-sm">Notes</div>
                </div>
                <div className="p-2 rounded-lg bg-bright-blue/20 text-bright-blue">
                  <FileText size={20} />
                </div>
              </div>
            </div>
            <div className="glass-card rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-white">{realStats.eventCount}</div>
                  <div className="text-gray-400 text-sm">Events</div>
                </div>
                <div className="p-2 rounded-lg bg-vibrant-yellow/20 text-vibrant-yellow">
                  <Calendar size={20} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Weekly Performance - REAL DATA */}
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Calendar size={22} className="text-electric-red" />
                This Week's Activity
              </h2>
              <div className="flex gap-2">
                {['week', 'month', 'year'].map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-3 py-1 rounded-lg text-sm capitalize ${
                      timeRange === range
                        ? 'bg-electric-red text-white'
                        : 'bg-dark-card text-gray-400 hover:text-white'
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>

            {/* Chart - REAL DATA */}
            <div className="space-y-6">
              {weeklyData.map((day, idx) => (
                <div key={idx} className="flex items-center">
                  <div className="w-12 text-gray-400 text-sm">{day.day}</div>
                  <div className="flex-1 flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-400">Tasks: {day.tasks}</span>
                        <span className="text-white">{day.score}%</span>
                      </div>
                      <div className="w-full bg-gray-800 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full bg-gradient-to-r from-electric-red to-vibrant-yellow"
                          style={{ width: `${Math.min(day.score, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-medium">{day.tasks}</div>
                      <div className="text-gray-400 text-xs">tasks</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Productivity Areas - REAL DATA */}
          <div className="glass-card rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
              <Target size={22} className="text-emerald-green" />
              Your Progress
            </h2>
            
            <div className="space-y-6">
              {productivityAreas.map((area, idx) => {
                const percentage = area.target > 0 
                  ? Math.round((area.current / area.target) * 100) 
                  : 0;
                return (
                  <div key={idx}>
                    <div className="flex justify-between mb-2">
                      <span className="text-white font-medium">{area.name}</span>
                      <span className="text-gray-400">{area.current}/{area.target} {area.unit}</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-3 mb-2">
                      <div 
                        className={`h-3 rounded-full transition-all duration-500 bg-${area.color}`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Progress</span>
                      <span className={percentage >= 100 ? 'text-emerald-green' : 'text-white'}>
                        {percentage}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Overall Progress - REAL DATA */}
            <div className="mt-8 pt-6 border-t border-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-gray-400 text-sm">Task Completion Rate</div>
                  <div className="text-2xl font-bold text-white">{userStats.completionRate}%</div>
                  <div className="text-gray-400 text-sm">{realStats.completedTasks} of {realStats.taskCount} tasks</div>
                </div>
                <div className="relative w-24 h-24">
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#334155" strokeWidth="8" />
                    <circle 
                      cx="50" cy="50" r="40" fill="none" 
                      stroke="url(#gradient)" strokeWidth="8" 
                      strokeLinecap="round"
                      strokeDasharray="251.2" 
                      strokeDashoffset="251.2 * (1 - userStats.completionRate/100)"
                      transform="rotate(-90 50 50)"
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#FF4757" />
                        <stop offset="100%" stopColor="#20BF6B" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-xl font-bold text-white">{userStats.completionRate}%</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Achievements - REAL DATA */}
        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
            <Award size={22} className="text-vibrant-yellow" />
            Your Achievements
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`p-4 rounded-xl text-center transition-all ${
                  achievement.unlocked
                    ? 'bg-gradient-to-br from-emerald-green/20 to-bright-blue/20 border border-emerald-green/30'
                    : 'bg-dark-card/50 border border-gray-700 opacity-50'
                }`}
              >
                <div className={`inline-flex p-3 rounded-lg mb-3 ${
                  achievement.unlocked ? 'bg-emerald-green/20 text-emerald-green' : 'bg-gray-800 text-gray-500'
                }`}>
                  {achievement.icon}
                </div>
                <h4 className="text-white font-medium mb-1">{achievement.title}</h4>
                <p className="text-gray-400 text-xs">{achievement.desc}</p>
                {achievement.unlocked && (
                  <div className="mt-2 text-xs text-emerald-green">★ Unlocked</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Analytics - REAL DATA */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <BarChart3 size={20} />
              Your Activity
            </h3>
            <div className="space-y-3">
              {focusPatterns.map((pattern, idx) => {
                const percentage = pattern.total > 0 
                  ? Math.round((pattern.value / pattern.total) * 100) 
                  : 0;
                return (
                  <div key={idx}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">{pattern.label}</span>
                      <span className="text-white">{pattern.value}/{pattern.total}</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full bg-${pattern.color}`} 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <Clock size={20} />
              Time Management
            </h3>
            <div className="space-y-4">
              {[
                { 
                  label: 'Completed Tasks', 
                  value: realStats.completedTasks, 
                  total: realStats.taskCount,
                  color: 'emerald-green' 
                },
                { 
                  label: 'Pending Tasks', 
                  value: realStats.pendingTasks, 
                  total: realStats.taskCount,
                  color: 'bright-blue' 
                },
                { 
                  label: 'High Priority', 
                  value: realStats.highPriorityTasks, 
                  total: realStats.taskCount,
                  color: 'electric-red' 
                },
              ].map((item, idx) => {
                const percentage = item.total > 0 
                  ? Math.round((item.value / item.total) * 100) 
                  : 0;
                return (
                  <div key={idx}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">{item.label}</span>
                      <span className="text-white">{item.value} ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full bg-${item.color}`} 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <TrendingUp size={20} />
              Performance Summary
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-green/10">
                <span className="text-white">Task Completion</span>
                <span className="text-emerald-green font-bold">{userStats.completionRate}%</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-bright-blue/10">
                <span className="text-white">Active Days</span>
                <span className="text-bright-blue font-bold">{userStats.activeDays}/7</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-vibrant-yellow/10">
                <span className="text-white">Productivity Score</span>
                <span className="text-vibrant-yellow font-bold">{userStats.points}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-electric-red/10">
                <span className="text-white">Level</span>
                <span className="text-electric-red font-bold">{userStats.level}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileAnalytics;