import React, { useState } from 'react';
import { Activity, Mail, Lock, Loader } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import api from '../../lib/api';

const LoginPage = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // FIXED: Renamed 'FLoading' to 'setLoading'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    // Basic validation
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // 1. Login with Supabase
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      if (!data.user) throw new Error('No user data returned');

      // 2. Fetch User Profile (Django or Supabase fallback)
      let role = null;

      try {
        // Attempt 1: Fetch from your Django API
        const response = await api.get('/profile/');
        role = response.data.role;
      } catch (apiError) {
        console.warn('API fetch failed, checking metadata...', apiError);
        
        // Attempt 2: Fallback to Supabase Metadata (if you stored role there)
        // This prevents the user from being stuck if the Django server is down
        role = data.user.user_metadata?.role;
      }

      // 3. Navigate based on role
      if (role === 'doctor') {
        onNavigate('doctor-home');
      } else if (role === 'patient') {
        onNavigate('patient-home');
      } else {
        // Fallback default navigation if role is missing or unknown
        onNavigate('patient-home'); 
      }

    } catch (err) {
      console.error('Login error:', err);
      // specific error message handling
      setError(err.response?.data?.error || err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  // Helper for Enter key submission
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Activity className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
          <p className="text-gray-600 mt-2">Sign in to your account</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-500 text-sm text-center py-2 rounded-lg border border-red-100">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <div className="relative">
                <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium flex justify-center items-center disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader className="animate-spin w-5 h-5 mr-2" />
                  <span>Signing In...</span>
                </>
              ) : (
                'Sign In'
              )}
            </button>

            <div className="text-center">
              <span className="text-gray-600">Don't have an account? </span>
              <button 
                onClick={() => onNavigate('signup')} 
                className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;