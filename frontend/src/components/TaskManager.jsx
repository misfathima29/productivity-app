import { useState, useEffect } from 'react';
import { Check, Clock, Plus, X, Loader2 } from 'lucide-react';
import { taskAPI } from '../utils/api';
import { useToast } from '../context/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';
import EmptyState from './EmptyState';

const TaskManager = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingTask, setAddingTask] = useState(false);
  const toast = useToast();

  // Fetch tasks from backend
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching tasks from API...');

      const response = await taskAPI.getTasks();
      console.log('📦 API Response:', response);

      const tasksData = response.data || response.tasks || response;

      if (Array.isArray(tasksData)) {
        setTasks(tasksData);
        setError(null);
        console.log(`✅ Loaded ${tasksData.length} tasks`);
      } else {
        console.error('❌ Unexpected response format:', response);
        setError('Invalid response format from server');
        toast.showToast('Using offline mode with sample data', 'warning');
        setTasks(getSampleTasks());
      }
    } catch (err) {
      console.error('❌ Error fetching tasks:', err);
      setError(`Failed to fetch tasks: ${err.message}`);
      toast.showToast('Using offline mode with sample data', 'warning');
      setTasks(getSampleTasks());
    } finally {
      setLoading(false);
    }
  };

  // Sample tasks for development
  const getSampleTasks = () => {
    return [
      { _id: '1', text: 'Design homepage mockup', completed: false, priority: 'high', time: '2h', category: 'Work' },
      { _id: '2', text: 'Team meeting at 3 PM', completed: false, priority: 'medium', time: '1h', category: 'Meeting' },
      { _id: '3', text: 'Fix login bug', completed: true, priority: 'high', time: '30m', category: 'Development' },
    ];
  };

  const addTask = async () => {
    if (!newTask.trim()) return;

    const taskData = {
      title: newTask,
      text: newTask,
      completed: false,
      priority: 'medium',
      time: '1h',
      category: 'General',
      description: ''
    };

    try {
      setAddingTask(true);
      console.log('➕ Adding task:', taskData);

      const response = await taskAPI.addTask(taskData);
      console.log('✅ Task added response:', response);

      const newTaskFromServer = response.data || response.task || response;

      if (newTaskFromServer) {
        setTasks([...tasks, newTaskFromServer]);
        setNewTask('');
        toast.showToast('Task added successfully!', 'success');
        console.log('✅ Task added successfully');
      }
    } catch (err) {
      console.error('❌ Error adding task:', err);
      toast.showToast('Failed to add task. Please try again.', 'error');
    } finally {
      setAddingTask(false);
    }
  };

  const toggleTask = async (id) => {
    try {
      console.log('🔄 Toggling task:', id);

      const taskToUpdate = tasks.find(t => t._id === id);
      if (!taskToUpdate) return;

      const updatedTaskData = {
        ...taskToUpdate,
        completed: !taskToUpdate.completed
      };

      console.log('📤 Sending update:', updatedTaskData);
      const response = await taskAPI.updateTask(id, updatedTaskData);
      console.log('✅ Server response:', response);

      const updatedTask = response.data || response;

      setTasks(prevTasks =>
        prevTasks.map(task =>
          task._id === id ? { ...task, completed: !task.completed } : task
        )
      );

    } catch (err) {
      console.error('❌ Error updating task:', err);
      toast.showToast(`Failed to update task: ${err.message}`, 'error');
    }
  };

  const deleteTask = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    try {
      console.log('🗑️ Deleting task:', id);
      await taskAPI.deleteTask(id);

      setTasks(tasks.filter(task => task._id !== id));
      toast.showToast('Task deleted successfully!', 'success');
      console.log('✅ Task deleted');
    } catch (err) {
      console.error('❌ Error deleting task:', err);
      toast.showToast('Failed to delete task.', 'error');
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: 'bg-electric-red',
      medium: 'bg-vibrant-yellow',
      low: 'bg-emerald-green'
    };
    return colors[priority] || 'bg-gray-600';
  };

  // For debugging: Log tasks when they change
  useEffect(() => {
    console.log('📝 Current tasks:', tasks);
  }, [tasks]);

  if (loading) {
    return (
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-bright-blue animate-spin" />
          <span className="ml-3 text-gray-400">Loading tasks...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">Task Manager</h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-400">
            {tasks.filter(t => !t.completed).length} pending • {tasks.length} total
          </span>
          {error && (
            <span className="text-xs bg-electric-red/20 text-electric-red px-2 py-1 rounded">
              Using local data
            </span>
          )}
        </div>
      </div>

      {/* Add Task Form */}
      <div className="flex mb-6">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addTask()}
          placeholder="What needs to be done?"
          className="flex-1 bg-dark-card/50 border border-gray-700 rounded-l-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-bright-blue"
          disabled={addingTask}
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={addTask}
          disabled={addingTask || !newTask.trim()}
          className="bg-bright-blue text-white px-6 py-3 rounded-r-xl hover:bg-bright-blue/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {addingTask ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Plus className="w-5 h-5" />
          )}
        </motion.button>
      </div>

      {/* Debug Info Button */}
      <div className="mb-4">
        <button
          onClick={() => {
            console.log('🐛 Debug Info:', {
              tasks,
              apiUrl: 'http://localhost:5000/api/tasks',
              localStorageToken: localStorage.getItem('token')
            });
            fetchTasks();
          }}
          className="text-xs text-gray-500 hover:text-white bg-gray-800/50 px-3 py-1 rounded"
        >
          🐛 Debug / Refresh
        </button>
      </div>

      {/* Tasks List with EmptyState */}
      <AnimatePresence>
        {tasks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <EmptyState 
              icon="📋"
              title="No tasks yet"
              message="Create your first task to get started!"
              actionText="Create Task"
              onAction={() => {
                // Focus on the input field
                document.querySelector('input[type="text"]')?.focus();
              }}
            />
          </motion.div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {tasks.map((task) => (
                <motion.div
                  key={task._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{
                    opacity: 0,
                    height: 0,
                    marginBottom: 0,
                    transition: { duration: 0.2 }
                  }}
                  transition={{ duration: 0.2 }}
                  whileHover={{ scale: 1.01 }}
                  className={`flex items-center p-4 rounded-xl transition-all ${task.completed
                      ? 'bg-dark-card/30 border border-gray-800'
                      : 'bg-dark-card/50 border border-gray-700 hover:border-gray-600'
                    }`}
                >
                  <button
                    onClick={() => toggleTask(task._id)}
                    className={`w-6 h-6 rounded-full flex items-center justify-center mr-4 transition-all ${task.completed
                        ? 'bg-emerald-green'
                        : 'border-2 border-gray-500 hover:border-bright-blue'
                      }`}
                  >
                    {task.completed && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Check className="w-4 h-4 text-white" />
                      </motion.div>
                    )}
                  </button>

                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-1">
                      <span className={`text-sm px-2 py-0.5 rounded-full ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                      <span className="text-xs text-gray-400 flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {task.time}
                      </span>
                      <span className="text-xs text-gray-400">{task.category}</span>
                    </div>
                    <p className={`${task.completed ? 'line-through text-gray-500' : 'text-white'}`}>
                      {task.text || task.title}
                    </p>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => deleteTask(task._id)}
                    className="text-gray-400 hover:text-electric-red p-1"
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </AnimatePresence>

      {/* Connection Status */}
      <div className="mt-6 pt-4 border-t border-gray-800">
        <div className="text-xs text-gray-500">
          Backend: <span className={error ? 'text-electric-red' : 'text-emerald-green'}>
            {error ? 'Not Connected' : 'Connected'}
          </span>
          {error && (
            <div className="mt-1">
              <span className="text-yellow-500">Running in offline mode with sample data</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskManager;