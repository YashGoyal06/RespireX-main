import React, { useState } from 'react';
import { Stethoscope, Shield, Key, Loader, AlertCircle } from 'lucide-react';
import Navbar from '../common/Navbar';
import { supabase } from '../../lib/supabase'; // Import Supabase
import api from '../../lib/api'; // Import API to verify profile

const DoctorSignup = ({ onNavigate, onBack }) => {
  const [credentials, setCredentials] = useState({
    accessCode: '',
    licenseNumber: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  //  DEMO CONFIGURATION
  const DEMO_ACCESS_CODE = "DOC2024"; 
  const DEMO_DOCTOR_EMAIL = "doctor@admin.com"; // Must match Supabase User
  const DEMO_DOCTOR_PASS = "doctor123";         // Must match Supabase User

  const handleVerification = async () => {
    setLoading(true);
    setError('');

    try {
      // 1. Check Access Code (Client-side check for demo)
      if (credentials.accessCode !== DEMO_ACCESS_CODE) {
        throw new Error("Invalid Access Code. Please contact administrator.");
      }

      if (!credentials.licenseNumber) {
        throw new Error("Please enter your medical license number.");
      }

      console.log("🔐 Verifying credentials...");

      // 2. Perform "Shadow Login" to get the Auth Token
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: DEMO_DOCTOR_EMAIL,
        password: DEMO_DOCTOR_PASS,
      });

      if (authError) throw authError;

      // 3. Verify/Update the Backend Profile
      // We send the license number entered by the user to update the profile
      try {
        await api.post('/profile/', {
          role: 'doctor',
          licenseNumber: credentials.licenseNumber,
          // You can add dummy data here if needed for the demo profile
          state: 'Maharashtra', 
          city: 'Mumbai'
        });
      } catch (profileError) {
        console.warn("Profile update warning:", profileError);
        // Continue anyway if login succeeded
      }

      console.log("✅ Doctor verification successful");
      onNavigate('doctor-home');

    } catch (err) {
      console.error("Verification failed:", err);
      setError(err.message || "Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-cyan-50">
      <Navbar 
        showBackButton={true}
        onBack={onBack}
      />

      <div className="flex items-center justify-center min-h-screen px-4 pt-20 pb-12">
        <div className="max-w-xl w-full">
          <div className="text-center pt-5 mb-10 animate-fade-in stagger-1">
            <h2 className="text-4xl font-bold text-gray-900 mb-3">Doctor Verification</h2>
            <p className="text-gray-600 text-lg">Enter your credentials to access doctor dashboard</p>
          </div>

          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-10 animate-scale">
            
            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-3 text-red-700 animate-fade-in">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            {/* Warning Badge */}
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-2xl p-6 mb-8">
              <div className="flex items-start space-x-3">
                <Shield className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-gray-900 mb-2">Verified Access Only</h4>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    Only verified healthcare professionals with valid credentials can access the doctor dashboard.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Access Code</label>
                <div className="relative">
                  <Key className="w-5 h-5 text-gray-400 absolute left-4 top-4" />
                  <input
                    type="text"
                    value={credentials.accessCode}
                    onChange={(e) => setCredentials({...credentials, accessCode: e.target.value})}
                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition text-gray-900"
                    placeholder="Enter developer-provided access code"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Medical License Number</label>
                <div className="relative">
                  <Stethoscope className="w-5 h-5 text-gray-400 absolute left-4 top-4" />
                  <input
                    type="text"
                    value={credentials.licenseNumber}
                    onChange={(e) => setCredentials({...credentials, licenseNumber: e.target.value})}
                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition text-gray-900"
                    placeholder="Enter your medical license number"
                  />
                </div>
              </div>

              <button
                onClick={handleVerification}
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-cyan-600 to-cyan-700 text-white rounded-xl hover:from-cyan-700 hover:to-cyan-800 transition font-semibold text-lg shadow-lg hover:shadow-xl btn-primary flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader className="w-6 h-6 animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <span>Verify & Continue</span>
                )}
              </button>

              <div className="text-center pt-4">
                <p className="text-sm text-gray-500">
                  Demo Access Code: <strong>DOC2024</strong>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorSignup;