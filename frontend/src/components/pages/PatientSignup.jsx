import React, { useState } from 'react';
import { User, Mail, Phone, Calendar, MapPin, Home, Loader, AlertCircle } from 'lucide-react';
import Navbar from '../common/Navbar';
import { supabase } from '../../lib/supabase';
import api from '../../lib/api';

const PatientSignup = ({ onNavigate, onBack }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
   
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: '',
    gender: '',
    state: '',
    city: '',
    address: ''
  });

  const states = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
    'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
    'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
    'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
  ];

  // Helper to convert DOB to Age for the backend
  const calculateAge = (dob) => {
    if (!dob) return null;
    const diff = Date.now() - new Date(dob).getTime();
    const ageDt = new Date(diff);
    return Math.abs(ageDt.getUTCFullYear() - 1970);
  };

  const handleSignup = async () => {
    setLoading(true);
    setError('');

    // 1. Basic Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }
    if (!formData.email || !formData.password || !formData.dateOfBirth) {
      setError("Please fill in all required fields");
      setLoading(false);
      return;
    }

    try {
      // 2. Create Auth User in Supabase
      // Added options to store Full Name in Supabase metadata immediately
      const { data, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            phone: formData.phone, // Storing phone in metadata as backup
          }
        }
      });

      if (authError) throw authError;

      // 3. Create Profile in Django Backend
      // Logic Update: Removed setTimeout. We check if a session was established.
      // If email confirmation is required, data.session might be null.
      
      if (data?.session) {
        try {
          await api.post('/profile/', {
            role: 'patient',
            age: calculateAge(formData.dateOfBirth),
            gender: formData.gender,
            state: formData.state,
            city: formData.city,
            // Added these fields so they are sent to backend
            phone: formData.phone, 
            address: formData.address,
            full_name: formData.fullName
          });
           
          setLoading(false);
          onNavigate('patient-home');
        } catch (profileError) {
          console.error("Profile creation failed:", profileError);
          // Even if profile update fails, the user is created, so we let them in
          setLoading(false);
          onNavigate('patient-home'); 
        }
      } else {
        // Handle case where Email Verification is required before login
        // Or simply navigate if you want them to check email
        setLoading(false);
        // Optional: setError("Please check your email to verify your account.");
        onNavigate('patient-home'); 
      }

    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to create account");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navbar 
        showBackButton={true}
        onBack={onBack}
      />

      <div className="pt-32 pb-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10 animate-fade-in stagger-1">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl overflow-hidden">
              <img 
                src="/respirex-logo.png" 
                alt="RespireX Logo" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.style.background = 'linear-gradient(to bottom right, #2563eb, #1e40af)';
                }}
              />
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-3">Patient Registration</h2>
            <p className="text-gray-600 text-lg">Fill in your details to create an account</p>
          </div>

          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 lg:p-12 animate-scale">
             
            {/* Error Message Display */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-3 text-red-700 animate-fade-in">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            <div className="space-y-6">
              
              {/* Full Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Full Name</label>
                <div className="relative">
                  <User className="w-5 h-5 text-gray-400 absolute left-4 top-4" />
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-900"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              {/* Email and Phone */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Email Address</label>
                  <div className="relative">
                    <Mail className="w-5 h-5 text-gray-400 absolute left-4 top-4" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-900"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Phone Number</label>
                  <div className="relative">
                    <Phone className="w-5 h-5 text-gray-400 absolute left-4 top-4" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-900"
                      placeholder="+91 "
                    />
                  </div>
                </div>
              </div>

              {/* DOB and Gender */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Date of Birth</label>
                  <div className="relative">
                    <Calendar className="w-5 h-5 text-gray-400 absolute left-4 top-4" />
                    <input
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                      className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({...formData, gender: e.target.value})}
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-900"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              {/* State and City */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">State</label>
                  <div className="relative">
                    <MapPin className="w-5 h-5 text-gray-400 absolute left-4 top-4" />
                    <select
                      value={formData.state}
                      onChange={(e) => setFormData({...formData, state: e.target.value})}
                      className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-900"
                    >
                      <option value="">Select State</option>
                      {states.map(state => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-900"
                    placeholder="Enter your city"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Address</label>
                <div className="relative">
                  <Home className="w-5 h-5 text-gray-400 absolute left-4 top-4" />
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-900 resize-none"
                    rows="3"
                    placeholder="Enter your full address"
                  />
                </div>
              </div>

              {/* Password Fields */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Password</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-900"
                    placeholder="Create password"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Confirm Password</label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-900"
                    placeholder="Confirm password"
                  />
                </div>
              </div>

              <button
                onClick={handleSignup}
                disabled={loading}
                className="w-full py-4 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition font-semibold text-lg shadow-lg hover:shadow-xl btn-primary mt-4 flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader className="w-6 h-6 animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <span>Create Account</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientSignup;