import React, { useState, useEffect } from 'react';
import { Check, Volume2 } from 'lucide-react';
import Navbar from '../common/Navbar';

const SymptomTestPage = ({ onNavigate, symptomAnswers, setSymptomAnswers, onLogout, user, language = 'en', toggleLanguage, darkMode, toggleTheme }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [autoSpeak, setAutoSpeak] = useState(false); 

  const t = {
    en: {
      progress: "Complete",
      symptomAssessment: "Symptom Assessment",
      previous: "← Previous Question",
      privacy: "Privacy Note:",
      privacyText: "Your responses are confidential and used only for screening purposes",
      yes: "Yes",
      no: "No",
      autoSpeak: "Auto-Read Questions"
    },
    hi: {
      progress: "पूर्ण",
      symptomAssessment: "लक्षण मूल्यांकन",
      previous: "← पिछला प्रश्न",
      privacy: "गोपनीयता नोट:",
      privacyText: "आपकी प्रतिक्रियाएं गोपनीय हैं और केवल स्क्रीनिंग उद्देश्यों के लिए उपयोग की जाती हैं",
      yes: "हाँ",
      no: "नहीं",
      autoSpeak: "प्रश्न ऑटो-रीड करें"
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

  const speakQuestion = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); 
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'hi' ? 'hi-IN' : 'en-US';
      utterance.rate = 0.9; 
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    if (autoSpeak) {
      const timer = setTimeout(() => speakQuestion(activeQuestionText), 500);
      return () => clearTimeout(timer);
    } else {
      window.speechSynthesis.cancel();
    }
  }, [currentQuestion, language, autoSpeak]);

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const handleAnswer = (answer) => {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 transition-colors">
      <Navbar 
        showCancelButton={true}
        onCancel={() => onNavigate('patient-home')}
        isLoggedIn={true}    
        user={user}          
        onLogout={onLogout}  
        userType="patient"   
        language={language}
        toggleLanguage={toggleLanguage}
        darkMode={darkMode}
        toggleTheme={toggleTheme}
      />

      <div className="fixed top-20 left-0 right-0 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 z-40 transition-colors">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              {language === 'hi' ? `प्रश्न ${currentQuestion + 1} / ${questions.length}` : `Question ${currentQuestion + 1} of ${questions.length}`}
            </span>
            <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">{Math.round(progress)}% {currentT.progress}</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-600 to-cyan-600 h-3 rounded-full transition-all duration-500 ease-out progress-bar"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="pt-44 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          
          <div className="flex justify-end mb-4 animate-fade-in">
             <button 
               onClick={() => setAutoSpeak(!autoSpeak)}
               className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition ${
                 autoSpeak ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : 'bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
               }`}
             >
               <Volume2 className={`w-4 h-4 ${autoSpeak ? 'animate-pulse' : ''}`} />
               <span>{currentT.autoSpeak}</span>
               <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${autoSpeak ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-500'}`}>
                  <div className={`w-3 h-3 bg-white rounded-full shadow-sm transform transition-transform ${autoSpeak ? 'translate-x-4' : ''}`} />
               </div>
             </button>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 p-8 md:p-12 animate-scale relative transition-colors">
            
            <div className="mb-12">
              <div className="flex justify-between items-start mb-6">
                <div className="inline-block px-4 py-2 bg-blue-50 dark:bg-blue-900/30 rounded-full">
                  <span className="text-sm font-semibold text-blue-600 dark:text-blue-300">{currentT.symptomAssessment}</span>
                </div>
                
                <button 
                  onClick={() => speakQuestion(activeQuestionText)}
                  className="p-3 bg-gray-100 dark:bg-gray-700 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-300 rounded-full transition-colors"
                  title="Read Question"
                >
                   <Volume2 className="w-6 h-6" />
                </button>
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white leading-relaxed">
                {activeQuestionText}
              </h2>
            </div>

            <div className="space-y-4">
              {[currentT.yes, currentT.no].map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(option)}
                  className="group w-full p-6 md:p-8 border-2 border-gray-200 dark:border-gray-700 rounded-2xl hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all text-left font-semibold text-gray-900 dark:text-white text-xl hover-lift flex items-center justify-between"
                >
                  <span>{option}</span>
                  <div className="w-8 h-8 rounded-full border-2 border-gray-300 dark:border-gray-600 group-hover:border-blue-500 group-hover:bg-blue-500 transition-all flex items-center justify-center">
                    <Check className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition" strokeWidth={3} />
                  </div>
                </button>
              ))}
            </div>

            {currentQuestion > 0 && (
              <button
                onClick={handlePrevious}
                className="mt-8 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium absolute bottom-8 left-8 hidden md:block"
              >
                {currentT.previous}
              </button>
            )}
            
            {currentQuestion > 0 && (
               <button onClick={handlePrevious} className="md:hidden mt-8 w-full py-3 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl">
                 {currentT.previous}
               </button>
            )}

          </div>

          <div className="mt-8 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 text-center animate-fade-in transition-colors">
            <p className="text-gray-600 dark:text-gray-300">
              <span className="font-semibold text-gray-900 dark:text-white">{currentT.privacy}</span> {currentT.privacyText}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SymptomTestPage;
