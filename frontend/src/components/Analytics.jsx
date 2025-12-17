import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Target, Zap, AlertTriangle, 
         Clock, BarChart, PieChart, Loader2, Lightbulb } from 'lucide-react';
import { analyticsAPI } from '../utils/api';
import { useToast } from '../context/ToastContext';

const Analytics = () => {
  const [stats, setStats] = useState([]);
  const [focusData, setFocusData] = useState([]);
  const [insights, setInsights] = useState([]);
  const [trends, setTrends] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('week');
  const [selectedStat, setSelectedStat] = useState(null);
  
  const toast = useToast();

  // Fetch analytics data
  useEffect(() => {
    fetchAnalyticsData();
  }, [period]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Fetch dashboard stats
      const statsResponse = await analyticsAPI.getDashboardStats(period);
      if (statsResponse.success) {
        const statsData = statsResponse.data;
        setStats([
          { 
            id: 'focusTime', 
            label: 'Focus Time', 
            value: statsData.focusTime.value, 
            change: statsData.focusTime.change, 
            trend: statsData.focusTime.trend, 
            icon: <Clock size={20} />,
            details: statsData.focusTime.details,
            color: 'bright-blue'
          },
          { 
            id: 'tasksCompleted', 
            label: 'Tasks Done', 
            value: statsData.tasksCompleted.value, 
            change: statsData.tasksCompleted.change, 
            trend: statsData.tasksCompleted.trend, 
            icon: <Target size={20} />,
            details: statsData.tasksCompleted.details,
            color: 'emerald-green'
          },
          { 
            id: 'distractions', 
            label: 'Distractions', 
            value: statsData.distractions.value, 
            change: statsData.distractions.change, 
            trend: statsData.distractions.trend, 
            icon: <AlertTriangle size={20} />,
            details: statsData.distractions.details,
            color: 'electric-red'
          },
          { 
            id: 'aiSuggestions', 
            label: 'AI Suggestions', 
            value: statsData.aiSuggestions.value, 
            change: statsData.aiSuggestions.change, 
            trend: statsData.aiSuggestions.trend, 
            icon: <Lightbulb size={20} />,
            details: statsData.aiSuggestions.details,
            color: 'vibrant-yellow'
          }
        ]);
      }

      // Fetch focus time data
      const focusResponse = await analyticsAPI.getFocusTime(period);
      if (focusResponse.success) {
        setFocusData(focusResponse.data);
      }

      // Fetch insights
      const insightsResponse = await analyticsAPI.getProductivityInsights();
      if (insightsResponse.success) {
        setInsights(insightsResponse.data.slice(0, 3)); // Show top 3 insights
      }

            // Calculate trends from focusData
      if (focusResponse.success && focusResponse.data.length > 0) {
        const weeklyAvg = focusResponse.data.reduce((sum, day) => sum + day.hours, 0) / focusResponse.data.length;
        // You can calculate trends here or fetch from separate API
        // For now, set null or calculate simple trends
        setTrends({
          weeklyTrend: `+${Math.round((weeklyAvg / 6) * 100)}%`, // Example calculation
          monthlyTrend: '+15%', // Would come from monthly data
          comparison: 'Compare with last week data'
        });
      }

    } catch (err) {
      console.error('Error fetching analytics:', err);
      toast.showToast('Failed to load analytics data', 'error');
      // Fallback to sample data
      setSampleData();
    } finally {
      setLoading(false);
    }
  };

  // Fallback sample data
  const setSampleData = () => {
    setStats([
      { label: 'Focus Time', value: '4h 20m', change: '+12%', trend: 'up', icon: <Zap size={20} /> },
      { label: 'Tasks Done', value: '87%', change: '+5%', trend: 'up', icon: <Target size={20} /> },
      { label: 'Distractions', value: '6', change: '-18%', trend: 'down', icon: <TrendingDown size={20} /> },
      { label: 'AI Suggestions', value: '12', change: '+30%', trend: 'up', icon: <TrendingUp size={20} /> },
    ]);
    setFocusData([
      { day: 'Mon', hours: 4.2, goal: 6 },
      { day: 'Tue', hours: 6.1, goal: 6 },
      { day: 'Wed', hours: 3.8, goal: 6 },
      { day: 'Thu', hours: 5.5, goal: 6 },
      { day: 'Fri', hours: 7.2, goal: 6 },
      { day: 'Sat', hours: 2.5, goal: 4 },
      { day: 'Sun', hours: 3.0, goal: 4 }
    ]);
  };

  // Calculate max hours for chart scaling
  const maxHours = focusData.length > 0 
    ? Math.max(...focusData.map(d => Math.max(d.hours, d.goal || 0)))
    : 10;

  // Get icon based on trend
  const getTrendIcon = (trend) => {
    return trend === 'up' 
      ? <TrendingUp size={14} className="text-emerald-green" />
      : <TrendingDown size={14} className="text-electric-red" />;
  };

  // Get color based on stat
  const getStatColor = (stat) => {
    const colors = {
      'Focus Time': 'bright-blue',
      'Tasks Done': 'emerald-green',
      'Distractions': 'electric-red',
      'AI Suggestions': 'vibrant-yellow'
    };
    return colors[stat.label] || 'gray';
  };

  if (loading) {
    return (
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-bright-blue animate-spin" />
          <span className="ml-3 text-gray-400">Loading analytics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">📊 Analytics Dashboard</h2>
        <select 
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="bg-dark-card text-white px-3 py-2 rounded-lg border border-gray-700 focus:outline-none focus:border-bright-blue"
        >
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
        </select>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {stats.map((stat, idx) => (
          <div 
            key={idx} 
            className="p-4 rounded-xl bg-dark-card/50 hover:bg-dark-card/70 cursor-pointer transition-all hover:scale-[1.02]"
            onClick={() => setSelectedStat(selectedStat?.id === stat.id ? null : stat)}
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`p-2 rounded-lg bg-${getStatColor(stat)}/20 text-${getStatColor(stat)}`}>
                {stat.icon}
              </div>
              <span className={`flex items-center text-sm font-medium ${
                stat.trend === 'up' ? 'text-emerald-green' : 'text-electric-red'
              }`}>
                {getTrendIcon(stat.trend)}
                <span className="ml-1">{stat.change}</span>
              </span>
            </div>
            <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
            <div className="text-gray-400 text-sm">{stat.label}</div>
            
            {/* Detailed view when selected */}
            {selectedStat?.id === stat.id && stat.details && (
              <div className="mt-3 pt-3 border-t border-gray-800">
                <div className="text-gray-300 text-sm">{stat.details}</div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Productivity Trends */}
      {trends && (
        <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-bright-blue/10 to-emerald-green/10 border border-bright-blue/20">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={18} className="text-emerald-green" />
            <h4 className="font-medium text-white">Productivity Trends</h4>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-gray-400 text-sm">Weekly</div>
              <div className="text-2xl font-bold text-emerald-green">{trends.weeklyTrend}</div>
            </div>
            <div>
              <div className="text-gray-400 text-sm">Monthly</div>
              <div className="text-2xl font-bold text-emerald-green">{trends.monthlyTrend}</div>
            </div>
            <div>
              <div className="text-gray-400 text-sm">Comparison</div>
              <div className="text-lg font-medium text-white">{trends.comparison}</div>
            </div>
          </div>
        </div>
      )}

      {/* Focus Time Chart */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-white font-medium">Weekly Focus Hours</h4>
          {focusData.length > 0 && (
            <div className="text-sm text-gray-400">
              Avg: {(focusData.reduce((sum, day) => sum + day.hours, 0) / focusData.length).toFixed(1)}h/day
            </div>
          )}
        </div>
        
        {focusData.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No focus time data available
          </div>
        ) : (
          <div className="flex items-end h-32 gap-2">
            {focusData.map((day, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center">
                <div className="relative w-full flex flex-col items-center">
                  {/* Goal line */}
                  <div 
                    className="absolute w-full border-t-2 border-dashed border-gray-600"
                    style={{ bottom: `${(day.goal / maxHours) * 100}%` }}
                  ></div>
                  
                  {/* Actual hours bar */}
                  <div 
                    className="w-3/4 rounded-t-lg transition-all duration-300 hover:w-full cursor-pointer"
                    style={{
                      height: `${(day.hours / maxHours) * 100}%`,
                      background: day.hours >= (day.goal || 0)
                        ? 'linear-gradient(to top, var(--color-emerald-green), var(--color-bright-blue))'
                        : 'linear-gradient(to top, var(--color-electric-red), var(--color-vibrant-yellow))'
                    }}
                    title={`${day.day}: ${day.hours}h (Goal: ${day.goal}h)`}
                  ></div>
                </div>
                <span className="text-gray-400 text-xs mt-2">{day.day}</span>
                <span className={`text-xs font-medium mt-1 ${
                  day.hours >= (day.goal || 0) ? 'text-emerald-green' : 'text-electric-red'
                }`}>
                  {day.hours.toFixed(1)}h
                </span>
              </div>
            ))}
          </div>
        )}
        
        {/* Chart Legend */}
        <div className="flex justify-center gap-4 mt-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-gradient-to-r from-emerald-green to-bright-blue"></div>
            <span className="text-gray-400">Met Goal</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-gradient-to-r from-electric-red to-vibrant-yellow"></div>
            <span className="text-gray-400">Below Goal</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-1 border-t-2 border-dashed border-gray-600"></div>
            <span className="text-gray-400">Daily Goal</span>
          </div>
        </div>
      </div>

      {/* Productivity Insights */}
      {insights.length > 0 && (
        <div className="mb-6">
          <h4 className="text-white font-medium mb-4 flex items-center gap-2">
            <Lightbulb size={18} className="text-vibrant-yellow" />
            AI Insights
          </h4>
          <div className="space-y-3">
            {insights.map((insight) => (
              <div 
                key={insight.id}
                className="p-3 rounded-xl bg-dark-card/30 border border-gray-700"
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg bg-${insight.color}/20 text-${insight.color}`}>
                    {insight.icon === 'Zap' && <Zap size={18} />}
                    {insight.icon === 'AlertTriangle' && <AlertTriangle size={18} />}
                    {insight.icon === 'Target' && <Target size={18} />}
                    {insight.icon === 'TrendingUp' && <TrendingUp size={18} />}
                  </div>
                  <div className="flex-1">
                    <div className="text-white font-medium mb-1">{insight.title}</div>
                    <div className="text-gray-300 text-sm mb-2">{insight.description}</div>
                    <div className="text-bright-blue text-sm">{insight.suggestion}</div>
                  </div>
                  <div className={`text-xs px-2 py-1 rounded-full ${
                    insight.impact === 'high' 
                      ? 'bg-emerald-green/20 text-emerald-green' 
                      : 'bg-vibrant-yellow/20 text-vibrant-yellow'
                  }`}>
                    {insight.impact} impact
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Refresh Button */}
      <div className="flex justify-between items-center pt-4 border-t border-gray-800">
        <div className="text-xs text-gray-500">
          Data period: {period === 'week' ? 'Last 7 days' : period === 'month' ? 'Last 30 days' : 'Last year'}
        </div>
        <button
          onClick={fetchAnalyticsData}
          className="text-sm text-bright-blue hover:text-white hover:underline flex items-center gap-1"
        >
          <Loader2 size={14} className={loading ? 'animate-spin' : ''} />
          Refresh Data
        </button>
      </div>
    </div>
  );
};

export default Analytics;