import React, { useState, useEffect } from 'react';
import { CheckCircle, Calendar, FileText, Download, Activity, Loader, AlertCircle } from 'lucide-react';
import Navbar from '../common/Navbar';
import Footer from '../common/Footer';
import api from '../../lib/api';
import { supabase } from '../../lib/supabase';

const TestHistoryPage = ({ onNavigate, onLogout, user, language = 'en', toggleLanguage, darkMode, toggleTheme }) => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  const t = {
    en: {
      title: "Test History",
      subtitle: "View all your previous screening results",
      totalTests: "Total Tests",
      negativeResults: "Negative Results",
      avgConfidence: "Avg. Confidence",
      noHistory: "No Test History Yet",
      noHistoryDesc: "Start your first TB screening test to see results here",
      startTest: "Start Test",
      keepTrack: "Keep Track of Your Health",
      keepTrackDesc: "Regular screening helps in early detection and better health outcomes.",
      loading: "Loading your history...",
      errorTitle: "Error Loading Data",
      tryAgain: "Try Again",
      goBack: "Go Back",
      result: "Result",
      confidence: "Confidence Level",
      risk: "Risk Level",
      status: "Test Status",
      completed: "Completed",
      download: "Download",
      pdf: "PDF..."
    },
    hi: {
      title: "टेस्ट इतिहास",
      subtitle: "अपने सभी पिछले स्क्रीनिंग परिणाम देखें",
      totalTests: "कुल टेस्ट",
      negativeResults: "नकारात्मक परिणाम",
      avgConfidence: "औसत आत्मविश्वास",
      noHistory: "अभी तक कोई टेस्ट इतिहास नहीं",
      noHistoryDesc: "परिणाम देखने के लिए अपना पहला टीबी स्क्रीनिंग टेस्ट शुरू करें",
      startTest: "टेस्ट शुरू करें",
      keepTrack: "अपने स्वास्थ्य पर नज़र रखें",
      keepTrackDesc: "नियमित स्क्रीनिंग प्रारंभिक पहचान और बेहतर स्वास्थ्य परिणामों में मदद करती है।",
      loading: "आपका इतिहास लोड हो रहा है...",
      errorTitle: "डेटा लोड करने में त्रुटि",
      tryAgain: "पुनः प्रयास करें",
      goBack: "वापस जाएं",
      result: "परिणाम",
      confidence: "आत्मविश्वास स्तर",
      risk: "जोखिम स्तर",
      status: "टेस्ट स्थिति",
      completed: "पूर्ण",
      download: "डाउनलोड",
      pdf: "पीडीएफ..."
    }
  };

  const currentT = t[language];

  useEffect(() => {
    fetchTestHistory();
  }, []);

  const fetchTestHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError("Please log in to view your history");
        setLoading(false);
        return;
      }

      const response = await api.get('/history/');
      
      const formattedData = response.data.map(test => {
        const rawResult = test.result || '';
        const isPositive = rawResult.trim().toLowerCase() === 'positive';
        
        const confidence = test.confidence_score > 1 
          ? Math.round(test.confidence_score) 
          : Math.round(test.confidence_score * 100);

        let calculatedRisk = 'Low'; 
        if (isPositive) {
            if (confidence > 80) calculatedRisk = 'High';
            else if (confidence >= 50) calculatedRisk = 'Medium';
        }

        return {
          id: test.id,
          date: new Date(test.date_tested).toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
          }),
          fullDate: new Date(test.date_tested).toLocaleString(language === 'hi' ? 'hi-IN' : 'en-US', { 
            dateStyle: 'long', 
            timeStyle: 'short' 
          }),
          result: test.result || 'Unknown',
          confidence: confidence,
          riskLevel: calculatedRisk,
          xrayUrl: test.xray_image_url || null
        };
      });

      setTests(formattedData);
      
    } catch (err) {
      console.error("Failed to fetch history:", err);
      setError("Could not load test history.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (test) => {
    try {
      setDownloadingId(test.id); 
      const response = await api.get(`/report/${test.id}/`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `RespireX_Report_${test.id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      alert("Failed to download PDF report.");
    } finally {
      setDownloadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col transition-colors">
        <Navbar showBackButton={true} onBack={() => onNavigate('patient-home')} isLoggedIn={true} user={user} onLogout={onLogout} userType="patient" language={language} toggleLanguage={toggleLanguage} darkMode={darkMode} toggleTheme={toggleTheme} />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-300 font-medium">{currentT.loading}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col transition-colors">
        <Navbar showBackButton={true} onBack={() => onNavigate('patient-home')} isLoggedIn={true} user={user} onLogout={onLogout} userType="patient" language={language} toggleLanguage={toggleLanguage} darkMode={darkMode} toggleTheme={toggleTheme} />
        <div className="flex-grow flex items-center justify-center px-4">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg max-w-md w-full text-center border dark:border-gray-700">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{currentT.errorTitle}</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">{error}</p>
            <div className="flex space-x-4">
              <button onClick={fetchTestHistory} className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">{currentT.tryAgain}</button>
              <button onClick={() => onNavigate('patient-home')} className="flex-1 px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition">{currentT.goBack}</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex flex-col transition-colors">
      <Navbar showBackButton={true} onBack={() => onNavigate('patient-home')} isLoggedIn={true} user={user} onLogout={onLogout} userType="patient" language={language} toggleLanguage={toggleLanguage} darkMode={darkMode} toggleTheme={toggleTheme} />

      <div className="flex-grow pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="mb-12 animate-fade-in">
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">{currentT.title}</h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">{currentT.subtitle}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {[
              { label: currentT.totalTests, value: tests.length, icon: FileText, color: "blue" },
              { label: currentT.negativeResults, value: tests.filter(t => t.result.toLowerCase() === "negative").length, icon: CheckCircle, color: "green" },
              { label: currentT.avgConfidence, value: tests.length > 0 ? `${Math.round(tests.reduce((a, b) => a + b.confidence, 0) / tests.length)}%` : "0%", icon: Activity, color: "purple" }
            ].map((stat, idx) => (
              <div key={idx} className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 hover-lift animate-fade-in stagger-${idx + 1}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-br from-${stat.color}-100 to-${stat.color}-200 dark:from-${stat.color}-900 dark:to-${stat.color}-800 rounded-xl flex items-center justify-center`}>
                    <stat.icon className={`w-6 h-6 text-${stat.color}-600 dark:text-${stat.color}-300`} strokeWidth={2} />
                  </div>
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">{stat.value}</span>
                </div>
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="space-y-6">
            {tests.length > 0 ? (
              tests.map((test, idx) => (
                <div key={test.id} className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden hover-lift animate-fade-in stagger-${idx + 1}`}>
                  <div className="p-8">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-start space-x-6">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0 ${
                          String(test.result).toLowerCase() === 'positive' ? 'bg-gradient-to-br from-red-400 to-red-500' : 'bg-gradient-to-br from-green-400 to-green-500'
                        }`}>
                           {String(test.result).toLowerCase() === 'positive' ? (
                              <Activity className="w-9 h-9 text-white" strokeWidth={2.5} />
                           ) : (
                              <CheckCircle className="w-9 h-9 text-white" strokeWidth={2.5} />
                           )}
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{test.result} {currentT.result}</h3>
                          <div className="flex items-center space-x-4 text-gray-600 dark:text-gray-400">
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-5 h-5" />
                              <span className="font-medium">{test.fullDate}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleDownload(test)}
                        disabled={downloadingId === test.id}
                        className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition font-semibold flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {downloadingId === test.id ? <Loader className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                        <span>{downloadingId === test.id ? currentT.pdf : currentT.download}</span>
                      </button>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 pt-6 border-t border-gray-100 dark:border-gray-700">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{currentT.confidence}</p>
                        <div className="flex items-center space-x-3">
                          <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-3 overflow-hidden">
                            <div className={`h-3 rounded-full transition-all ${
                                test.confidence > 80 ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gradient-to-r from-yellow-500 to-orange-600'
                              }`}
                              style={{ width: `${test.confidence}%` }}
                            />
                          </div>
                          <span className="text-lg font-bold text-gray-900 dark:text-white">{test.confidence}%</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{currentT.risk}</p>
                        <div className={`inline-block px-6 py-2 rounded-xl font-bold ${
                          test.riskLevel === 'High' ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300' :
                          test.riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300' :
                          'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300'
                        }`}>
                          {test.riskLevel}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{currentT.status}</p>
                        <div className="inline-block px-6 py-2 bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 rounded-xl font-bold">{currentT.completed}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 p-16 text-center">
                <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FileText className="w-12 h-12 text-gray-400 dark:text-gray-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{currentT.noHistory}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-8">{currentT.noHistoryDesc}</p>
                <button onClick={() => onNavigate('symptom-test')} className="px-10 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl hover:bg-gray-800 dark:hover:bg-gray-200 transition font-semibold text-lg shadow-lg hover:shadow-xl btn-primary">{currentT.startTest}</button>
              </div>
            )}
          </div>
          {tests.length > 0 && (
            <div className="mt-12 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-8 text-white animate-fade-in shadow-lg">
              <h3 className="text-2xl font-bold mb-4">{currentT.keepTrack}</h3>
              <p className="text-lg leading-relaxed opacity-90">{currentT.keepTrackDesc}</p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TestHistoryPage;
