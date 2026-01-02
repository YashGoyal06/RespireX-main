import React from 'react';
import { CheckCircle, AlertTriangle, Download, Share2, Home, FileText, Pill, Activity } from 'lucide-react';
import Navbar from '../common/Navbar';

const TestResultPage = ({ onNavigate, resultData, onLogout, user, symptomAnswers }) => {
  const result = resultData?.result || {};
  const xrayImage = resultData?.originalImage || null;
  
  const detected = result.result === 'Positive';
  const modelConfidence = parseFloat(result.confidence_score) || 0;
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

  const calculateScores = () => {
    let symptomScore = 0;
    if (symptomAnswers) {
      const answers = Object.values(symptomAnswers);
      const yesCount = answers.filter(a => a === 'Yes').length;
      const totalQuestions = 8; 
      symptomScore = (yesCount / totalQuestions) * 100;
    }

    const meanScore = (modelConfidence + symptomScore) / 2;
    return { symptomScore, meanScore };
  };

  const { symptomScore, meanScore } = calculateScores();

  const getMedications = () => {
    if (detected) {
      // Standard First-Line Anti-TB Drugs (RIPE Therapy)
      return {
        // Title handled in JSX now
        type: "critical",
        note: "Standard First-Line Regimen (Subject to Doctor's Prescription)",
        meds: [
          { name: "Isoniazid (H)", dose: "5 mg/kg", desc: "Antibiotic used for treatment of tuberculosis." },
          { name: "Rifampicin (R)", dose: "10 mg/kg", desc: "Antibiotic used to treat several types of bacterial infections." },
          { name: "Pyrazinamide (Z)", dose: "25 mg/kg", desc: "Used in the first 2 months of treatment." },
          { name: "Ethambutol (E)", dose: "15 mg/kg", desc: "Prevents bacteria from reproducing." }
        ]
      };
    } else {
      // General Immunity Boosters
      return {
        // Title handled in JSX now
        type: "preventive",
        note: "Supplements to boost respiratory health",
        meds: [
          { name: "Vitamin D3", dose: "1000 IU", desc: "Supports immune system function." },
          { name: "Vitamin C", dose: "500 mg", desc: "Antioxidant that protects cells from damage." },
          { name: "Zinc Gluconate", dose: "50 mg", desc: "Helps immune system fight off invading bacteria." }
        ]
      };
    }
  };

  const medicationData = getMedications();

  const handleDownload = () => {
    const medList = medicationData.meds.map(m => `- ${m.name} (${m.dose})`).join('\n');
    
    const reportContent = `
TB Screening Report
==================
Date: ${uploadDate}
Result: ${detected ? 'TB Signs Detected' : 'No TB Signs Detected'}
Combined Confidence Score: ${meanScore.toFixed(1)}%

Suggested Medications:
${medList}

DISCLAIMER: This is an AI generated report. Do not take medications without doctor approval.
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
        text: `My TB screening result: ${detected ? 'Positive' : 'Negative'}. Confidence: ${meanScore.toFixed(1)}%`,
      }).catch(err => console.log('Error sharing:', err));
    } else {
      alert('Sharing is not supported on this device');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-100">
      <Navbar 
        showBackButton={true}
        onBack={() => onNavigate('patient-home')}
        isLoggedIn={true}
        user={user}
        onLogout={onLogout}
        userType="patient"
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
              <div className="flex flex-col items-center">
                <p className="text-gray-600 mb-2">Model Confidence</p>
                <p className="text-5xl font-bold text-gray-900">{Math.round(modelConfidence)}%</p>
                
                <div className="mt-4 flex flex-col space-y-1 text-sm bg-gray-50 p-3 rounded-lg border border-gray-100 w-48">
                   <div className="flex justify-between w-full">
                      <span className="text-gray-500">Symptoms:</span>
                      <span className="font-semibold text-gray-800">{Math.round(symptomScore)}%</span>
                   </div>
                   <div className="flex justify-between w-full border-t border-gray-200 pt-1 mt-1">
                      <span className="text-gray-500">Combined:</span>
                      <span className="font-semibold text-blue-600">{Math.round(meanScore)}%</span>
                   </div>
                </div>
              </div>

              <div className="h-24 w-px bg-gray-200"></div>

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
                      <p className="text-gray-700 leading-relaxed">Consult a healthcare professional immediately.</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="w-6 h-6 text-orange-500 mt-0.5 flex-shrink-0" strokeWidth={2} />
                      <p className="text-gray-700 leading-relaxed">Sputum culture test recommended.</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-6 h-6 text-green-500 mt-0.5 flex-shrink-0" strokeWidth={2} />
                      <p className="text-gray-700 leading-relaxed">Maintain good hygiene and immunity.</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-6 h-6 text-green-500 mt-0.5 flex-shrink-0" strokeWidth={2} />
                      <p className="text-gray-700 leading-relaxed">Routine check-up in 6 months.</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Suggested Medications (Updated Styling) */}
            <div className={`rounded-2xl shadow-lg p-8 animate-fade-in stagger-3 border ${
              detected 
                ? 'bg-orange-50 border-orange-100' 
                : 'bg-green-50 border-green-100'
            }`}>
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-2xl font-bold flex items-center gap-2 ${
                  detected ? 'text-orange-900' : 'text-green-900'
                }`}>
                  <Pill className={`w-6 h-6 ${detected ? 'text-orange-600' : 'text-green-600'}`} />
                  Suggested Medications
                </h3>
                <Activity className={`w-6 h-6 ${detected ? 'text-orange-400' : 'text-green-400'}`} />
              </div>

              <div className={`mb-4 text-sm font-medium p-3 rounded-lg ${
                detected ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'
              }`}>
                {medicationData.note}
              </div>
              
              <ul className="space-y-3">
                {medicationData.meds.map((med, idx) => (
                  <li key={idx} className={`p-3 rounded-xl border ${
                    detected 
                      ? 'bg-white/60 border-orange-200' 
                      : 'bg-white/60 border-green-200'
                  }`}>
                    <div className="flex justify-between items-center mb-1">
                      <span className={`font-bold text-lg ${
                        detected ? 'text-gray-900' : 'text-gray-900'
                      }`}>{med.name}</span>
                      <span className={`text-xs font-bold px-2 py-1 rounded ${
                        detected ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
                      }`}>{med.dose}</span>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">{med.desc}</p>
                  </li>
                ))}
              </ul>

              <div className="mt-6 pt-4 border-t border-gray-200 text-xs text-gray-500 text-center">
                ⚠ AI Generated Recommendation. <br/> This is NOT a medical prescription.
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-2xl p-8 mb-8 animate-fade-in stagger-4">
            <div className="flex items-start space-x-4">
              <AlertTriangle className="w-8 h-8 text-yellow-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-bold text-gray-900 text-xl mb-3">Important Disclaimer</h4>
                <p className="text-gray-700 leading-relaxed">
                  This tool helps in early detection but does not replace a doctor. 
                  The medications listed above are standard protocols for reference only.
                  Do not consume any medication without a verified prescription from a certified medical practitioner.
                </p>
              </div>
            </div>
          </div>

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