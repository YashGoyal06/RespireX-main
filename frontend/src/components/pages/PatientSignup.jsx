import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Calendar, MapPin, Home, Loader, AlertCircle } from 'lucide-react';
import Navbar from '../common/Navbar';
import { supabase } from '../../lib/supabase';
import api from '../../lib/api';

// Accept 'user' prop to detect if we are in "Complete Profile" mode
const PatientSignup = ({ onNavigate, onBack, user }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Determine mode based on presence of user object
  const isProfileCompletion = !!user;

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

  // Pre-fill email and name if user exists (e.g. from Google Login)
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        email: user.email || '',
        fullName: user.user_metadata?.full_name || prev.fullName,
        // Google sometimes provides picture, but we just need email/name here
      }));
    }
  }, [user]);

  const states = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
    'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
    'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
    'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
  ];

  const calculateAge = (dob) => {
    if (!dob) return null;
    const diff = Date.now() - new Date(dob).getTime();
    const ageDt = new Date(diff);
    return Math.abs(ageDt.getUTCFullYear() - 1970);
  };

  const handleSignup = async () => {
    setLoading(true);
    setError('');

    // Validation
    if (!isProfileCompletion && formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }
    
    // For completion, we only need profile fields. For signup, we need password too.
    if (!formData.fullName || !formData.dateOfBirth || (!isProfileCompletion && !formData.password)) {
      setError("Please fill in all required fields");
      setLoading(false);
      return;
    }

    try {
      // Step 1: Authentication (Only if not already logged in)
      let sessionUser = user;

      if (!isProfileCompletion) {
        const { data, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.fullName,
              phone: formData.phone,
              gender: formData.gender,
            }
          }
        });

        if (authError) throw authError;
        sessionUser = data.user;
      }

      // Step 2: Create/Update Backend Profile
      // If we are here, we either just signed up OR we are already logged in (Google)
      if (sessionUser) {
        try {
          await api.post('/profile/', {
            role: 'patient',
            age: calculateAge(formData.dateOfBirth),
            gender: formData.gender,
            state: formData.state,
            city: formData.city,
            phone: formData.phone, 
            address: formData.address,
            full_name: formData.fullName
          });
           
          setLoading(false);
          onNavigate('patient-home');
        } catch (profileError) {
          console.error("Profile creation failed:", profileError);
          // If profile fails but auth worked, we still usually let them in, 
          // OR you could show an error saying "Could not save profile data".
          // For now, we proceed to home.
          setLoading(false);
          onNavigate('patient-home'); 
        }
      } else {
        // Email verification required case
        setLoading(false);
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
        showBackButton={!isProfileCompletion} // Hide back button if we are forcing profile completion
        onBack={onBack}
        isLoggedIn={isProfileCompletion} // Show user avatar if they are logged in
        user={user}
      />

      <div className="pt-32 pb-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10 animate-fade-in stagger-1">
            <h2 className="text-4xl font-bold text-gray-900 mb-3">
              {isProfileCompletion ? "Complete Your Profile" : "Patient Registration"}
            </h2>
            <p className="text-gray-600 text-lg">
              {isProfileCompletion 
                ? "Please provide your details to continue to the dashboard" 
                : "Fill in your details to create an account"}
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 lg:p-12 animate-scale">
             
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
                      disabled={isProfileCompletion} // Disable email edit if completing profile
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className={`w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-900 ${isProfileCompletion ? 'bg-gray-100 cursor-not-allowed' : ''}`}
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

              {/* Password Fields - ONLY SHOW IF NOT COMPLETING PROFILE */}
              {!isProfileCompletion && (
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
              )}

              <button
                onClick={handleSignup}
                disabled={loading}
                className="w-full py-4 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition font-semibold text-lg shadow-lg hover:shadow-xl btn-primary mt-4 flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader className="w-6 h-6 animate-spin" />
                    <span>{isProfileCompletion ? "Saving Profile..." : "Creating Account..."}</span>
                  </>
                ) : (
                  <span>{isProfileCompletion ? "Save & Continue" : "Create Account"}</span>
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