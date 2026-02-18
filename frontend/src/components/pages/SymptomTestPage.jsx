import React, { useState } from 'react';
import { Check } from 'lucide-react';
import Navbar from '../common/Navbar';

const SymptomTestPage = ({ onNavigate, symptomAnswers, setSymptomAnswers, onLogout, user, language = 'en', toggleLanguage }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);

  // Translation Dictionaries
  const t = {
    en: {
      progress: "Complete",
      symptomAssessment: "Symptom Assessment",
      previous: "← Previous Question",
      privacy: "Privacy Note:",
      privacyText: "Your responses are confidential and used only for screening purposes",
      yes: "Yes",
      no: "No"
    },
    hi: {
      progress: "पूर्ण",
      symptomAssessment: "लक्षण मूल्यांकन",
      previous: "← पिछला प्रश्न",
      privacy: "गोपनीयता नोट:",
      privacyText: "आपकी प्रतिक्रियाएं गोपनीय हैं और केवल स्क्रीनिंग उद्देश्यों के लिए उपयोग की जाती हैं",
      yes: "हाँ",
      no: "नहीं"
    }
  };

  const currentT = t[language];

  const questions = [
    {
      id: 1,
      text_en: "Do you have a persistent cough lasting more than 3 weeks?",
      text_hi: "क्या आपको 3 सप्ताह से अधिक समय से लगातार खांसी है?",
      options: ["Yes", "No"],
      key: "persistent_cough"
    },
    {
      id: 2,
      text_en: "Have you experienced fever, especially in the evenings?",
      text_hi: "क्या आपको बुखार है, विशेष रूप से शाम को?",
      options: ["Yes", "No"],
      key: "fever"
    },
    {
      id: 3,
      text_en: "Have you noticed unexplained weight loss recently?",
      text_hi: "क्या आपने हाल ही में बिना कारण वजन कम होते देखा है?",
      options: ["Yes", "No"],
      key: "weight_loss"
    },
    {
      id: 4,
      text_en: "Do you experience night sweats?",
      text_hi: "क्या आपको रात में पसीना आता है?",
      options: ["Yes", "No"],
      key: "night_sweats"
    },
    {
      id: 5,
      text_en: "Have you coughed up blood or blood-tinged sputum?",
      text_hi: "क्या आपको खांसी में खून या खून जैसा बलगम आया है?",
      options: ["Yes", "No"],
      key: "blood_cough"
    },
    {
      id: 6,
      text_en: "Do you feel chest pain or discomfort?",
      text_hi: "क्या आपको सीने में दर्द या बेचैनी महसूस होती है?",
      options: ["Yes", "No"],
      key: "chest_pain"
    },
    {
      id: 7,
      text_en: "Have you experienced fatigue or weakness?",
      text_hi: "क्या आपको थकान या कमजोरी महसूस होती है?",
      options: ["Yes", "No"],
      key: "fatigue"
    },
    {
      id: 8,
      text_en: "Have you been in close contact with someone diagnosed with TB?",
      text_hi: "क्या आप टीबी से पीड़ित किसी व्यक्ति के निकट संपर्क में रहे हैं?",
      options: ["Yes", "No"],
      key: "tb_contact"
    }
  ];

  const activeQuestionText = language === 'hi' ? questions[currentQuestion].text_hi : questions[currentQuestion].text_en;

  // --- CORE LOGIC ---
  const handleAnswer = (answer) => {
    // Standardize for backend
    let standardAnswer = "No";
    if (answer === t.en.yes || answer === t.hi.yes) standardAnswer = "Yes";

    const updatedAnswers = {
      ...symptomAnswers,
      [questions[currentQuestion].key]: standardAnswer
    };
    setSymptomAnswers(updatedAnswers);
    
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      onNavigate('xray-upload');
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navbar 
        showCancelButton={true}
        onCancel={() => onNavigate('patient-home')}
        isLoggedIn={true}    
        user={user}          
        onLogout={onLogout}  
        userType="patient"   
        language={language}
        toggleLanguage={toggleLanguage}
      />

      {/* Progress Bar */}
      <div className="fixed top-20 left-0 right-0 bg-white border-b border-gray-100 z-40">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-gray-700">
              {language === 'hi' ? `प्रश्न ${currentQuestion + 1} / ${questions.length}` : `Question ${currentQuestion + 1} of ${questions.length}`}
            </span>
            <span className="text-sm font-semibold text-blue-600">{Math.round(progress)}% {currentT.progress}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-600 to-cyan-600 h-3 rounded-full transition-all duration-500 ease-out progress-bar"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-44 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 md:p-12 animate-scale relative">
            
            <div className="mb-12">
              <div className="flex justify-between items-start mb-6">
                <div className="inline-block px-4 py-2 bg-blue-50 rounded-full">
                  <span className="text-sm font-semibold text-blue-600">{currentT.symptomAssessment}</span>
                </div>
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-relaxed">
                {activeQuestionText}
              </h2>
            </div>

            {/* OPTIONS */}
            <div className="space-y-4">
              {[currentT.yes, currentT.no].map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(option)}
                  className="group w-full p-6 md:p-8 border-2 border-gray-200 rounded-2xl hover:border-blue-500 hover:bg-blue-50 transition-all text-left font-semibold text-gray-900 text-xl hover-lift flex items-center justify-between"
                >
                  <span>{option}</span>
                  <div className="w-8 h-8 rounded-full border-2 border-gray-300 group-hover:border-blue-500 group-hover:bg-blue-500 transition-all flex items-center justify-center">
                    <Check className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition" strokeWidth={3} />
                  </div>
                </button>
              ))}
            </div>

            {/* Previous Button - Adjusted Spacing */}
            {currentQuestion > 0 && (
              <div className="flex flex-col md:block">
                 {/* Desktop: Reduced margin, removed absolute positioning */}
                 <button
                   onClick={handlePrevious}
                   className="hidden md:inline-block mt-6 text-gray-500 hover:text-gray-900 font-medium transition-colors"
                 >
                   {currentT.previous}
                 </button>
                 
                 {/* Mobile: Reduced margin */}
                 <button 
                   onClick={handlePrevious} 
                   className="md:hidden mt-4 w-full py-3 text-gray-500 hover:bg-gray-50 rounded-xl transition-colors"
                 >
                   {currentT.previous}
                 </button>
              </div>
            )}

          </div>

          <div className="mt-8 bg-white rounded-2xl border border-gray-100 p-6 text-center animate-fade-in">
            <p className="text-gray-600">
              <span className="font-semibold text-gray-900">{currentT.privacy}</span> {currentT.privacyText}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SymptomTestPage;
