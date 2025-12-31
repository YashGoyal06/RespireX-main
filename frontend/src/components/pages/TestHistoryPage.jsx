import React, { useState, useEffect } from 'react';
import { CheckCircle, Calendar, FileText, Download, Activity, Loader, AlertCircle } from 'lucide-react';
import Navbar from '../common/Navbar';
import Footer from '../common/Footer';
import api from '../../lib/api'; // Ensure this is your configured Axios instance
import { supabase } from '../../lib/supabase';

const TestHistoryPage = ({ onNavigate }) => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTestHistory();
  }, []);

  const fetchTestHistory = async () => {
    try {
      setLoading(true);
      
      // 1. Ensure user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // 2. Fetch data from Django Backend
      // Adjust the endpoint '/tests/' to match your actual Django URL (e.g., '/api/history/')
      const response = await api.get('/tests/'); 
      
      // 3. Transform data if necessary to match UI structure
      // Assuming backend returns: { id, created_at, result (string), confidence (0-1 or 0-100), risk_level }
      const formattedData = response.data.map(test => ({
        id: test.id,
        date: new Date(test.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        fullDate: new Date(test.created_at).toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' }),
        result: test.result || 'Unknown', // e.g., "Positive" or "Negative"
        confidence: test.confidence > 1 ? test.confidence : Math.round(test.confidence * 100), // Handle 0.95 vs 95
        riskLevel: test.risk_level || 'Low' // e.g., "High", "Medium", "Low"
      }));

      setTests(formattedData);
    } catch (err) {
      console.error("Failed to fetch history:", err);
      setError("Could not load test history. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Helper to handle download (placeholder for now)
  const handleDownload = (testId) => {
    // Implement actual PDF download logic here if backend supports it
    alert(`Downloading report for Test #${testId}...`);
  };

  // --- Loading State ---
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <Loader className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-600 font-medium">Loading your history...</p>
      </div>
    );
  }

  // --- Error State ---
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Error Loading Data</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => onNavigate('patient-home')}
            className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition"
          >
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col">
      {/* Navigation */}
      <Navbar 
        showBackButton={true}
        onBack={() => onNavigate('patient-home')}
      />

      <div className="flex-grow pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-12 animate-fade-in">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">Test History</h1>
            <p className="text-xl text-gray-600">View all your previous screening results</p>
          </div>

          {/* Stats Overview (Dynamic) */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {[
              { 
                label: "Total Tests", 
                value: tests.length, 
                icon: FileText, 
                color: "blue" 
              },
              { 
                label: "Negative Results", 
                value: tests.filter(t => t.result.toLowerCase() === "negative").length, 
                icon: CheckCircle, 
                color: "green" 
              },
              { 
                label: "Avg. Confidence", 
                value: tests.length > 0 
                  ? `${Math.round(tests.reduce((a, b) => a + b.confidence, 0) / tests.length)}%` 
                  : "0%", 
                icon: Activity, 
                color: "purple" 
              }
            ].map((stat, idx) => (
              <div key={idx} className={`bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover-lift animate-fade-in stagger-${idx + 1}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-br from-${stat.color}-100 to-${stat.color}-200 rounded-xl flex items-center justify-center`}>
                    <stat.icon className={`w-6 h-6 text-${stat.color}-600`} strokeWidth={2} />
                  </div>
                  <span className="text-4xl font-bold text-gray-900">{stat.value}</span>
                </div>
                <p className="text-sm font-semibold text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Test History List */}
          <div className="space-y-6">
            {tests.length > 0 ? (
              tests.map((test, idx) => (
                <div 
                  key={test.id} 
                  className={`bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover-lift animate-fade-in stagger-${idx + 1}`}
                >
                  <div className="p-8">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-start space-x-6">
                        {/* Dynamic Icon/Color based on Result */}
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0 ${
                          test.result.toLowerCase() === 'positive' 
                            ? 'bg-gradient-to-br from-red-400 to-red-500' 
                            : 'bg-gradient-to-br from-green-400 to-green-500'
                        }`}>
                           {test.result.toLowerCase() === 'positive' ? (
                              <Activity className="w-9 h-9 text-white" strokeWidth={2.5} />
                           ) : (
                              <CheckCircle className="w-9 h-9 text-white" strokeWidth={2.5} />
                           )}
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-2">
                            {test.result} Result
                          </h3>
                          <div className="flex items-center space-x-4 text-gray-600">
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-5 h-5" />
                              <span className="font-medium">{test.fullDate}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleDownload(test.id)}
                        className="px-6 py-3 bg-gray-100 text-gray-900 rounded-xl hover:bg-gray-200 transition font-semibold flex items-center space-x-2"
                      >
                        <Download className="w-5 h-5" />
                        <span>Download</span>
                      </button>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 pt-6 border-t border-gray-100">
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Confidence Level</p>
                        <div className="flex items-center space-x-3">
                          <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                            <div 
                              className={`h-3 rounded-full transition-all ${
                                test.confidence > 80 ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gradient-to-r from-yellow-500 to-orange-600'
                              }`}
                              style={{ width: `${test.confidence}%` }}
                            />
                          </div>
                          <span className="text-lg font-bold text-gray-900">{test.confidence}%</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Risk Level</p>
                        <div className={`inline-block px-6 py-2 rounded-xl font-bold ${
                          test.riskLevel === 'High' ? 'bg-red-100 text-red-700' :
                          test.riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {test.riskLevel}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Test Status</p>
                        <div className="inline-block px-6 py-2 bg-blue-100 text-blue-700 rounded-xl font-bold">
                          Completed
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              // Empty State
              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-16 text-center">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FileText className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">No Test History Yet</h3>
                <p className="text-gray-600 mb-8">Start your first TB screening test to see results here</p>
                <button
                  onClick={() => onNavigate('symptom-test')}
                  className="px-10 py-4 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition font-semibold text-lg shadow-lg hover:shadow-xl btn-primary"
                >
                  Start Test
                </button>
              </div>
            )}
          </div>

          {/* Info Card */}
          {tests.length > 0 && (
            <div className="mt-12 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-8 text-white animate-fade-in">
              <h3 className="text-2xl font-bold mb-4">Keep Track of Your Health</h3>
              <p className="text-lg leading-relaxed opacity-90">
                Regular screening helps in early detection and better health outcomes. 
                We recommend taking a test every 3 months or if you experience any symptoms.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default TestHistoryPage;