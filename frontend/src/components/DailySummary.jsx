import { Brain, TrendingUp, TrendingDown, Award, Clock, Zap, BarChart, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { analyticsAPI } from '../utils/api';
import { useToast } from '../context/ToastContext';

const DailySummary = () => {
  const [insights, setInsights] = useState([]);
  const [stats, setStats] = useState([]);
  const [recommendation, setRecommendation] = useState('');
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  // Fetch daily summary data
  useEffect(() => {
    fetchDailySummary();
  }, []);

  const fetchDailySummary = async () => {
    try {
      setLoading(true);
      const response = await analyticsAPI.getDailySummary();
      
      if (response.success) {
        // Set real data from API
        setInsights(response.data.insights || getSampleInsights());
        setStats(response.data.stats || getSampleStats());
        setRecommendation(response.data.recommendation || getSampleRecommendation());
      } else {
        // Fallback to sample data
        setInsights(getSampleInsights());
        setStats(getSampleStats());
        setRecommendation(getSampleRecommendation());
        console.log('Using sample daily summary data');
      }
    } catch (error) {
      console.error('Error fetching daily summary:', error);
      setInsights(getSampleInsights());
      setStats(getSampleStats());
      setRecommendation(getSampleRecommendation());
      toast.showToast('Using sample summary data', 'info');
    } finally {
      setLoading(false);
    }
  };

  // Sample insights for development/fallback
  const getSampleInsights = () => {
    return [
      { 
        id: 'insight1',
        type: 'positive', 
        text: 'You were most productive between 9 AM - 11 AM', 
        icon: <TrendingUp size={18} />,
        impact: 'High'
      },
      { 
        id: 'insight2',
        type: 'warning', 
        text: 'Social media usage increased by 40% today', 
        icon: <TrendingDown size={18} />,
        impact: 'Medium'
      },
      { 
        id: 'insight3',
        type: 'positive', 
        text: 'Completed 3 high-priority tasks ahead of schedule', 
        icon: <Award size={18} />,
        impact: 'High'
      },
      { 
        id: 'insight4',
        type: 'suggestion', 
        text: 'Try 25-minute focus sessions for better concentration', 
        icon: <Brain size={18} />,
        impact: 'Low'
      },
    ];
  };

  // Sample stats for development/fallback
  const getSampleStats = () => {
    return [
      { id: 'focusScore', label: 'Focus Score', value: '87%', change: '+5%', color: 'emerald-green', icon: <Zap size={16} /> },
      { id: 'deepWork', label: 'Deep Work', value: '3.2h', change: '+45m', color: 'bright-blue', icon: <Clock size={16} /> },
      { id: 'taskCompletion', label: 'Task Completion', value: '92%', change: '+8%', color: 'electric-red', icon: <BarChart size={16} /> },
      { id: 'distractions', label: 'Distractions', value: '12', change: '-4', color: 'vibrant-yellow', icon: <TrendingDown size={16} /> },
    ];
  };

  // Sample recommendation
  const getSampleRecommendation = () => {
    return 'Based on your patterns, try starting with creative work at 10 AM when your focus is highest. Schedule meetings in the afternoon when your energy naturally dips.';
  };

  const getInsightColor = (type) => {
    switch(type) {
      case 'positive': return 'bg-emerald-green/20 text-emerald-green border-emerald-green/30';
      case 'warning': return 'bg-electric-red/20 text-electric-red border-electric-red/30';
      case 'suggestion': return 'bg-bright-blue/20 text-bright-blue border-bright-blue/30';
      default: return 'bg-gray-800/50 text-gray-300 border-gray-700';
    }
  };

  const getImpactColor = (impact) => {
    switch(impact) {
      case 'High': return 'bg-emerald-green text-white';
      case 'Medium': return 'bg-vibrant-yellow text-charcoal';
      case 'Low': return 'bg-gray-600 text-white';
      default: return 'bg-gray-700 text-white';
    }
  };

  if (loading) {
    return (
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-bright-blue animate-spin" />
          <span className="ml-3 text-gray-400">Loading daily summary...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Brain size={22} className="text-bright-blue" />
            AI Daily Summary
          </h3>
          <p className="text-gray-400 text-sm">AI-powered insights from your day</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-sm text-gray-400">
            Today, {new Date().toLocaleDateString('en-US', { weekday: 'long' })}
          </div>
          <button
            onClick={fetchDailySummary}
            className="text-xs text-gray-500 hover:text-white bg-gray-800/50 px-2 py-1 rounded"
            title="Refresh summary"
          >
            ↻
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => (
          <div key={stat.id} className="bg-dark-card/50 rounded-xl p-4 text-center">
            <div className={`inline-flex p-2 rounded-lg mb-2 ${stat.color}/20`}>
              <div className={stat.color}>
                {stat.icon}
              </div>
            </div>
            <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
            <div className="text-gray-400 text-sm mb-1">{stat.label}</div>
            <div className={`text-xs ${
              stat.change.includes('+') || stat.change.includes('-4') 
                ? 'text-emerald-green' 
                : 'text-electric-red'
            }`}>
              {stat.change}
            </div>
          </div>
        ))}
      </div>

      {/* AI Insights */}
      <div className="space-y-4">
        <h4 className="text-white font-medium flex items-center gap-2">
          <Brain size={18} className="text-bright-blue" />
          AI Insights & Recommendations
        </h4>
        
        {insights.map((insight) => (
          <div 
            key={insight.id} 
            className={`p-4 rounded-xl border ${getInsightColor(insight.type)} transition-all hover:scale-[1.01]`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  {insight.icon}
                </div>
                <p className="text-white/90">{insight.text}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${getImpactColor(insight.impact)}`}>
                {insight.impact}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* AI Recommendation */}
      {recommendation && (
        <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-bright-blue/20 to-emerald-green/20 border border-bright-blue/30">
          <div className="flex items-center gap-3 mb-2">
            <Brain size={20} className="text-bright-blue" />
            <h4 className="font-bold text-white">Tomorrow's Recommendation</h4>
          </div>
          <p className="text-gray-300">
            {recommendation}
          </p>
        </div>
      )}
    </div>
  );
};

export default DailySummary;