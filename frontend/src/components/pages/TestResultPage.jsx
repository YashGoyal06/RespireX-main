import React, { useState } from 'react';
import { CheckCircle, AlertTriangle, Download, Share2, Home, FileText, Pill, Activity, Loader, Mail, ShieldCheck, MapPin } from 'lucide-react';
import Navbar from '../common/Navbar';
import api from '../../lib/api';

const TestResultPage = ({ onNavigate, resultData, onLogout, user, symptomAnswers, language = 'en', toggleLanguage, darkMode, toggleTheme }) => {
  const [downloading, setDownloading] = useState(false);
  const [emailing, setEmailing] = useState(false); 

  const result = resultData?.result || resultData || {};
  const resultId = result.id || "RES-X892-2026";
  
  const xrayImage = resultData?.xray_image_url || resultData?.originalImage || null;
  const detected = result.result === 'Positive';
  const modelConfidence = parseFloat(result.confidence_score) || 0;
  const riskLevel = result.risk_level || 'Low';
  
  const uploadDate = resultData?.uploadDate 
    ? new Date(resultData.uploadDate).toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : new Date().toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  const t = {
    en: {
        analysisComplete: "Analysis Complete",
        yourResults: "Your Test Results",
        completedOn: "Completed on",
        noTbDetected: "No TB Signs Detected",
        noTbDesc: "Your X-ray analysis shows no signs of tuberculosis",
        tbDetected: "TB Signs Detected",
        tbDesc: "Please consult a healthcare professional immediately",
        confidence: "Model Confidence",
        symptoms: "Symptoms",
        combined: "Combined",
        risk: "Risk Level",
        download: "Download PDF",
        downloading: "Downloading...",
        email: "Email Report",
        sending: "Sending...",
        share: "Share",
        analyzedXray: "Analyzed X-Ray",
        recommendations: "Recommendations",
        consultDoc: "Consult a healthcare professional immediately.",
        sputumTest: "Sputum culture test recommended.",
        hygiene: "Maintain good hygiene and immunity.",
        checkup: "Routine check-up in 6 months.",
        medications: "Suggested Medications",
        aiWarning: "⚠ AI Generated Recommendation. This is NOT a medical prescription.",
        disclaimerTitle: "Important Disclaimer",
        disclaimerText: "This tool helps in early detection but does not replace a doctor. The medications listed above are standard protocols for reference only. Do not consume any medication without a verified prescription from a certified medical practitioner.",
        backHome: "Back to Home",
        viewHistory: "View History",
        regimenNote: "Standard First-Line Regimen (Subject to Doctor's Prescription)",
        supplementNote: "Supplements to boost respiratory health",
        findClinic: "Find Nearby Clinics",
        scanQr: "Scan for Doctor Access",
        qrDesc: "Share this QR code with your specialist for instant access to digital records."
    },
    hi: {
        analysisComplete: "विश्लेषण पूर्ण",
        yourResults: "आपके टेस्ट परिणाम",
        completedOn: "को पूरा हुआ",
        noTbDetected: "टीबी के कोई संकेत नहीं मिले",
        noTbDesc: "आपके एक्स-रे विश्लेषण में तपेदिक के कोई संकेत नहीं दिखे",
        tbDetected: "टीबी के संकेत मिले",
        tbDesc: "कृपया तुरंत किसी स्वास्थ्य विशेषज्ञ से सलाह लें",
        confidence: "मॉडल आत्मविश्वास",
        symptoms: "लक्षण",
        combined: "संयुक्त",
        risk: "जोखिम स्तर",
        download: "पीडीएफ डाउनलोड करें",
        downloading: "डाउनलोड हो रहा है...",
        email: "रिपोर्ट ईमेल करें",
        sending: "भेजा जा रहा है...",
        share: "साझा करें",
        analyzedXray: "विश्लेषित एक्स-रे",
        recommendations: "सुझाव",
        consultDoc: "तुरंत किसी स्वास्थ्य विशेषज्ञ से सलाह लें।",
        sputumTest: "थूक कल्चर टेस्ट की सिफारिश की जाती है।",
        hygiene: "अच्छी स्वच्छता और प्रतिरक्षा बनाए रखें।",
        checkup: "6 महीने में नियमित जांच।",
        medications: "सुझाई गई दवाएं",
        aiWarning: "⚠ एआई जनित सुझाव। यह चिकित्सा पर्ची नहीं है।",
        disclaimerTitle: "महत्वपूर्ण अस्वीकरण",
        disclaimerText: "यह उपकरण प्रारंभिक पहचान में मदद करता है लेकिन डॉक्टर की जगह नहीं लेता है। ऊपर सूचीबद्ध दवाएं केवल संदर्भ के लिए मानक प्रोटोकॉल हैं। प्रमाणित चिकित्सा व्यवसायी से सत्यापित पर्ची के बिना किसी भी दवा का सेवन न करें।",
        backHome: "होम पर वापस जाएं",
        viewHistory: "इतिहास देखें",
        regimenNote: "मानक प्रथम-पंक्ति उपचार (डॉक्टर की पर्ची के अधीन)",
        supplementNote: "श्वसन स्वास्थ्य को बढ़ावा देने के लिए पूरक",
        findClinic: "निकटतम क्लीनिक खोजें",
        scanQr: "डॉक्टर एक्सेस के लिए स्कैन करें",
        qrDesc: "डिजिटल रिकॉर्ड तक त्वरित पहुंच के लिए इस क्यूआर कोड को अपने विशेषज्ञ के साथ साझा करें।"
    }
  };

  const currentT = t[language];

  const getMedications = () => {
    if (detected) {
      return {
        type: "critical",
        note: currentT.regimenNote,
        meds: [
          { name: "Isoniazid (H)", dose: "5 mg/kg", desc: language === 'hi' ? "तपेदिक के उपचार के लिए एंटीबायोटिक।" : "Antibiotic used for treatment of tuberculosis." },
          { name: "Rifampicin (R)", dose: "10 mg/kg", desc: language === 'hi' ? "बैक्टीरियल संक्रमण के इलाज के लिए एंटीबायोटिक।" : "Antibiotic used to treat bacterial infections." },
          { name: "Pyrazinamide (Z)", dose: "25 mg/kg", desc: language === 'hi' ? "उपचार के पहले 2 महीनों में उपयोग किया जाता है।" : "Used in the first 2 months of treatment." },
          { name: "Ethambutol (E)", dose: "15 mg/kg", desc: language === 'hi' ? "बैक्टीरिया को प्रजनन करने से रोकता है।" : "Prevents bacteria from reproducing." }
        ]
      };
    } else {
      return {
        type: "preventive",
        note: currentT.supplementNote,
        meds: [
          { name: "Vitamin D3", dose: "1000 IU", desc: language === 'hi' ? "प्रतिरक्षा प्रणाली के कार्य का समर्थन करता है।" : "Supports immune system function." },
          { name: "Vitamin C", dose: "500 mg", desc: language === 'hi' ? "एंटीऑक्सीडेंट जो कोशिकाओं को नुकसान से बचाता है।" : "Antioxidant that protects cells from damage." },
          { name: "Zinc Gluconate", dose: "50 mg", desc: language === 'hi' ? "प्रतिरक्षा प्रणाली को बैक्टीरिया से लड़ने में मदद करता है।" : "Helps immune system fight off invading bacteria." }
        ]
      };
    }
  };

  const calculateScores = () => {
    let symptomScore = 0;
    if (result.symptoms_data) {
        const answers = Object.values(result.symptoms_data);
        const yesCount = answers.filter(a => typeof a === 'string' && a.toLowerCase() === 'yes').length;
        symptomScore = (yesCount / 8) * 100;
    } 
    else if (symptomAnswers) {
      const answers = Object.values(symptomAnswers);
      const yesCount = answers.filter(a => a === 'Yes').length;
      symptomScore = (yesCount / 8) * 100;
    }

    const meanScore = (modelConfidence + symptomScore) / 2;
    return { symptomScore, meanScore };
  };

  const { symptomScore, meanScore } = calculateScores();
  const medicationData = getMedications();

  const handleDownload = async () => {
    if (!resultId) { alert("Report ID missing."); return; }
    try {
        setDownloading(true);
        const response = await api.get(`/report/${resultId}/`, { responseType: 'blob' });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `RespireX_Report_${resultId}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
    } catch (error) {
        alert("Failed to download report.");
    } finally {
        setDownloading(false);
    }
  };

  const handleEmailReport = async () => {
    if (!resultId) { alert("Report ID missing."); return; }
    try {
      setEmailing(true);
      await api.post(`/email-report/${resultId}/`);
      alert(language === 'hi' ? "सफलता! रिपोर्ट आपको ईमेल कर दी गई है।" : "Success! The report has been emailed to you.");
    } catch (error) {
      alert("Failed to send email.");
    } finally {
      setEmailing(false);
    }
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

  const handleLocateClinic = () => {
    const query = language === 'hi' ? 'टीबी विशेषज्ञ निकट' : 'TB specialists near me';
    window.open(`http://googleusercontent.com/maps.google.com/?q=${query}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 transition-colors">
      <Navbar 
        showBackButton={true}
        onBack={() => onNavigate('patient-home')}
        isLoggedIn={true}
        user={user}
        onLogout={onLogout}
        userType="patient"
        language={language}
        toggleLanguage={toggleLanguage}
        darkMode={darkMode}
        toggleTheme={toggleTheme}
      />

      <div className="pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 animate-fade-in">
            <div className={`inline-block px-4 py-2 rounded-full mb-6 ${
              detected ? 'bg-orange-50 dark:bg-orange-900/30' : 'bg-green-50 dark:bg-green-900/30'
            }`}>
              <span className={`text-sm font-semibold ${
                detected ? 'text-orange-600 dark:text-orange-300' : 'text-green-600 dark:text-green-300'
              }`}>
                {currentT.analysisComplete}
              </span>
            </div>
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">{currentT.yourResults}</h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">{currentT.completedOn} {uploadDate}</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 p-12 mb-8 text-center animate-scale relative overflow-hidden transition-colors">
            
            <div className="absolute top-0 right-0 opacity-5 pointer-events-none">
                <ShieldCheck className="w-64 h-64 text-gray-900 dark:text-white" />
            </div>

            {!detected ? (
              <>
                <div className="w-28 h-28 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl animate-pulse">
                  <CheckCircle className="w-16 h-16 text-white" strokeWidth={2.5} />
                </div>
                <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">{currentT.noTbDetected}</h2>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">{currentT.noTbDesc}</p>
              </>
            ) : (
              <>
                <div className="w-28 h-28 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl">
                  <AlertTriangle className="w-16 h-16 text-white" strokeWidth={2.5} />
                </div>
                <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">{currentT.tbDetected}</h2>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">{currentT.tbDesc}</p>
                
                <button 
                  onClick={handleLocateClinic}
                  className="mb-8 inline-flex items-center space-x-2 px-6 py-3 bg-red-600 text-white rounded-full hover:bg-red-700 transition font-bold shadow-md animate-bounce"
                >
                  <MapPin className="w-5 h-5" />
                  <span>{currentT.findClinic}</span>
                </button>
              </>
            )}
            
            <div className="flex items-center justify-center space-x-8 mb-8">
              <div className="flex flex-col items-center">
                <p className="text-gray-600 dark:text-gray-400 mb-2">{currentT.confidence}</p>
                <p className="text-5xl font-bold text-gray-900 dark:text-white">{Math.round(modelConfidence)}%</p>
                
                <div className="mt-4 flex flex-col space-y-1 text-sm bg-gray-50 dark:bg-gray-700 p-3 rounded-lg border border-gray-100 dark:border-gray-600 w-48">
                   <div className="flex justify-between w-full">
                      <span className="text-gray-500 dark:text-gray-300">{currentT.symptoms}:</span>
                      <span className="font-semibold text-gray-800 dark:text-gray-100">{Math.round(symptomScore)}%</span>
                   </div>
                   <div className="flex justify-between w-full border-t border-gray-200 dark:border-gray-600 pt-1 mt-1">
                      <span className="text-gray-500 dark:text-gray-300">{currentT.combined}:</span>
                      <span className="font-semibold text-blue-600 dark:text-blue-400">{Math.round(meanScore)}%</span>
                   </div>
                </div>
              </div>

              <div className="h-24 w-px bg-gray-200 dark:bg-gray-700"></div>

              <div>
                <p className="text-gray-600 dark:text-gray-400 mb-2">{currentT.risk}</p>
                <div className={`inline-block px-8 py-3 rounded-full font-bold text-lg ${
                  riskLevel === 'High' ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300' :
                  riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300' :
                  'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300'
                }`}>
                  {riskLevel}
                </div>
              </div>
            </div>

            <div className="flex space-x-4 justify-center">
              <button 
                onClick={handleDownload}
                disabled={downloading}
                className="flex items-center space-x-2 px-6 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl hover:bg-gray-800 dark:hover:bg-gray-200 transition font-semibold shadow-lg disabled:opacity-50"
              >
                {downloading ? <Loader className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                <span>{downloading ? currentT.downloading : currentT.download}</span>
              </button>

              <button 
                onClick={handleEmailReport}
                disabled={emailing}
                className="flex items-center space-x-2 px-6 py-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 transition font-semibold shadow-lg disabled:opacity-50"
              >
                {emailing ? <Loader className="w-5 h-5 animate-spin text-blue-600" /> : <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
                <span>{emailing ? currentT.sending : currentT.email}</span>
              </button>

              <button 
                onClick={handleShare}
                className="flex items-center space-x-2 px-6 py-4 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition font-semibold shadow-lg"
              >
                <Share2 className="w-5 h-5" />
                <span>{currentT.share}</span>
              </button>
            </div>
            
            <div className="mt-12 pt-8 border-t border-gray-100 dark:border-gray-700 text-left bg-gray-50 dark:bg-gray-700/50 -mx-12 -mb-12 px-12 pb-8">
              <div className="flex flex-col md:flex-row items-center justify-center gap-6">

                <div className="flex items-center space-x-4 bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-600 shadow-sm">
                   <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=RESPIREX-REPORT-${resultId}`} 
                      alt="Report QR" 
                      className="w-16 h-16"
                   />
                   <div className="max-w-[140px]">
                      <p className="text-xs font-bold text-gray-900 dark:text-white">{currentT.scanQr}</p>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-tight mt-1">{currentT.qrDesc}</p>
                   </div>
                </div>

              </div>
            </div>

          </div>

          {xrayImage && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-8 mb-8 animate-fade-in stagger-1">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{currentT.analyzedXray}</h3>
              <div className="rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-600">
                <img src={xrayImage} alt="Analyzed X-ray" className="w-full h-auto" />
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-8 animate-fade-in stagger-2">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center space-x-3">
                <FileText className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                <span>{currentT.recommendations}</span>
              </h3>
              <div className="space-y-4">
                {detected ? (
                  <>
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="w-6 h-6 text-orange-500 mt-0.5 flex-shrink-0" strokeWidth={2} />
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{currentT.consultDoc}</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="w-6 h-6 text-orange-500 mt-0.5 flex-shrink-0" strokeWidth={2} />
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{currentT.sputumTest}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-6 h-6 text-green-500 mt-0.5 flex-shrink-0" strokeWidth={2} />
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{currentT.hygiene}</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-6 h-6 text-green-500 mt-0.5 flex-shrink-0" strokeWidth={2} />
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{currentT.checkup}</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className={`rounded-2xl shadow-lg p-8 animate-fade-in stagger-3 border ${
              detected ? 'bg-orange-50 dark:bg-orange-900/30 border-orange-100 dark:border-orange-800' : 'bg-green-50 dark:bg-green-900/30 border-green-100 dark:border-green-800'
            }`}>
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-2xl font-bold flex items-center gap-2 ${
                  detected ? 'text-orange-900 dark:text-orange-200' : 'text-green-900 dark:text-green-200'
                }`}>
                  <Pill className={`w-6 h-6 ${detected ? 'text-orange-600 dark:text-orange-400' : 'text-green-600 dark:text-green-400'}`} />
                  {currentT.medications}
                </h3>
                <Activity className={`w-6 h-6 ${detected ? 'text-orange-400' : 'text-green-400'}`} />
              </div>

              <div className={`mb-4 text-sm font-medium p-3 rounded-lg ${
                detected ? 'bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-200' : 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200'
              }`}>
                {medicationData.note}
              </div>
              
              <ul className="space-y-3">
                {medicationData.meds.map((med, idx) => (
                  <li key={idx} className={`p-3 rounded-xl border ${
                    detected ? 'bg-white/60 dark:bg-gray-800/60 border-orange-200 dark:border-orange-800' : 'bg-white/60 dark:bg-gray-800/60 border-green-200 dark:border-green-800'
                  }`}>
                    <div className="flex justify-between items-center mb-1">
                      <span className={`font-bold text-lg ${
                        detected ? 'text-gray-900 dark:text-white' : 'text-gray-900 dark:text-white'
                      }`}>{med.name}</span>
                      <span className={`text-xs font-bold px-2 py-1 rounded ${
                        detected ? 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300' : 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                      }`}>{med.dose}</span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{med.desc}</p>
                  </li>
                ))}
              </ul>

              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400 text-center">
                {currentT.aiWarning}
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-2 border-yellow-200 dark:border-yellow-800 rounded-2xl p-8 mb-8 animate-fade-in stagger-4">
            <div className="flex items-start space-x-4">
              <AlertTriangle className="w-8 h-8 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white text-xl mb-3">{currentT.disclaimerTitle}</h4>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {currentT.disclaimerText}
                </p>
              </div>
            </div>
          </div>

          <div className="flex space-x-4 animate-fade-in stagger-5">
            <button
              onClick={() => onNavigate('patient-home')}
              className="flex-1 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl hover:bg-gray-800 dark:hover:bg-gray-200 font-semibold text-lg shadow-lg hover:shadow-xl btn-primary flex items-center justify-center space-x-2"
            >
              <Home className="w-5 h-5" />
              <span>{currentT.backHome}</span>
            </button>
            <button
              onClick={() => onNavigate('test-history')}
              className="flex-1 py-4 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 font-semibold text-lg flex items-center justify-center space-x-2 transition"
            >
              <FileText className="w-5 h-5" />
              <span>{currentT.viewHistory}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestResultPage;
