import { Zap, Target, TrendingUp, Clock, Brain, Trophy, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { analyticsAPI } from '../utils/api';
import { useToast } from '../context/ToastContext';

const StatsBar = () => {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  // Fetch today's stats
  useEffect(() => {
    fetchTodayStats();
  }, []);

  const fetchTodayStats = async () => {
    try {
      setLoading(true);
      const response = await analyticsAPI.getTodayStats();
      
      if (response.success && Array.isArray(response.data)) {
        setStats(response.data);
      } else {
        // Fallback to sample data
        setStats(getSampleStats());
        console.log('Using sample stats data');
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      setStats(getSampleStats());
      toast.showToast('Using sample stats data', 'info');
    } finally {
      setLoading(false);
    }
  };

  // Sample stats for development/fallback
  const getSampleStats = () => {
    return [
      { id: 'focusTime', label: 'Focus Time', value: '2h 15m', icon: <Zap size={18} />, color: 'electric-red', change: '+25%' },
      { id: 'tasksDone', label: 'Tasks Done', value: '8/12', icon: <Target size={18} />, color: 'emerald-green', change: '+67%' },
      { id: 'productivity', label: 'Productivity', value: '87%', icon: <TrendingUp size={18} />, color: 'vibrant-yellow', change: '+12%' },
      { id: 'aiSuggestions', label: 'AI Suggestions', value: '15', icon: <Brain size={18} />, color: 'bright-blue', change: 'NEW' },
      { id: 'weeklyGoal', label: 'Weekly Goal', value: '5/7 days', icon: <Trophy size={18} />, color: 'electric-red', change: '71%' },
      { id: 'deepWork', label: 'Deep Work', value: '1.5h', icon: <Clock size={18} />, color: 'emerald-green', change: '+40m' },
    ];
  };

  if (loading) {
    return (
      <div className="glass-card rounded-2xl p-4 mb-6">
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-6 h-6 text-bright-blue animate-spin" />
          <span className="ml-2 text-gray-400">Loading today's stats...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-bold flex items-center gap-2">
          <Zap size={20} className="text-electric-red" />
          Today's Stats
        </h3>
        <button
          onClick={fetchTodayStats}
          className="text-xs text-gray-500 hover:text-white bg-gray-800/50 px-2 py-1 rounded"
          title="Refresh stats"
        >
          ↻ Refresh
        </button>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((stat, idx) => (
          <div 
            key={stat.id || idx} 
            className="bg-dark-card/50 rounded-xl p-4 hover:bg-dark-card/80 transition-all hover:scale-[1.02] cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`p-2 rounded-lg bg-${stat.color}/20`}>
                <div className={`text-${stat.color}`}>
                  {stat.icon}
                </div>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${
                stat.change === 'NEW' 
                  ? 'bg-bright-blue/20 text-bright-blue' 
                  : stat.change.includes('+')
                    ? 'bg-emerald-green/20 text-emerald-green'
                    : 'bg-vibrant-yellow/20 text-vibrant-yellow'
              }`}>
                {stat.change}
              </span>
            </div>
            <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
            <div className="text-gray-400 text-sm">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatsBar;