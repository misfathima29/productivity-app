import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Brain,
  Settings,
  User,
  LogOut,
  ChevronRight,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState('dashboard');
  const navigate = useNavigate();

  // Get user from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const navItems = [
    { id: 'dashboard', icon: <LayoutDashboard size={22} />, label: 'Dashboard' },
    { id: 'ai', icon: <Brain size={22} />, label: 'AI Assistant', path: '/ai-chat' },
    { id: 'settings', icon: <Settings size={22} />, label: 'Settings', path: '/settings' },
    { id: 'profile', icon: <User size={22} />, label: 'Profile', path: '/profile' },
  ];

  const handleNavigation = (id, path) => {
    setActiveItem(id);
    if (path) {
      navigate(path);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className={`
      relative h-screen flex flex-col
      transition-all duration-300 ease-in-out
      ${isCollapsed ? 'w-16 lg:w-20' : 'w-64 lg:w-64'}
      bg-gradient-to-b from-dark-card to-charcoal
      border-r border-gray-800/50
      shadow-2xl
    `}>
      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-6 w-7 h-7 rounded-full
          bg-gradient-to-r from-bright-blue to-emerald-green
          flex items-center justify-center
          shadow-lg hover:shadow-xl hover:scale-110
          transition-all z-10 border-2 border-charcoal"
      >
        {isCollapsed ?
          <ChevronRight size={14} className="text-white" /> :
          <X size={14} className="text-white" />
        }
      </button>

      {/* Logo */}
      <div className="p-5 border-b border-gray-800/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-electric-red via-bright-blue to-emerald-green flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-xl">⚡</span>
          </div>
          
          {!isCollapsed && (
            <div>
              <h1 className="text-xl font-bold text-white">
                ProdHub
              </h1>
              <p className="text-gray-400 text-xs">AI Productivity Suite</p>
            </div>
          )}
        </div>
      </div>

      {/* User Profile */}
      <div className="p-4 border-b border-gray-800/50">
        <div className="flex items-center gap-3">
          <div className="relative w-9 h-9 rounded-full bg-gradient-to-br from-bright-blue to-emerald-green flex items-center justify-center">
            <User size={18} className="text-white" />
          </div>
          
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-white text-sm truncate">
                {user.username || 'User'}
              </h3>
              <p className="text-gray-400 text-xs truncate">
                {user.email || 'Welcome!'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 overflow-y-auto">
        <div className="space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.id, item.path)}
              className={`
                flex items-center ${isCollapsed ? 'justify-center' : 'justify-start'} 
                p-3 rounded-xl transition-all duration-200 group w-full
                ${activeItem === item.id
                  ? 'bg-gradient-to-r from-bright-blue/20 to-emerald-green/10 text-white shadow-lg border-l-4 border-bright-blue'
                  : 'text-gray-400 hover:text-white hover:bg-dark-card/30'
                }
                hover:translate-x-1
              `}
            >
              <div className={`
                ${isCollapsed ? '' : 'mr-3'}
                ${isCollapsed ? 'group-hover:scale-110 transition-transform' : ''}
              `}>
                {item.icon}
              </div>
              {!isCollapsed && (
                <span className="font-medium text-sm">{item.label}</span>
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* Logout Button */}
      <div className="p-3 border-t border-gray-800/50">
        <button
          onClick={handleLogout}
          className={`
            w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-center gap-2'} 
            p-2.5 rounded-xl bg-gradient-to-r from-electric-red/20 to-electric-red/10
            text-electric-red hover:from-electric-red/30 hover:to-electric-red/20 
            border border-electric-red/20 hover:border-electric-red/30
            transition-all group
          `}
        >
          <LogOut size={18} className="group-hover:scale-110 transition-transform" />
          {!isCollapsed && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;