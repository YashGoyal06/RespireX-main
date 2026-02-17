import React, { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle, User, Stethoscope, ArrowLeft } from 'lucide-react';
import api from '../../lib/api';
import Navbar from '../common/Navbar';
import Footer from '../common/Footer';

const AppointmentsPage = ({ onNavigate, user, onLogout }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Determine role safely
  const isDoctor = user?.user_metadata?.role === 'doctor' || user?.role === 'doctor';

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
          // Optimistic update
          setAppointments(prev => prev.map(appt => 
            appt.id === id ? { ...appt, status: status } : appt
          ));
      } catch (err) {
          alert("Failed to update status");
      }
  };

  const getStatusColor = (status) => {
    switch(status) {
        case 'confirmed': return 'bg-green-100 text-green-700 border-green-200';
        case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
        default: return 'bg-amber-100 text-amber-700 border-amber-200';
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col">
      <Navbar isLoggedIn={true} user={user} onLogout={onLogout} onNavigate={onNavigate} />
      
      <div className="flex-grow pt-28 pb-12 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
            
            {/* Header with Back Button */}
            <div className="flex items-center justify-between mb-8 animate-fade-in">
                <div>
                    <button 
                        onClick={() => onNavigate(isDoctor ? 'doctor-home' : 'patient-home')}
                        className="flex items-center text-gray-500 hover:text-gray-900 transition mb-2 text-sm"
                    >
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Back to Dashboard
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900">
                        {isDoctor ? 'Patient Appointments' : 'My Appointments'}
                    </h1>
                    <p className="text-gray-600 mt-1">
                        {isDoctor 
                            ? 'Manage your incoming consultation requests.' 
                            : 'Track your upcoming and past visits.'}
                    </p>
                </div>
                {/* Add Booking Button for Patients Only */}
                {!isDoctor && (
                    <button 
                        onClick={() => onNavigate('book-appointment')}
                        className="hidden sm:flex items-center px-5 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition shadow-md font-semibold"
                    >
                        <Stethoscope className="w-4 h-4 mr-2" />
                        Book New
                    </button>
                )}
            </div>

            {/* Content Grid */}
            <div className="grid gap-6">
                {loading ? (
                    <div className="text-center py-20 text-gray-500">Loading appointments...</div>
                ) : appointments.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100 animate-fade-in">
                        <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-medium text-gray-900">No appointments found</h3>
                        <p className="text-gray-500 mt-2">
                            {isDoctor 
                             ? "You don't have any patient bookings yet." 
                             : "You don't have any scheduled consultations."}
                        </p>
                    </div>
                ) : (
                    appointments.map((appt, idx) => (
                        <div 
                            key={appt.id} 
                            className={`bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 animate-fade-in stagger-${idx % 5}`}
                        >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                
                                {/* Info Section */}
                                <div className="flex items-start space-x-4">
                                    <div className={`p-3 rounded-xl flex-shrink-0 ${isDoctor ? 'bg-purple-100' : 'bg-blue-100'}`}>
                                        {isDoctor ? (
                                            <User className="w-6 h-6 text-purple-600" />
                                        ) : (
                                            <Stethoscope className="w-6 h-6 text-blue-600" />
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">
                                            {isDoctor 
                                                ? appt.patient_name || "Unknown Patient"
                                                : `Dr. ${appt.doctor_name || "Unknown"}`
                                            }
                                        </h3>
                                        {/* Shows extra details for doctors */}
                                        {isDoctor && (
                                            <p className="text-sm text-gray-500">{appt.patient_email}</p>
                                        )}

                                        <div className="flex items-center text-sm text-gray-500 mt-2 space-x-4">
                                            <div className="flex items-center bg-gray-50 px-2 py-1 rounded">
                                                <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                                                {new Date(appt.date_time).toLocaleDateString()}
                                            </div>
                                            <div className="flex items-center bg-gray-50 px-2 py-1 rounded">
                                                <Clock className="w-4 h-4 mr-1 text-gray-400" />
                                                {new Date(appt.date_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                            </div>
                                        </div>
                                        {/* Reason Bubble */}
                                        <div className="mt-3 inline-block bg-gray-50 px-3 py-1 rounded-lg text-sm text-gray-600 border border-gray-200">
                                            <span className="font-medium text-gray-700 mr-1">Reason:</span> 
                                            {appt.reason || "No reason provided"}
                                        </div>
                                    </div>
                                </div>

                                {/* Status & Actions Section */}
                                <div className="flex flex-col md:items-end gap-3 min-w-[140px]">
                                    {/* Status Badge */}
                                    <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${getStatusColor(appt.status)}`}>
                                        {getStatusIcon(appt.status)}
                                        {appt.status}
                                    </span>

                                    {/* Doctor Actions */}
                                    {isDoctor && appt.status === 'pending' && (
                                        <div className="flex items-center space-x-2 mt-2 w-full">
                                            <button 
                                                onClick={() => handleStatusUpdate(appt.id, 'confirmed')}
                                                className="flex-1 px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition shadow-sm"
                                            >
                                                Accept
                                            </button>
                                            <button 
                                                onClick={() => handleStatusUpdate(appt.id, 'cancelled')}
                                                className="flex-1 px-3 py-2 bg-white text-red-600 border border-red-200 text-sm font-medium rounded-lg hover:bg-red-50 transition"
                                            >
                                                Decline
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
