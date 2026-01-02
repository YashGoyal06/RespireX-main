import React, { useState } from 'react';
import { User, Shield, Key, Loader, AlertCircle, Mail, Lock } from 'lucide-react';
import Navbar from '../common/Navbar';
import { supabase } from '../../lib/supabase';
import api from '../../lib/api';

const DoctorSignup = ({ onNavigate, onBack }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    accessCode: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Get Access Code from Frontend .env for immediate feedback
  const ENV_ACCESS_CODE = import.meta.env.VITE_DOCTOR_ACCESS_CODE;

  const handleSignup = async () => {
    setLoading(true);
    setError('');

    try {
      // 1. Basic Validation
      if (!formData.name || !formData.email || !formData.password || !formData.accessCode) {
        throw new Error("All fields (Name, Email, Password, Access Code) are required.");
      }

      if (formData.password.length < 6) {
        throw new Error("Password must be at least 6 characters.");
      }

      // 2. Client-side Access Code Check (Optional, but gives fast feedback)
      if (formData.accessCode !== ENV_ACCESS_CODE) {
        throw new Error("Invalid Access Code. Please contact administrator.");
      }

      console.log("🔐 Creating new doctor account...");

      // 3. Create Personal Supabase User
      // This creates a NEW user in your Supabase Auth -> Users table
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.name,
          },
        },
      });

      if (authError) throw authError;

      // NOTE: If 'Enable Email Confirmations' is ON in Supabase, 'authData.session' will be null.
      // You must disable email confirmation in Supabase Dashboard -> Auth -> Providers -> Email 
      // for the user to be logged in immediately.
      if (!authData.session) {
        throw new Error("Account created! Please check your email to confirm before logging in.");
      }

      // 4. Create Backend Profile & Verify Access Code Server-Side
      try {
        await api.post('/profile/', {
          role: 'doctor',
          full_name: formData.name,
          access_code: formData.accessCode, // Backend will check this against its .env
          // Default placeholders since we removed these fields from UI
          state: 'Maharashtra', 
          city: 'Mumbai',
          licenseNumber: 'PENDING' 
        });
      } catch (profileError) {
        console.error("Profile creation failed:", profileError);
        // If backend returns 403, the access code was wrong/missing
        if (profileError.response && profileError.response.status === 403) {
             throw new Error("Server Validation Failed: Invalid Access Code.");
        }
        throw new Error("Failed to create doctor profile. Please try again.");
      }

      console.log("✅ Doctor Account Created Successfully");
      onNavigate('doctor-home');

    } catch (err) {
      console.error("Signup failed:", err);
      setError(err.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen bg-slate-50"
      // 👇👇👇 PASTE YOUR IMAGE PATH BELOW INSIDE THE url('') 👇👇👇
      style={{ 
        backgroundImage: "url('/login-bg.jpg')", 
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <Navbar 
        showBackButton={true}
        onBack={onBack}
      />

      <div className="flex items-center justify-center min-h-screen px-4 pt-20 pb-12 backdrop-blur-sm bg-white/30">
        <div className="max-w-xl w-full">
          <div className="text-center pt-5 mb-8 animate-fade-in stagger-1">
            <h2 className="text-4xl font-bold text-gray-900 mb-3">Doctor Registration</h2>
            <p className="text-gray-700 text-lg font-medium">Create your secure medical account</p>
          </div>

          <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-gray-100 p-8 animate-scale">
            
            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-3 text-red-700 animate-fade-in">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            {/* Warning Badge */}
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-4 mb-6">
              <div className="flex items-start space-x-3">
                <Shield className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">Restricted Access</h4>
                  <p className="text-xs text-gray-700 mt-1">
                    An Administrator Access Code is required to create a doctor account.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-5">
              
              {/* 1. Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                <div className="relative">
                  <User className="w-5 h-5 text-gray-400 absolute left-4 top-3.5" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition text-gray-900"
                    placeholder="Dr. John Doe"
                  />
                </div>
              </div>

              {/* 2. Email (Required by Supabase) */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="w-5 h-5 text-gray-400 absolute left-4 top-3.5" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition text-gray-900"
                    placeholder="doctor@hospital.com"
                  />
                </div>
              </div>

              {/* 3. Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-gray-400 absolute left-4 top-3.5" />
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition text-gray-900"
                    placeholder="Create a password"
                  />
                </div>
              </div>

              {/* 4. Access Code */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Admin Access Code</label>
                <div className="relative">
                  <Key className="w-5 h-5 text-gray-400 absolute left-4 top-3.5" />
                  <input
                    type="text"
                    value={formData.accessCode}
                    onChange={(e) => setFormData({...formData, accessCode: e.target.value})}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition text-gray-900"
                    placeholder="Enter code provided by admin"
                  />
                </div>
              </div>

              <button
                onClick={handleSignup}
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-cyan-600 to-cyan-700 text-white rounded-xl hover:from-cyan-700 hover:to-cyan-800 transition font-semibold text-lg shadow-lg hover:shadow-xl btn-primary flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
              >
                {loading ? (
                  <>
                    <Loader className="w-6 h-6 animate-spin" />
                    <span>Verifying & Creating Account...</span>
                  </>
                ) : (
                  <span>Verify & Create Account</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorSignup;