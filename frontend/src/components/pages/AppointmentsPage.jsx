import React, { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle, User, Stethoscope, ArrowLeft, MessageSquare } from 'lucide-react';
import api from '../../lib/api';
import Navbar from '../common/Navbar';
import Footer from '../common/Footer';

const AppointmentsPage = ({ onNavigate, user, onLogout, language = 'en', toggleLanguage, darkMode, toggleTheme }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const isDoctor = user?.user_metadata?.role === 'doctor' || user?.role === 'doctor';

  const t = {
    en: {
        back: "Back to Dashboard",
        patientTitle: "My Appointments",
        doctorTitle: "Patient Appointments",
        patientDesc: "Track your upcoming and past visits.",
        doctorDesc: "Manage your incoming consultation requests.",
        bookNew: "Book New",
        loading: "Loading appointments...",
        noAppt: "No appointments found",
        noApptPatient: "You don't have any scheduled consultations.",
        noApptDoctor: "You don't have any patient bookings yet.",
        reason: "Reason:",
        doctorNote: "Doctor's Update:",
        accept: "Accept",
        decline: "Decline"
    },
    hi: {
        back: "डैशबोर्ड पर वापस जाएं",
        patientTitle: "मेरी नियुक्तियाँ",
        doctorTitle: "रोगी नियुक्तियाँ",
        patientDesc: "अपनी आगामी और पिछली यात्राओं को ट्रैक करें।",
        doctorDesc: "अपने आने वाले परामर्श अनुरोधों को प्रबंधित करें।",
        bookNew: "नई बुक करें",
        loading: "नियुक्तियाँ लोड हो रही हैं...",
        noAppt: "कोई नियुक्ति नहीं मिली",
        noApptPatient: "आपके पास कोई निर्धारित परामर्श नहीं है।",
        noApptDoctor: "आपके पास अभी तक कोई रोगी बुकिंग नहीं है।",
        reason: "कारण:",
        doctorNote: "डॉक्टर का अपडेट:",
        accept: "स्वीकार करें",
        decline: "अस्वीकार करें"
    }
  };

  const currentT = t[language];

  useEffect(() => {
    fetchAppts();
  }, []);

  const fetchAppts = async () => {
    try {
        const res = await api.get('/appointments/');
        setAppointments(res.data);
    } catch(err) {
        console.error(err);
    } finally {
        setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
      try {
          await api.patch(`/appointments/${id}/status/`, { status });
          setAppointments(prev => prev.map(appt => 
            appt.id === id ? { ...appt, status: status } : appt
          ));
      } catch (err) {
          alert("Failed to update status");
      }
  };

  const getStatusColor = (status) => {
    switch(status) {
        case 'confirmed': return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800';
        case 'cancelled': return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800';
        default: return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800';
    }
  };

  const getStatusIcon = (status) => {
      switch(status) {
          case 'confirmed': return <CheckCircle className="w-4 h-4 mr-1" />;
          case 'cancelled': return <XCircle className="w-4 h-4 mr-1" />;
          default: return <AlertCircle className="w-4 h-4 mr-1" />;
      }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex flex-col transition-colors">
      <Navbar isLoggedIn={true} user={user} onLogout={onLogout} onNavigate={onNavigate} language={language} toggleLanguage={toggleLanguage} darkMode={darkMode} toggleTheme={toggleTheme} />
      
      <div className="flex-grow pt-28 pb-12 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
            
            <div className="flex items-center justify-between mb-8 animate-fade-in">
                <div>
                    <button 
                        onClick={() => onNavigate(isDoctor ? 'doctor-home' : 'patient-home')}
                        className="flex items-center text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition mb-2 text-sm"
                    >
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        {currentT.back}
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        {isDoctor ? currentT.doctorTitle : currentT.patientTitle}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 mt-1">
                        {isDoctor ? currentT.doctorDesc : currentT.patientDesc}
                    </p>
                </div>
                {!isDoctor && (
                    <button 
                        onClick={() => onNavigate('book-appointment')}
                        className="hidden sm:flex items-center px-5 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition shadow-md font-semibold"
                    >
                        <Stethoscope className="w-4 h-4 mr-2" />
                        {currentT.bookNew}
                    </button>
                )}
            </div>

            <div className="grid gap-6">
                {loading ? (
                    <div className="text-center py-20 text-gray-500 dark:text-gray-400">{currentT.loading}</div>
                ) : appointments.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 animate-fade-in">
                        <Calendar className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <h3 className="text-xl font-medium text-gray-900 dark:text-white">{currentT.noAppt}</h3>
                        <p className="text-gray-500 dark:text-gray-400 mt-2">
                            {isDoctor ? currentT.noApptDoctor : currentT.noApptPatient}
                        </p>
                    </div>
                ) : (
                    appointments.map((appt, idx) => (
                        <div 
                            key={appt.id} 
                            className={`bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all duration-300 animate-fade-in stagger-${idx % 5}`}
                        >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                
                                <div className="flex items-start space-x-4">
                                    <div className={`p-3 rounded-xl flex-shrink-0 ${isDoctor ? 'bg-purple-100 dark:bg-purple-900/30' : 'bg-blue-100 dark:bg-blue-900/30'}`}>
                                        {isDoctor ? (
                                            <User className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                                        ) : (
                                            <Stethoscope className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                            {isDoctor 
                                                ? appt.patient_name || "Unknown Patient"
                                                : `Dr. ${appt.doctor_name || "Unknown"}`
                                            }
                                        </h3>
                                        {isDoctor && (
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{appt.patient_email}</p>
                                        )}

                                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-2 space-x-4">
                                            <div className="flex items-center bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded">
                                                <Calendar className="w-4 h-4 mr-1 text-gray-400 dark:text-gray-300" />
                                                {new Date(appt.date_time).toLocaleDateString()}
                                            </div>
                                            <div className="flex items-center bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded">
                                                <Clock className="w-4 h-4 mr-1 text-gray-400 dark:text-gray-300" />
                                                {new Date(appt.date_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                            </div>
                                        </div>
                                        
                                        <div className="mt-3 inline-block bg-gray-50 dark:bg-gray-700 px-3 py-1 rounded-lg text-sm text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
                                            <span className="font-medium text-gray-700 dark:text-gray-200 mr-1">{currentT.reason}</span> 
                                            {appt.reason || "No reason provided"}
                                        </div>

                                        {/* SHOW DOCTOR NOTE */}
                                        {appt.doctor_note && (
                                            <div className="mt-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 p-3 rounded-lg text-sm text-blue-800 dark:text-blue-300 flex items-start">
                                                <MessageSquare className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                                                <div>
                                                    <span className="font-bold">{currentT.doctorNote}</span> {appt.doctor_note}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-col md:items-end gap-3 min-w-[140px]">
                                    <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${getStatusColor(appt.status)}`}>
                                        {getStatusIcon(appt.status)}
                                        {appt.status}
                                    </span>

                                    {isDoctor && appt.status === 'pending' && (
                                        <div className="flex items-center space-x-2 mt-2 w-full">
                                            <button 
                                                onClick={() => handleStatusUpdate(appt.id, 'confirmed')}
                                                className="flex-1 px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition shadow-sm"
                                            >
                                                {currentT.accept}
                                            </button>
                                            <button 
                                                onClick={() => handleStatusUpdate(appt.id, 'cancelled')}
                                                className="flex-1 px-3 py-2 bg-white text-red-600 border border-red-200 text-sm font-medium rounded-lg hover:bg-red-50 transition"
                                            >
                                                {currentT.decline}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AppointmentsPage;
