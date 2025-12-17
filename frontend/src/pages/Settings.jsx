import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Bell, Shield, User, Save, Eye, EyeOff } from 'lucide-react';
import { settingsAPI } from '../utils/api';

const Settings = () => {
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: true,
      reminders: true
    },
    privacy: {
      dataSharing: true
    }
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [user, setUser] = useState(null);

  // Load settings and user data
  useEffect(() => {
    loadSettings();
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    setUser(userData);
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await settingsAPI.getSettings();
      
      if (response.success) {
        setSettings(prev => ({
          ...prev,
          ...response.data
        }));
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      setMessage('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationToggle = async (key) => {
    const updatedNotifications = {
      ...settings.notifications,
      [key]: !settings.notifications[key]
    };
    
    const updatedSettings = {
      ...settings,
      notifications: updatedNotifications
    };
    
    await updateSettings(updatedSettings);
  };

  const handlePrivacyToggle = async (key) => {
    const updatedPrivacy = {
      ...settings.privacy,
      [key]: !settings.privacy[key]
    };
    
    const updatedSettings = {
      ...settings,
      privacy: updatedPrivacy
    };
    
    await updateSettings(updatedSettings);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage('New passwords do not match');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      setMessage('Password must be at least 6 characters');
      return;
    }
    
    try {
      setSaving(true);
      setMessage('Changing password...');
      
      // Note: You need to implement password change endpoint in backend
      // For now, just show success message
      setMessage('Password change feature coming soon!');
      
      // Clear password fields
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
    } catch (error) {
      console.error('Failed to change password:', error);
      setMessage('Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const updateSettings = async (newSettings) => {
    try {
      setSaving(true);
      const response = await settingsAPI.updateSettings(newSettings);
      
      if (response.success) {
        setSettings(newSettings);
        setMessage('Settings saved successfully');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(response.error || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      setMessage('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAll = async () => {
    await updateSettings(settings);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
        <div className="text-white">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-dark p-4 lg:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-bright-blue to-emerald-green flex items-center justify-center">
              <SettingsIcon size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-white">Settings</h1>
              <p className="text-gray-400">Manage your account preferences</p>
            </div>
          </div>
          
          {message && (
            <div className={`p-3 rounded-lg mb-4 ${
              message.includes('Failed') || message.includes('Error')
                ? 'bg-gradient-to-r from-electric-red/10 to-vibrant-yellow/10 border border-electric-red/30 text-electric-red' 
                : 'bg-gradient-to-r from-emerald-green/10 to-bright-blue/10 border border-emerald-green/30 text-emerald-green'
            }`}>
              {message}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Info Card */}
          <div className="lg:col-span-1">
            <div className="glass-card rounded-2xl p-6 sticky top-6">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-bright-blue to-emerald-green flex items-center justify-center mb-4">
                  <User size={32} className="text-white" />
                </div>
                <h3 className="text-white font-bold text-lg">{user?.username || 'User'}</h3>
                <p className="text-gray-400 text-sm">{user?.email || 'user@example.com'}</p>
                <div className="mt-4 px-4 py-2 bg-dark-card/50 rounded-lg">
                  <p className="text-gray-300 text-sm">Member since</p>
                  <p className="text-white font-medium">{new Date().toLocaleDateString()}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Account Status</span>
                  <span className="px-3 py-1 bg-emerald-green/20 text-emerald-green rounded-full text-sm font-medium">Active</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Storage Used</span>
                  <span className="text-white font-medium">25%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Settings Sections */}
          <div className="lg:col-span-2 space-y-6">
            {/* Notifications */}
            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <Bell size={22} className="text-bright-blue" />
                <h2 className="text-xl font-bold text-white">Notifications</h2>
              </div>
              
              <div className="space-y-4">
                {Object.entries(settings.notifications).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-medium capitalize">{key} Notifications</h3>
                      <p className="text-gray-400 text-sm">
                        {key === 'email' && 'Receive email updates'}
                        {key === 'push' && 'Push notifications'}
                        {key === 'reminders' && 'Task reminders'}
                      </p>
                    </div>
                    <button
                      onClick={() => handleNotificationToggle(key)}
                      disabled={saving}
                      className={`w-12 h-6 rounded-full transition-all ${
                        value ? 'bg-emerald-green' : 'bg-gray-700'
                      } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white transform transition-transform ${
                        value ? 'translate-x-7' : 'translate-x-1'
                      }`}></div>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Privacy & Security */}
            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <Shield size={22} className="text-emerald-green" />
                <h2 className="text-xl font-bold text-white">Privacy & Security</h2>
              </div>
              
              <div className="space-y-6">
                {/* Data Sharing */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-medium">Data Sharing</h3>
                    <p className="text-gray-400 text-sm">Share anonymous data to improve AI</p>
                  </div>
                  <button
                    onClick={() => handlePrivacyToggle('dataSharing')}
                    disabled={saving}
                    className={`w-12 h-6 rounded-full transition-all ${
                      settings.privacy.dataSharing ? 'bg-emerald-green' : 'bg-gray-700'
                    } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white transform transition-transform ${
                      settings.privacy.dataSharing ? 'translate-x-7' : 'translate-x-1'
                    }`}></div>
                  </button>
                </div>

                {/* Password Change */}
                <div className="pt-4 border-t border-gray-800">
                  <h3 className="text-white font-medium mb-4">Change Password</h3>
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div className="relative">
                      <input
                        type={showPasswords.current ? "text" : "password"}
                        placeholder="Current Password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                        className="w-full bg-dark-card text-white px-4 py-3 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-bright-blue"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({...showPasswords, current: !showPasswords.current})}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-white"
                      >
                        {showPasswords.current ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    
                    <div className="relative">
                      <input
                        type={showPasswords.new ? "text" : "password"}
                        placeholder="New Password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                        className="w-full bg-dark-card text-white px-4 py-3 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-bright-blue"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({...showPasswords, new: !showPasswords.new})}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-white"
                      >
                        {showPasswords.new ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    
                    <div className="relative">
                      <input
                        type={showPasswords.confirm ? "text" : "password"}
                        placeholder="Confirm New Password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                        className="w-full bg-dark-card text-white px-4 py-3 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-bright-blue"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-white"
                      >
                        {showPasswords.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    
                    <button
                      type="submit"
                      disabled={saving}
                      className="w-full bg-gradient-to-r from-bright-blue to-emerald-green text-white py-3 rounded-lg font-medium hover:opacity-90 disabled:opacity-50"
                    >
                      {saving ? 'Updating Password...' : 'Update Password'}
                    </button>
                  </form>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button 
                onClick={handleSaveAll}
                disabled={saving}
                className={`flex items-center gap-2 bg-gradient-to-r from-electric-red to-vibrant-yellow text-white px-6 py-3 rounded-lg transition-all ${
                  saving ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'
                }`}
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    Save All Settings
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;