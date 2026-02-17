import React from 'react';
import { FileText, Clock, Shield, Zap, ChevronRight, Activity, Stethoscope } from 'lucide-react';
import Navbar from '../common/Navbar';
import Footer from '../common/Footer';

const PatientHomePage = ({ onNavigate, onLogout, user }) => { 
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col">
      {/* Navigation */}
      <Navbar 
        onLogout={onLogout} 
        userType="patient" 
        isLoggedIn={true}
        user={user}
        onNavigate={onNavigate} 
      />

      {/* Main Content */}
      <div className="flex-grow pt-32 pb-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-12 animate-fade-in">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">Welcome Back</h1>
            <p className="text-xl text-gray-600">Ready to start your TB screening test?</p>
          </div>

          {/* Main Action Grid (TB Test & History) */}
          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            {/* Quick TB Test Card */}
            <div className="group bg-white rounded-3xl shadow-xl border border-gray-100 p-10 hover-lift animate-fade-in stagger-1">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <FileText className="w-8 h-8 text-white" strokeWidth={2} />
                </div>
                <h2 className="text-3xl font-bold text-gray-900">Quick TB Test</h2>
              </div>
              <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                Answer a few questions about your symptoms and upload your chest X-ray for AI-powered analysis.
              </p>
              <button
                onClick={() => onNavigate('symptom-test')}
                className="group/btn w-full py-4 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition font-semibold text-lg shadow-lg hover:shadow-xl btn-primary flex items-center justify-center space-x-2"
              >
                <span>Start Test</span>
                <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-1 transition" />
              </button>
            </div>

            {/* Test History Card */}
            <div className="group bg-white rounded-3xl shadow-xl border border-gray-100 p-10 hover-lift animate-fade-in stagger-2">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Activity className="w-8 h-8 text-white" strokeWidth={2} />
                </div>
                <h2 className="text-3xl font-bold text-gray-900">Test History</h2>
              </div>
              <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                View your previous test results and track your health progress over time.
              </p>
              <button
                onClick={() => onNavigate('test-history')}
                className="group/btn w-full py-4 bg-gray-100 text-gray-900 rounded-xl hover:bg-gray-200 transition font-semibold text-lg flex items-center justify-center space-x-2"
              >
                <span>View History</span>
                <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-1 transition" />
              </button>
            </div>
          </div>

          {/* NEW: Book Appointment Section */}
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
                        <h2 className="text-3xl font-bold text-gray-900">Book Doctor Consultation</h2>
                    </div>
                    <p className="text-gray-600 text-lg leading-relaxed max-w-2xl">
                        Connect with certified specialists for a detailed diagnosis. Schedule an appointment to discuss your screening results and get professional medical advice.
                    </p>
                </div>
                <button
                    onClick={() => onNavigate('book-appointment')}
                    className="group/btn whitespace-nowrap px-8 py-4 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition font-semibold text-lg shadow-lg hover:shadow-xl flex items-center space-x-2"
                >
                    <span>Book Appointment</span>
                    <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-1 transition" />
                </button>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Clock,
                title: "Early Detection",
                desc: "Early diagnosis of TB significantly improves treatment outcomes and reduces transmission risk.",
                gradient: "from-blue-500 to-blue-600"
              },
              {
                icon: Zap,
                title: "AI-Powered",
                desc: "Our advanced machine learning model provides accurate preliminary screening results.",
                gradient: "from-cyan-500 to-cyan-600"
              },
              {
                icon: Shield,
                title: "Secure & Private",
                desc: "Your health data is encrypted and stored securely with strict privacy measures.",
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
            <h3 className="text-3xl font-bold mb-4">Health Tips</h3>
            <ul className="space-y-3 text-lg">
              <li className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span>Maintain proper ventilation in living spaces</span>
              </li>
              <li className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span>Practice good hygiene and cover your mouth when coughing</span>
              </li>
              <li className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span>Seek medical attention if symptoms persist for more than 2 weeks</span>
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
