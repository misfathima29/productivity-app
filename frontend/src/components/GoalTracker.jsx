import { useState, useEffect } from 'react';
import { Target, Trophy, TrendingUp, Calendar, CheckCircle, XCircle, 
         Plus, Edit, Trash2, X, Save, Loader2, ChevronUp, ChevronDown } from 'lucide-react';
import { goalAPI } from '../utils/api';
import { useToast } from '../context/ToastContext';

const GoalTracker = () => {
  // State
  const [goals, setGoals] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    target: 100,
    deadline: '',
    color: 'electric-red',
    category: 'personal'
  });
  
  // UI state
  const [expandedGoal, setExpandedGoal] = useState(null);
  const [progressUpdates, setProgressUpdates] = useState({});
  
  const toast = useToast();

  // Available colors and categories
  const colors = [
    { name: 'electric-red', label: 'Red' },
    { name: 'emerald-green', label: 'Green' },
    { name: 'bright-blue', label: 'Blue' },
    { name: 'vibrant-yellow', label: 'Yellow' }
  ];

  const categories = [
    { id: 'learning', label: 'Learning', icon: '🎓' },
    { id: 'health', label: 'Health', icon: '🏃' },
    { id: 'work', label: 'Work', icon: '💼' },
    { id: 'personal', label: 'Personal', icon: '⭐' },
    { id: 'financial', label: 'Financial', icon: '💰' },
    { id: 'creative', label: 'Creative', icon: '🎨' }
  ];

  // Fetch goals on component mount
  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const response = await goalAPI.getGoals();
      
      if (response.success) {
        setGoals(response.data || []);
        setStats(response.stats || null);
      } else {
        throw new Error(response.error || 'Failed to load goals');
      }
    } catch (err) {
      console.error('Error fetching goals:', err);
      toast.showToast('Failed to load goals', 'error');
      // Fallback to sample data
      setGoals(getSampleGoals());
      setStats({
        total: 4,
        completed: 1,
        inProgress: 3,
        averageProgress: 74,
        completionRate: 25
      });
    } finally {
      setLoading(false);
    }
  };

  // Sample goals for fallback
  const getSampleGoals = () => {
    return [
      { id: '1', title: 'Complete React Course', progress: 85, deadline: 'Dec 20', completed: false, color: 'electric-red', category: 'learning' },
      { id: '2', title: 'Exercise 5x this week', progress: 60, deadline: 'Weekly', completed: false, color: 'emerald-green', category: 'health' },
      { id: '3', title: 'Read 2 Books', progress: 50, deadline: 'Monthly', completed: false, color: 'bright-blue', category: 'personal' },
      { id: '4', title: 'Learn TypeScript', progress: 100, deadline: 'Completed', completed: true, color: 'vibrant-yellow', category: 'learning' },
    ];
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle add goal
  const handleAddGoal = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.showToast('Please enter a goal title', 'error');
      return;
    }

    try {
      const response = await goalAPI.addGoal(formData);
      if (response.success) {
        toast.showToast('Goal created successfully!', 'success');
        await fetchGoals();
        resetForm();
      } else {
        throw new Error(response.error || 'Failed to create goal');
      }
    } catch (err) {
      console.error('Error adding goal:', err);
      toast.showToast(err.message || 'Failed to create goal', 'error');
    }
  };

  // Handle update goal
  const handleUpdateGoal = async () => {
    if (!editingGoal) return;

    try {
      const response = await goalAPI.updateGoal(editingGoal.id, formData);
      if (response.success) {
        toast.showToast('Goal updated successfully!', 'success');
        await fetchGoals();
        resetForm();
      } else {
        throw new Error(response.error || 'Failed to update goal');
      }
    } catch (err) {
      console.error('Error updating goal:', err);
      toast.showToast(err.message || 'Failed to update goal', 'error');
    }
  };

  // Handle delete goal
  const handleDeleteGoal = async (id) => {
    if (!window.confirm('Are you sure you want to delete this goal?')) return;

    try {
      const response = await goalAPI.deleteGoal(id);
      if (response.success) {
        toast.showToast('Goal deleted successfully', 'success');
        await fetchGoals();
      } else {
        throw new Error(response.error || 'Failed to delete goal');
      }
    } catch (err) {
      console.error('Error deleting goal:', err);
      toast.showToast(err.message || 'Failed to delete goal', 'error');
    }
  };

  // Handle progress update
  const handleProgressUpdate = async (goalId, newProgress) => {
    try {
      const response = await goalAPI.updateGoalProgress(goalId, newProgress);
      if (response.success) {
        // Update local state immediately
        setGoals(prev => prev.map(goal => 
          goal.id === goalId 
            ? { ...goal, progress: newProgress, completed: newProgress === 100 }
            : goal
        ));
        
        // Update progress updates tracking
        setProgressUpdates(prev => ({ ...prev, [goalId]: newProgress }));
        
        // Show toast for significant changes
        if (newProgress === 100) {
          toast.showToast('Goal completed! 🎉', 'success');
        }
      }
    } catch (err) {
      console.error('Error updating progress:', err);
      toast.showToast('Failed to update progress', 'error');
    }
  };

  // Handle toggle completion
  const handleToggleCompletion = async (goalId, completed) => {
    try {
      const response = await goalAPI.toggleGoalCompletion(goalId, completed);
      if (response.success) {
        setGoals(prev => prev.map(goal => 
          goal.id === goalId 
            ? { ...goal, completed: completed, progress: completed ? 100 : Math.min(goal.progress, 99) }
            : goal
        ));
        toast.showToast(completed ? 'Goal marked as completed!' : 'Goal marked as in progress', 'success');
      }
    } catch (err) {
      console.error('Error toggling completion:', err);
      toast.showToast('Failed to update goal status', 'error');
    }
  };

  // Start editing a goal
  const startEditGoal = (goal) => {
    setEditingGoal(goal);
    setFormData({
      title: goal.title,
      description: goal.description || '',
      target: goal.target || 100,
      deadline: goal.deadline || '',
      color: goal.color || 'electric-red',
      category: goal.category || 'personal'
    });
    setShowAddForm(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      target: 100,
      deadline: '',
      color: 'electric-red',
      category: 'personal'
    });
    setShowAddForm(false);
    setEditingGoal(null);
  };

  // Get progress color
  const getProgressColor = (color) => {
    const colors = {
      'electric-red': 'bg-electric-red',
      'emerald-green': 'bg-emerald-green',
      'bright-blue': 'bg-bright-blue',
      'vibrant-yellow': 'bg-vibrant-yellow',
    };
    return colors[color] || 'bg-gray-600';
  };

  // Format deadline
  const formatDeadline = (deadline) => {
    if (deadline === 'weekly' || deadline === 'monthly') {
      return deadline.charAt(0).toUpperCase() + deadline.slice(1);
    }
    return deadline;
  };

  // Get category icon
  const getCategoryIcon = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.icon : '🎯';
  };

  // Get category label
  const getCategoryLabel = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.label : 'General';
  };

  if (loading) {
    return (
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-bright-blue animate-spin" />
          <span className="ml-3 text-gray-400">Loading goals...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Trophy size={22} className="text-vibrant-yellow" />
            Goal Tracker
          </h3>
          <p className="text-gray-400 text-sm">
            {stats ? `${stats.completed}/${stats.total} goals completed` : 'Track your goals'}
          </p>
        </div>
        <button 
          onClick={() => {
            resetForm();
            setShowAddForm(true);
          }}
          className="bg-gradient-to-r from-bright-blue to-emerald-green text-white px-4 py-2 rounded-lg hover:opacity-90 transition flex items-center gap-2"
        >
          <Plus size={18} />
          New Goal
        </button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="mb-6 p-4 rounded-xl bg-dark-card/50 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-white font-medium">
              {editingGoal ? 'Edit Goal' : 'Create New Goal'}
            </h4>
            <button
              onClick={resetForm}
              className="p-1 hover:bg-gray-700 rounded"
            >
              <X size={18} className="text-gray-400" />
            </button>
          </div>
          
          <form onSubmit={editingGoal ? handleUpdateGoal : handleAddGoal}>
            <div className="space-y-4">
              <div>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Goal title"
                  className="w-full bg-dark-card/70 text-white px-4 py-3 rounded-lg border border-gray-700 focus:outline-none focus:border-bright-blue"
                  required
                />
              </div>
              
              <div>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Goal description (optional)"
                  rows="2"
                  className="w-full bg-dark-card/70 text-white px-4 py-3 rounded-lg border border-gray-700"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Target</label>
                  <div className="relative">
                    <input
                      type="number"
                      name="target"
                      value={formData.target}
                      onChange={handleInputChange}
                      className="w-full bg-dark-card/70 text-white px-4 py-2 rounded-lg border border-gray-700"
                      min="1"
                      max="1000"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">%</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Deadline</label>
                  <input
                    type="text"
                    name="deadline"
                    value={formData.deadline}
                    onChange={handleInputChange}
                    placeholder="e.g., Dec 31, Weekly, Monthly"
                    className="w-full bg-dark-card/70 text-white px-4 py-2 rounded-lg border border-gray-700"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Color</label>
                  <div className="flex gap-2">
                    {colors.map((color) => (
                      <button
                        key={color.name}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, color: color.name }))}
                        className={`w-8 h-8 rounded-full ${
                          formData.color === color.name 
                            ? 'ring-2 ring-white ring-offset-2 ring-offset-dark-card' 
                            : ''
                        }`}
                        style={{ backgroundColor: `var(--color-${color.name})` }}
                        title={color.label}
                      />
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full bg-dark-card/70 text-white px-4 py-2 rounded-lg border border-gray-700"
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.icon} {category.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-bright-blue to-emerald-green text-white py-3 rounded-lg hover:opacity-90"
                >
                  {editingGoal ? 'Update Goal' : 'Create Goal'}
                </button>
                
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 bg-gray-700 text-white py-3 rounded-lg hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Goals List */}
      <div className="space-y-4">
        {goals.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No goals yet. Create your first goal above!
          </div>
        ) : (
          goals.map((goal) => (
            <div 
              key={goal.id} 
              className="bg-dark-card/50 rounded-xl p-4 hover:bg-dark-card/80 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => handleToggleCompletion(goal.id, !goal.completed)}
                    className={`p-2 rounded-lg ${getProgressColor(goal.color)}/20 hover:opacity-80 transition`}
                  >
                    {goal.completed ? (
                      <CheckCircle size={20} className={getProgressColor(goal.color).replace('bg-', 'text-')} />
                    ) : (
                      <Target size={20} className={getProgressColor(goal.color).replace('bg-', 'text-')} />
                    )}
                  </button>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className={`font-medium ${goal.completed ? 'text-gray-400 line-through' : 'text-white'}`}>
                        {goal.title}
                      </h4>
                      <span className="text-xs bg-gray-800 text-gray-300 px-2 py-0.5 rounded">
                        {getCategoryIcon(goal.category)} {getCategoryLabel(goal.category)}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
                      <Calendar size={14} />
                      {formatDeadline(goal.deadline)}
                      {goal.description && (
                        <button
                          onClick={() => setExpandedGoal(expandedGoal === goal.id ? null : goal.id)}
                          className="ml-2 text-xs text-bright-blue hover:underline"
                        >
                          {expandedGoal === goal.id ? 'Show less' : 'Show details'}
                        </button>
                      )}
                    </div>
                    
                    {expandedGoal === goal.id && goal.description && (
                      <div className="mt-2 text-gray-300 text-sm">{goal.description}</div>
                    )}
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">{goal.progress}%</div>
                  <div className={`text-xs ${goal.completed ? 'text-emerald-green' : 'text-gray-400'}`}>
                    {goal.completed ? 'Completed' : 'In Progress'}
                  </div>
                </div>
              </div>

              {/* Progress Bar and Controls */}
              <div className="space-y-3">
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(goal.color)}`}
                    style={{ width: `${goal.progress}%` }}
                  ></div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {/* Progress Controls */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleProgressUpdate(goal.id, Math.max(0, goal.progress - 10))}
                        className="p-1 hover:bg-gray-700 rounded text-gray-400"
                        title="Decrease progress"
                      >
                        <ChevronDown size={16} />
                      </button>
                      <span className="text-sm text-gray-400">{goal.progress}%</span>
                      <button
                        onClick={() => handleProgressUpdate(goal.id, Math.min(100, goal.progress + 10))}
                        className="p-1 hover:bg-gray-700 rounded text-gray-400"
                        title="Increase progress"
                      >
                        <ChevronUp size={16} />
                      </button>
                    </div>
                    
                    {/* Quick Set Buttons */}
                    <div className="flex gap-1 ml-2">
                      <button
                        onClick={() => handleProgressUpdate(goal.id, 25)}
                        className="text-xs px-2 py-1 bg-gray-800 text-gray-300 rounded hover:bg-gray-700"
                      >
                        25%
                      </button>
                      <button
                        onClick={() => handleProgressUpdate(goal.id, 50)}
                        className="text-xs px-2 py-1 bg-gray-800 text-gray-300 rounded hover:bg-gray-700"
                      >
                        50%
                      </button>
                      <button
                        onClick={() => handleProgressUpdate(goal.id, 75)}
                        className="text-xs px-2 py-1 bg-gray-800 text-gray-300 rounded hover:bg-gray-700"
                      >
                        75%
                      </button>
                      <button
                        onClick={() => handleProgressUpdate(goal.id, 100)}
                        className="text-xs px-2 py-1 bg-emerald-green/20 text-emerald-green rounded hover:bg-emerald-green/30"
                      >
                        100%
                      </button>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-1">
                    <button
                      onClick={() => startEditGoal(goal)}
                      className="p-1 hover:bg-gray-700 rounded text-gray-400"
                      title="Edit goal"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteGoal(goal.id)}
                      className="p-1 hover:bg-gray-700 rounded text-gray-400"
                      title="Delete goal"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Overall Progress */}
      <div className="mt-6 pt-4 border-t border-gray-800">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-400">Overall Progress</div>
            <div className="text-2xl font-bold text-white">
              {stats ? `${stats.averageProgress}%` : '0%'}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-400">Goals Completed</div>
            <div className="text-2xl font-bold text-emerald-green">
              {stats ? `${stats.completed}/${stats.total}` : '0/0'}
            </div>
          </div>
        </div>
        
        {/* Refresh Button */}
        <div className="mt-4">
          <button
            onClick={fetchGoals}
            className="text-sm text-bright-blue hover:text-white hover:underline flex items-center gap-1"
          >
            ↻ Refresh Goals
          </button>
        </div>
      </div>
    </div>
  );
};

export default GoalTracker;