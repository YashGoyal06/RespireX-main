import React from 'react';
import { FileText, Clock, Shield, Zap, ChevronRight, Activity, Stethoscope, Calendar } from 'lucide-react';
import Navbar from '../common/Navbar';
import Footer from '../common/Footer';

const PatientHomePage = ({ onNavigate, onLogout, user, language = 'en', toggleLanguage }) => { 
  
  const t = {
    en: {
      welcome: "Welcome Back",
      subtitle: "Ready to start your TB screening test?",
      quickTest: "Quick TB Test",
      quickTestDesc: "Answer a few questions about your symptoms and upload your chest X-ray for AI-powered analysis.",
      startTest: "Start Test",
      history: "Test History",
      historyDesc: "View your previous test results and track your health progress over time.",
      viewHistory: "View History",
      bookConsult: "Doctor Consultation",
      bookConsultDesc: "Connect with certified specialists for a detailed diagnosis. Schedule an appointment or manage your existing bookings.",
      bookBtn: "Book Appointment",
      viewApptBtn: "View Appointments", // <--- New Translation
      feat1Title: "Early Detection",
      feat1Desc: "Early diagnosis of TB significantly improves treatment outcomes and reduces transmission risk.",
      feat2Title: "AI-Powered",
      feat2Desc: "Our advanced machine learning model provides accurate preliminary screening results.",
      feat3Title: "Secure & Private",
      feat3Desc: "Your health data is encrypted and stored securely with strict privacy measures.",
      tipsTitle: "Health Tips",
      tip1: "Maintain proper ventilation in living spaces",
      tip2: "Practice good hygiene and cover your mouth when coughing",
      tip3: "Seek medical attention if symptoms persist for more than 2 weeks"
    },
    hi: {
      welcome: "वापसी पर स्वागत है",
      subtitle: "क्या आप अपना टीबी स्क्रीनिंग टेस्ट शुरू करने के लिए तैयार हैं?",
      quickTest: "त्वरित टीबी टेस्ट",
      quickTestDesc: "अपने लक्षणों के बारे में कुछ सवालों के जवाब दें और एआई-संचालित विश्लेषण के लिए अपना चेस्ट एक्स-रे अपलोड करें।",
      startTest: "टेस्ट शुरू करें",
      history: "टेस्ट इतिहास",
      historyDesc: "अपने पिछले टेस्ट परिणाम देखें और समय के साथ अपनी स्वास्थ्य प्रगति को ट्रैक करें।",
      viewHistory: "इतिहास देखें",
      bookConsult: "डॉक्टर परामर्श",
      bookConsultDesc: "विस्तृत निदान के लिए प्रमाणित विशेषज्ञों से जुड़ें। अपॉइंटमेंट शेड्यूल करें या अपनी मौजूदा बुकिंग प्रबंधित करें।",
      bookBtn: "अपॉइंटमेंट बुक करें",
      viewApptBtn: "नियुक्तियाँ देखें", // <--- New Translation
      feat1Title: "प्रारंभिक पहचान",
      feat1Desc: "टीबी का प्रारंभिक निदान उपचार के परिणामों में काफी सुधार करता है और संक्रमण के जोखिम को कम करता है।",
      feat2Title: "एआई-संचालित",
      feat2Desc: "हमारा उन्नत मशीन लर्निंग मॉडल सटीक प्रारंभिक स्क्रीनिंग परिणाम प्रदान करता है।",
      feat3Title: "सुरक्षित और निजी",
      feat3Desc: "आपका स्वास्थ्य डेटा एन्क्रिप्टेड है और सख्त गोपनीयता उपायों के साथ सुरक्षित रूप से संग्रहीत है।",
      tipsTitle: "स्वास्थ्य सुझाव",
      tip1: "रहने की जगहों में उचित वेंटिलेशन बनाए रखें",
      tip2: "अच्छी स्वच्छता का अभ्यास करें और खांसते समय अपना मुंह ढकें",
      tip3: "यदि लक्षण 2 सप्ताह से अधिक समय तक बने रहते हैं तो चिकित्सा सहायता लें"
    }
  };

  const currentT = t[language];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col">
      {/* Navigation */}
      <Navbar 
        onLogout={onLogout} 
        userType="patient" 
        isLoggedIn={true}
        user={user}
        onNavigate={onNavigate} 
        language={language}
        toggleLanguage={toggleLanguage}
      />

      {/* Main Content */}
      <div className="flex-grow pt-32 pb-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-12 animate-fade-in">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">{currentT.welcome}</h1>
            <p className="text-xl text-gray-600">{currentT.subtitle}</p>
          </div>

          {/* Main Action Grid (TB Test & History) */}
          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            {/* Quick TB Test Card */}
            <div className="group bg-white rounded-3xl shadow-xl border border-gray-100 p-10 hover-lift animate-fade-in stagger-1">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <FileText className="w-8 h-8 text-white" strokeWidth={2} />
                </div>
                <h2 className="text-3xl font-bold text-gray-900">{currentT.quickTest}</h2>
              </div>
              <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                {currentT.quickTestDesc}
              </p>
              <button
                onClick={() => onNavigate('symptom-test')}
                className="group/btn w-full py-4 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition font-semibold text-lg shadow-lg hover:shadow-xl btn-primary flex items-center justify-center space-x-2"
              >
                <span>{currentT.startTest}</span>
                <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-1 transition" />
              </button>
            </div>

            {/* Test History Card */}
            <div className="group bg-white rounded-3xl shadow-xl border border-gray-100 p-10 hover-lift animate-fade-in stagger-2">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Activity className="w-8 h-8 text-white" strokeWidth={2} />
                </div>
                <h2 className="text-3xl font-bold text-gray-900">{currentT.history}</h2>
              </div>
              <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                {currentT.historyDesc}
              </p>
              <button
                onClick={() => onNavigate('test-history')}
                className="group/btn w-full py-4 bg-gray-100 text-gray-900 rounded-xl hover:bg-gray-200 transition font-semibold text-lg flex items-center justify-center space-x-2"
              >
                <span>{currentT.viewHistory}</span>
                <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-1 transition" />
              </button>
            </div>
          </div>

          {/* Book Appointment Section - Updated with Two Buttons */}
          <div className="mb-12 group bg-white rounded-3xl shadow-xl border border-gray-100 p-10 hover-lift animate-fade-in stagger-3 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
                <Stethoscope className="w-64 h-64 text-purple-600" />
            </div>
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <Stethoscope className="w-8 h-8 text-white" strokeWidth={2} />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900">{currentT.bookConsult}</h2>
                    </div>
                    <p className="text-gray-600 text-lg leading-relaxed max-w-2xl">
                        {currentT.bookConsultDesc}
                    </p>
                </div>
                
                {/* BUTTONS CONTAINER */}
                <div className="flex flex-col gap-3 w-full md:w-auto">
                    {/* Button 1: Book */}
                    <button
                        onClick={() => onNavigate('book-appointment')}
                        className="group/btn whitespace-nowrap px-8 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition font-semibold text-lg shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 w-full"
                    >
                        <span>{currentT.bookBtn}</span>
                        <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-1 transition" />
                    </button>
                    
                    {/* Button 2: View (Added below Book) */}
                    <button
                        onClick={() => onNavigate('appointments')}
                        className="group/btn whitespace-nowrap px-8 py-3 bg-purple-50 text-purple-700 border border-purple-100 rounded-xl hover:bg-purple-100 transition font-semibold text-lg flex items-center justify-center space-x-2 w-full"
                    >
                        <Calendar className="w-5 h-5" />
                        <span>{currentT.viewApptBtn}</span>
                    </button>
                </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Clock,
                title: currentT.feat1Title,
                desc: currentT.feat1Desc,
                gradient: "from-blue-500 to-blue-600"
              },
              {
                icon: Zap,
                title: currentT.feat2Title,
                desc: currentT.feat2Desc,
                gradient: "from-cyan-500 to-cyan-600"
              },
              {
                icon: Shield,
                title: currentT.feat3Title,
                desc: currentT.feat3Desc,
                gradient: "from-indigo-500 to-indigo-600"
              }
            ].map((card, idx) => (
              <div 
                key={idx}
                className={`bg-white rounded-2xl p-8 border border-gray-100 hover-lift animate-fade-in stagger-${idx + 4} shadow-sm hover:shadow-xl transition-shadow duration-300`}
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${card.gradient} rounded-xl flex items-center justify-center mb-6 shadow-lg`}>
                  <card.icon className="w-7 h-7 text-white" strokeWidth={2} />
                </div>
                <h3 className="font-bold text-gray-900 text-xl mb-3">{card.title}</h3>
                <p className="text-gray-600 leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>

          {/* Health Tips */}
          <div className="mt-12 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-3xl p-10 text-white animate-fade-in stagger-5">
            <h3 className="text-3xl font-bold mb-4">{currentT.tipsTitle}</h3>
            <ul className="space-y-3 text-lg">
              <li className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span>{currentT.tip1}</span>
              </li>
              <li className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span>{currentT.tip2}</span>
              </li>
              <li className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span>{currentT.tip3}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PatientHomePage;
