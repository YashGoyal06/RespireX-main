import React from 'react';
import { CheckCircle, AlertTriangle, Download, Share2, Home, FileText, XCircle } from 'lucide-react';
import Navbar from '../common/Navbar';

const TestResultPage = ({ onNavigate, resultData }) => {
  // Parse the result data from the backend
  const result = resultData?.result || {};
  const xrayImage = resultData?.originalImage || null;
  
  // Extract values from backend response
  const detected = result.result === 'Positive';
  const confidence = result.confidence_score || 0;
  const riskLevel = result.risk_level || 'Low';
  const uploadDate = resultData?.uploadDate ? new Date(resultData.uploadDate).toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  }) : new Date().toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  });

  const handleDownload = () => {
    // Create a simple report download
    const reportContent = `
TB Screening Report
==================
Date: ${uploadDate}
Result: ${detected ? 'TB Signs Detected' : 'No TB Signs Detected'}
Confidence: ${confidence}%
Risk Level: ${riskLevel}

Note: This is a preliminary screening result. Please consult a healthcare professional for proper diagnosis.
    `;
    
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TB_Report_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'TB Screening Result',
        text: `My TB screening result: ${detected ? 'TB Signs Detected' : 'No TB Signs Detected'} with ${confidence}% confidence.`,
      }).catch(err => console.log('Error sharing:', err));
    } else {
      alert('Sharing is not supported on this device');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navbar 
        showBackButton={true}
        onBack={() => onNavigate('patient-home')}
      />

      <div className="pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 animate-fade-in">
            <div className={`inline-block px-4 py-2 rounded-full mb-6 ${
              detected ? 'bg-orange-50' : 'bg-green-50'
            }`}>
              <span className={`text-sm font-semibold ${
                detected ? 'text-orange-600' : 'text-green-600'
              }`}>
                Analysis Complete
              </span>
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-4">Your Test Results</h1>
            <p className="text-xl text-gray-600">Completed on {uploadDate}</p>
          </div>

          {/* Main Result Card */}
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-12 mb-8 text-center animate-scale">
            {!detected ? (
              <>
                <div className="w-28 h-28 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl animate-pulse">
                  <CheckCircle className="w-16 h-16 text-white" strokeWidth={2.5} />
                </div>
                <h2 className="text-4xl font-bold text-gray-900 mb-4">No TB Signs Detected</h2>
                <p className="text-lg text-gray-600 mb-8">Your X-ray analysis shows no signs of tuberculosis</p>
              </>
            ) : (
              <>
                <div className="w-28 h-28 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl">
                  <AlertTriangle className="w-16 h-16 text-white" strokeWidth={2.5} />
                </div>
                <h2 className="text-4xl font-bold text-gray-900 mb-4">TB Signs Detected</h2>
                <p className="text-lg text-gray-600 mb-8">Please consult a healthcare professional immediately</p>
              </>
            )}
            
            <div className="flex items-center justify-center space-x-8 mb-8">
              <div>
                <p className="text-gray-600 mb-2">AI Confidence</p>
                <p className="text-5xl font-bold text-gray-900">{Math.round(confidence)}%</p>
              </div>
              <div className="h-16 w-px bg-gray-200"></div>
              <div>
                <p className="text-gray-600 mb-2">Risk Level</p>
                <div className={`inline-block px-8 py-3 rounded-full font-bold text-lg ${
                  riskLevel === 'High' ? 'bg-red-100 text-red-700' :
                  riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {riskLevel}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4 justify-center">
              <button 
                onClick={handleDownload}
                className="flex items-center space-x-2 px-8 py-4 bg-gray-100 text-gray-900 rounded-xl hover:bg-gray-200 transition font-semibold shadow-lg"
              >
                <Download className="w-5 h-5" />
                <span>Download Report</span>
              </button>
              <button 
                onClick={handleShare}
                className="flex items-center space-x-2 px-8 py-4 bg-gray-100 text-gray-900 rounded-xl hover:bg-gray-200 transition font-semibold shadow-lg"
              >
                <Share2 className="w-5 h-5" />
                <span>Share Results</span>
              </button>
            </div>
          </div>

          {/* X-ray Image Preview */}
          {xrayImage && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8 animate-fade-in stagger-1">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Analyzed X-Ray</h3>
              <div className="rounded-xl overflow-hidden border-2 border-gray-200">
                <img 
                  src={xrayImage} 
                  alt="Analyzed X-ray" 
                  className="w-full h-auto"
                />
              </div>
            </div>
          )}

          {/* Detailed Analysis */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Recommendations */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 animate-fade-in stagger-2">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-3">
                <FileText className="w-7 h-7 text-blue-600" />
                <span>Recommendations</span>
              </h3>
              <div className="space-y-4">
                {detected ? (
                  <>
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="w-6 h-6 text-orange-500 mt-0.5 flex-shrink-0" strokeWidth={2} />
                      <p className="text-gray-700 leading-relaxed">Consult a healthcare professional immediately for confirmation</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="w-6 h-6 text-orange-500 mt-0.5 flex-shrink-0" strokeWidth={2} />
                      <p className="text-gray-700 leading-relaxed">Get proper diagnostic tests like sputum culture or molecular tests</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="w-6 h-6 text-orange-500 mt-0.5 flex-shrink-0" strokeWidth={2} />
                      <p className="text-gray-700 leading-relaxed">Avoid close contact with others until confirmed and treated</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="w-6 h-6 text-orange-500 mt-0.5 flex-shrink-0" strokeWidth={2} />
                      <p className="text-gray-700 leading-relaxed">Follow your doctor's treatment plan if TB is confirmed</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-6 h-6 text-green-500 mt-0.5 flex-shrink-0" strokeWidth={2} />
                      <p className="text-gray-700 leading-relaxed">Continue maintaining good health practices and hygiene</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-6 h-6 text-green-500 mt-0.5 flex-shrink-0" strokeWidth={2} />
                      <p className="text-gray-700 leading-relaxed">Schedule regular check-ups with your healthcare provider</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-6 h-6 text-green-500 mt-0.5 flex-shrink-0" strokeWidth={2} />
                      <p className="text-gray-700 leading-relaxed">If symptoms persist, consult a medical professional immediately</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-6 h-6 text-green-500 mt-0.5 flex-shrink-0" strokeWidth={2} />
                      <p className="text-gray-700 leading-relaxed">Share these results with your doctor for further evaluation</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl shadow-lg p-8 text-white animate-fade-in stagger-3">
              <h3 className="text-2xl font-bold mb-6">Next Steps</h3>
              <ul className="space-y-4">
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-white rounded-full mt-2 flex-shrink-0"></div>
                  <span className="leading-relaxed">Save or download your results for your records</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-white rounded-full mt-2 flex-shrink-0"></div>
                  <span className="leading-relaxed">Consult with a healthcare professional for confirmation</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-white rounded-full mt-2 flex-shrink-0"></div>
                  <span className="leading-relaxed">Monitor your symptoms and take another test if needed</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-white rounded-full mt-2 flex-shrink-0"></div>
                  <span className="leading-relaxed">Keep track of your health in the test history section</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-2xl p-8 mb-8 animate-fade-in stagger-4">
            <div className="flex items-start space-x-4">
              <AlertTriangle className="w-8 h-8 text-yellow-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-bold text-gray-900 text-xl mb-3">Important Disclaimer</h4>
                <p className="text-gray-700 leading-relaxed">
                  This is a preliminary screening tool powered by AI and should not be considered as a definitive medical diagnosis. 
                  Please consult with a qualified healthcare professional for proper diagnosis and treatment. 
                  Always seek professional medical advice for any health concerns.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="flex space-x-4 animate-fade-in stagger-5">
            <button
              onClick={() => onNavigate('patient-home')}
              className="flex-1 py-4 bg-gray-900 text-white rounded-xl hover:bg-gray-800 font-semibold text-lg shadow-lg hover:shadow-xl btn-primary flex items-center justify-center space-x-2"
            >
              <Home className="w-5 h-5" />
              <span>Back to Home</span>
            </button>
            <button
              onClick={() => onNavigate('test-history')}
              className="flex-1 py-4 bg-gray-100 text-gray-900 rounded-xl hover:bg-gray-200 font-semibold text-lg flex items-center justify-center space-x-2 transition"
            >
              <FileText className="w-5 h-5" />
              <span>View History</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestResultPage;