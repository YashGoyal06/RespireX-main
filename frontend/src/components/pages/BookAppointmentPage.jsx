import React, { useState, useEffect } from 'react';
import { Calendar, Stethoscope, FileText, ChevronRight, User, ArrowLeft } from 'lucide-react';
import api from '../../lib/api';
import Navbar from '../common/Navbar';
import Footer from '../common/Footer';

const BookAppointmentPage = ({ onNavigate, user, onLogout }) => {
  const [doctors, setDoctors] = useState([]);
  const [formData, setFormData] = useState({ doctor_id: '', date_time: '', reason: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await api.get('/doctors-list/');
        setDoctors(res.data);
      } catch (err) {
        console.error("Failed to fetch doctors", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/appointments/', formData);
      alert('Appointment request sent successfully!');
      onNavigate('appointments'); 
    } catch (err) {
      alert('Error booking appointment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col">
      <Navbar isLoggedIn={true} user={user} onLogout={onLogout} onNavigate={onNavigate} />

      <div className="flex-grow pt-28 pb-12 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          
          {/* Back Button */}
          <button 
            onClick={() => onNavigate('patient-home')}
            className="flex items-center text-gray-500 hover:text-gray-900 transition mb-6"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </button>

          {/* Header Section */}
          <div className="text-center mb-10 animate-fade-in">
            <div className="inline-flex items-center justify-center p-3 bg-blue-100 rounded-2xl mb-4">
                <Stethoscope className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-3">Book a Consultation</h1>
            <p className="text-lg text-gray-600">Schedule a visit with one of our specialists.</p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden animate-fade-in stagger-1">
            <div className="p-8 md:p-10">
                <form onSubmit={handleSubmit} className="space-y-8">
                    
                    {/* Doctor Selection */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2 pl-1">Select Specialist</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <User className="h-5 w-5 text-gray-400" />
                            </div>
                            <select 
                                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none appearance-none text-gray-700"
                                onChange={(e) => setFormData({...formData, doctor_id: e.target.value})}
                                required
                            >
                                <option value="">-- Choose a Doctor --</option>
                                {doctors.map(doc => (
                                    <option key={doc.id} value={doc.id}>
                                        Dr. {doc.full_name || doc.email} {doc.state ? `(${doc.state})` : ''}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                <ChevronRight className="h-5 w-5 text-gray-400 rotate-90" />
                            </div>
                        </div>
                    </div>

                    {/* Date Selection */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2 pl-1">Preferred Date & Time</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Calendar className="h-5 w-5 text-gray-400" />
                            </div>
                            <input 
                                type="datetime-local" 
                                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-gray-700"
                                onChange={(e) => setFormData({...formData, date_time: e.target.value})}
                                required
                            />
                        </div>
                    </div>

                    {/* Reason */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2 pl-1">Reason for Visit</label>
                        <div className="relative">
                            <div className="absolute top-4 left-4 pointer-events-none">
                                <FileText className="h-5 w-5 text-gray-400" />
                            </div>
                            <textarea 
                                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none min-h-[120px] text-gray-700"
                                rows="3"
                                onChange={(e) => setFormData({...formData, reason: e.target.value})}
                                placeholder="Describe your symptoms or reason for consultation..."
                                required
                            ></textarea>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button 
                        type="submit" 
                        disabled={submitting}
                        className={`w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center space-x-2 ${submitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        <span>{submitting ? 'Processing...' : 'Confirm Booking'}</span>
                        {!submitting && <ChevronRight className="w-5 h-5" />}
                    </button>
                </form>
            </div>
            
            {/* Disclaimer Footer in Card */}
            <div className="bg-gray-50 px-8 py-4 border-t border-gray-100">
                <p className="text-xs text-center text-gray-500">
                    By booking, you agree to our telemedicine terms. Emergencies should be handled at a local hospital.
                </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default BookAppointmentPage;
