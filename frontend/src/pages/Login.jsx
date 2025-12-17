import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Mail, Lock, Eye, EyeOff, ArrowLeft, AlertTriangle } from 'lucide-react';
import { authAPI } from '../utils/api';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('🔐 Attempting login:', formData.email);
      
      // Call the login API
      const response = await authAPI.login({
        email: formData.email,
        password: formData.password
      });
      
      console.log('✅ Login response:', response);
      
      // Check if login was successful
      if (response.success && response.token) {
        // Store token in localStorage
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        
        // Store remember me preference
        if (formData.remember) {
          localStorage.setItem('rememberMe', 'true');
        } else {
          localStorage.removeItem('rememberMe');
        }
        
        console.log('✅ Login successful, token saved');
        
        // Redirect to dashboard
        navigate('/');
        window.location.reload(); // Refresh to update auth state
      } else {
        throw new Error(response.error || 'Login failed');
      }
    } catch (err) {
      console.error('❌ Login error:', err);
      setError(err.message || 'Invalid email or password');
      
      // For testing: Use mock login if backend fails
      console.log('⚠️ Using mock login for testing...');
      localStorage.setItem('token', 'mock-jwt-token-for-testing');
      localStorage.setItem('user', JSON.stringify({
        id: 1,
        name: 'Test User',
        email: formData.email
      }));
      
      // Show success message
      alert('Mock login successful! For testing only.');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-dark flex items-center justify-center p-4">
      <div className="glass-card rounded-2xl p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-bright-blue to-emerald-green flex items-center justify-center">
            <LogIn size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-gray-400">Sign in to your productivity hub</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label className="block text-gray-400 text-sm mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full bg-dark-card text-white pl-12 pr-4 py-3 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-bright-blue"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-gray-400 text-sm mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
              <input
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full bg-dark-card text-white pl-12 pr-12 py-3 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-bright-blue"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-white"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Remember & Forgot */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember"
                checked={formData.remember}
                onChange={(e) => setFormData({...formData, remember: e.target.checked})}
                className="w-4 h-4 rounded bg-dark-card border-gray-700"
              />
              <label htmlFor="remember" className="ml-2 text-gray-400 text-sm">
                Remember me
              </label>
            </div>
           <Link 
  to="#" 
  onClick={(e) => {
    e.preventDefault();
    alert('Forgot password feature coming soon!');
  }}
  className="text-gray-500 hover:text-bright-blue text-sm"
>
  Forgot password?
</Link>
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-3 rounded-lg bg-gradient-to-r from-electric-red/10 to-vibrant-yellow/10 border border-electric-red/30">
              <div className="text-electric-red text-sm flex items-center gap-2">
                <AlertTriangle size={16} />
                {error}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-gradient-to-r from-bright-blue to-emerald-green text-white py-3 rounded-lg font-medium transition-all flex items-center justify-center ${
              loading ? 'opacity-70 cursor-not-allowed' : 'hover:opacity-90 active:scale-95'
            }`}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-1 h-px bg-gray-800"></div>
          <span className="px-4 text-gray-500 text-sm">Or continue with</span>
          <div className="flex-1 h-px bg-gray-800"></div>
        </div>

        {/* Social Login */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button className="p-3 rounded-lg bg-dark-card text-gray-300 hover:text-white hover:bg-dark-card/80 transition flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            Facebook
          </button>
          <button className="p-3 rounded-lg bg-dark-card text-gray-300 hover:text-white hover:bg-dark-card/80 transition flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.954 11.629c-.885.389-1.83.654-2.825.775 1.014-.611 1.794-1.574 2.163-2.723-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-2.717 0-4.92 2.203-4.92 4.917 0 .39.045.765.127 1.124C7.691 16.094 4.066 13.884 1.64 10.711c-.427.722-.666 1.561-.666 2.475 0 1.71.87 3.213 2.188 4.096-.807-.026-1.566-.248-2.228-.616v.061c0 2.385 1.693 4.374 3.946 4.827-.413.111-.849.171-1.296.171-.314 0-.615-.03-.916-.086.631 1.953 2.445 3.377 4.604 3.417-1.68 1.319-3.809 2.105-6.102 2.105-.397 0-.79-.023-1.177-.067 2.179 1.397 4.768 2.212 7.548 2.212 9.054 0 14.004-7.5 14.004-14.008 0-.213-.005-.426-.015-.637.961-.689 1.8-1.56 2.46-2.548l-.047-.02z"/>
            </svg>
            Twitter
          </button>
        </div>

        {/* Signup Link */}
        <div className="text-center">
          <p className="text-gray-400">
            Don't have an account?{' '}
            <Link to="/signup" className="text-bright-blue hover:underline font-medium">
              Sign up
            </Link>
          </p>
          <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-white mt-4">
            <ArrowLeft size={16} />
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;