import { useState } from 'react';
import { Link } from 'react-router-dom';
import { LogOut, Shield, ArrowLeft, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { logout } from '../utils/auth';

const Logout = () => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutSuccess, setLogoutSuccess] = useState(false);

  const handleLogout = () => {
    setIsLoggingOut(true);
    
    // Use the actual logout function
    setTimeout(() => {
      logout(); // This will clear localStorage and redirect to login
    }, 1000);
  };

  const cancelLogout = () => {
    // Redirect back to dashboard
    window.location.href = '/';
  };

  if (logoutSuccess) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center p-4">
        <div className="glass-card rounded-2xl p-8 w-full max-w-md text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-emerald-green to-bright-blue flex items-center justify-center">
            <CheckCircle size={32} className="text-white" />
          </div>
          
          <h1 className="text-2xl font-bold text-white mb-3">Logged Out Successfully!</h1>
          <p className="text-gray-400 mb-6">
            You have been securely logged out of your account.
          </p>
          
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-emerald-green/10 border border-emerald-green/30">
              <div className="text-emerald-green text-sm">
                ✓ Session cleared
              </div>
            </div>
            <div className="p-4 rounded-lg bg-bright-blue/10 border border-bright-blue/30">
              <div className="text-bright-blue text-sm">
                ✓ Tokens removed
              </div>
            </div>
            <div className="p-4 rounded-lg bg-gray-800/50">
              <div className="text-gray-400 text-sm">
                ⚡ Ready for next session
              </div>
            </div>
          </div>
          
          <div className="mt-8 space-y-3">
            <Link
              to="/login"
              className="block w-full bg-gradient-to-r from-electric-red to-vibrant-yellow text-white py-3 rounded-lg font-medium hover:opacity-90 transition"
            >
              Sign In Again
            </Link>
            <Link
              to="/"
              className="block w-full bg-dark-card text-gray-300 py-3 rounded-lg font-medium hover:text-white hover:bg-dark-card/80 transition"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-dark flex items-center justify-center p-4">
      <div className="glass-card rounded-2xl p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-electric-red to-vibrant-yellow flex items-center justify-center">
            <LogOut size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">Logout Confirmation</h1>
          <p className="text-gray-400">
            Are you sure you want to logout from your account?
          </p>
        </div>

        {/* Warning Box */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-electric-red/10 to-vibrant-yellow/10 border border-electric-red/30 mb-6">
          <div className="flex items-start gap-3">
            <AlertTriangle size={20} className="text-vibrant-yellow mt-0.5" />
            <div>
              <h3 className="text-white font-medium mb-1">Security Notice</h3>
              <p className="text-gray-400 text-sm">
                Logging out will clear your current session and require you to sign in again to access your data.
              </p>
            </div>
          </div>
        </div>

        {/* What will be cleared */}
        <div className="mb-8">
          <h3 className="text-white font-medium mb-3 flex items-center gap-2">
            <Shield size={18} />
            What will happen:
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-dark-card/50">
              <XCircle size={18} className="text-electric-red" />
              <div>
                <div className="text-white text-sm">Session will end</div>
                <div className="text-gray-400 text-xs">Current login session terminated</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-dark-card/50">
              <XCircle size={18} className="text-electric-red" />
              <div>
                <div className="text-white text-sm">Temporary data cleared</div>
                <div className="text-gray-400 text-xs">Unsaved changes may be lost</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-dark-card/50">
              <CheckCircle size={18} className="text-emerald-green" />
              <div>
                <div className="text-white text-sm">Data preserved</div>
                <div className="text-gray-400 text-xs">All your tasks, notes, and settings saved</div>
              </div>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className={`w-full py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
              isLoggingOut
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-electric-red to-vibrant-yellow text-white hover:opacity-90 active:scale-95'
            }`}
          >
            {isLoggingOut ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Logging out...
              </>
            ) : (
              <>
                <LogOut size={20} />
                Yes, Logout Now
              </>
            )}
          </button>
          
          <button
            onClick={cancelLogout}
            disabled={isLoggingOut}
            className="w-full bg-dark-card text-gray-300 py-3 rounded-lg font-medium hover:text-white hover:bg-dark-card/80 transition flex items-center justify-center gap-2"
          >
            <ArrowLeft size={20} />
            Cancel & Stay Logged In
          </button>
        </div>

        {/* Quick Links */}
        <div className="mt-8 pt-6 border-t border-gray-800">
          <p className="text-gray-400 text-center text-sm mb-3">
            Having issues or questions?
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/settings" className="text-bright-blue hover:underline text-sm">
              Account Settings
            </Link>
            <Link to="/profile" className="text-bright-blue hover:underline text-sm">
              View Profile
            </Link>
            <Link to="/" className="text-bright-blue hover:underline text-sm">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Logout;

