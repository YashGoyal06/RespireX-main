import React, { useState, useEffect } from 'react';
import { Users, CheckCircle, AlertCircle, User, MapPin, Filter, Loader, X, Phone, Mail, Calendar, Clock, MessageSquare, ClipboardList } from 'lucide-react';
import Navbar from '../common/Navbar';
import Footer from '../common/Footer';
import api from '../../lib/api';

// Sub-components need props passed down or simple inline usage
const PatientDetailsModal = ({ patient, onClose }) => {
  const [downloading, setDownloading] = useState(false);
  if (!patient) return null;
  const isPositive = patient.result === 'Positive';

  const handleDownloadReport = async () => {
    setDownloading(true);
    try {
      const response = await api.get(`/report/${patient.id}/`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `RespireX_Report_${patient.name.replace(/\s+/g, '_')}_${patient.id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      alert("Could not download the report.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-scale ring-1 ring-gray-100 dark:ring-gray-700 relative">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-gray-700 rounded-full"><X className="w-5 h-5" /></button>
        <div className="p-8">
           <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-2xl flex items-center justify-center text-2xl font-bold text-blue-600 dark:text-blue-300">
                  {patient.name.charAt(0)}
              </div>
              <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{patient.name}</h2>
                  <p className="text-gray-500 dark:text-gray-400">{patient.gender}, {patient.age} years</p>
              </div>
           </div>
           <div className="space-y-3 mb-6">
              <div className="flex items-center text-gray-600 dark:text-gray-300"><Phone className="w-4 h-4 mr-2"/> {patient.phone}</div>
              <div className="flex items-center text-gray-600 dark:text-gray-300"><Mail className="w-4 h-4 mr-2"/> {patient.email}</div>
              <div className="flex items-center text-gray-600 dark:text-gray-300"><MapPin className="w-4 h-4 mr-2"/> {patient.city}, {patient.state}</div>
           </div>
           <div className={`p-4 rounded-xl border ${isPositive ? 'bg-orange-50 dark:bg-orange-900/30 border-orange-100 dark:border-orange-800' : 'bg-green-50 dark:bg-green-900/30 border-green-100 dark:border-green-800'} flex justify-between items-center`}>
              <div>
                  <p className={`font-bold ${isPositive ? 'text-orange-800 dark:text-orange-200' : 'text-green-800 dark:text-green-200'}`}>Result: {patient.result}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Confidence: {patient.confidence}%</p>
              </div>
              <button onClick={handleDownloadReport} disabled={downloading} className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg text-sm hover:bg-gray-800 dark:hover:bg-gray-200">
                  {downloading ? 'Downloading...' : 'Download Report'}
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

const RescheduleModal = ({ isOpen, onClose, onSubmit, note, setNote, date, setDate }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md p-6 animate-scale">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Reschedule / Add Comment</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                    Select a new date to automatically update and confirm the appointment, or just add a note to cancel and request re-booking.
                </p>
                
                <div className="mb-5">
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">New Date & Time (Optional)</label>
                  <div className="relative">
                    <input 
                      type="datetime-local"
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-700 dark:text-white"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Doctor's Note</label>
                  <textarea 
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm min-h-[100px] text-gray-700 dark:text-white"
                      placeholder="e.g., I have a conflict at the original time. Please see the new time proposed."
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                  ></textarea>
                </div>

                <div className="flex justify-end space-x-3 pt-2 border-t border-gray-100 dark:border-gray-700">
                    <button onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">Cancel</button>
                    <button onClick={onSubmit} className="px-5 py-2.5 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-200 dark:shadow-none transition-all">
                      {date ? 'Reschedule & Confirm' : 'Send Update'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// RECEIVE DARK MODE PROPS HERE
const DoctorHomePage = ({ onNavigate, onLogout, user, darkMode, toggleTheme }) => { 
  const [activeTab, setActiveTab] = useState('records'); 
  const [selectedState, setSelectedState] = useState('all');
  const [stats, setStats] = useState({ total: 0, positive: 0, negative: 0, underReview: 0 });
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [doctorName, setDoctorName] = useState('');
  const [appointments, setAppointments] = useState([]);
  const [apptLoading, setApptLoading] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedApptId, setSelectedApptId] = useState(null);
  const [rescheduleNote, setRescheduleNote] = useState("");
  const [rescheduleDate, setRescheduleDate] = useState(""); 

  const states = [
    'All States', 'Andhra Pradesh', 'Bihar', 'Gujarat', 'Karnataka', 
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Punjab', 'Rajasthan',
    'Tamil Nadu', 'Uttar Pradesh', 'West Bengal'
  ];

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/profile/');
        if (response.data.full_name) setDoctorName(response.data.full_name);
      } catch (err) { console.error(err); }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/doctor/dashboard/?state=${selectedState === 'All States' ? 'all' : selectedState}`);
        setStats(response.data.stats);
        const mappedPatients = response.data.records.map(record => {
          const confidence = record.confidence_score ? Math.round(record.confidence_score) : 0;
          let calculatedRisk = record.risk_level;
          if (record.result === 'Positive') {
            if (confidence > 80) calculatedRisk = 'High';
            else if (confidence >= 50) calculatedRisk = 'Medium';
            else calculatedRisk = 'Low';
          } else {
            calculatedRisk = 'Low';
          }
          return {
            id: record.id,
            name: record.patient_name || record.full_name || "Unknown Patient", 
            age: record.age || "N/A",
            gender: record.gender || "N/A",
            state: record.state || "",
            city: record.city || "",
            address: record.address || record.street_address || "", 
            email: record.email || record.patient_email || "Not provided", 
            phone: record.phone || record.phone_number || record.contact || "Not provided",
            lastTest: new Date(record.date_tested).toLocaleDateString('en-US', {
              year: 'numeric', month: 'long', day: 'numeric'
            }),
            result: record.result,
            riskLevel: calculatedRisk,
            confidence: confidence
          };
        });
        setPatients(mappedPatients);
      } catch (err) {
        console.error("Failed to load dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedState]);

  useEffect(() => {
    if (activeTab === 'appointments') fetchAppointments();
  }, [activeTab]);

  const fetchAppointments = async () => {
    setApptLoading(true);
    try {
      const res = await api.get('/appointments/');
      setAppointments(res.data);
    } catch (err) { console.error(err); } finally { setApptLoading(false); }
  };

  const handleApproveAppointment = async (id) => {
    if(!window.confirm("Confirm this appointment? An email will be sent to the patient.")) return;
    try {
      await api.patch(`/appointments/${id}/status/`, { status: 'confirmed' });
      alert("Appointment Confirmed! Email sent.");
      fetchAppointments();
    } catch (err) { alert("Error confirming appointment."); }
  };

  const openRescheduleModal = (id) => {
    setSelectedApptId(id);
    setRescheduleNote("");
    setRescheduleDate(""); 
    setShowRescheduleModal(true);
  };

  const submitReschedule = async () => {
    try {
      const payload = { doctor_note: rescheduleNote };
      if (rescheduleDate) {
        payload.status = 'confirmed';
        payload.date_time = rescheduleDate; 
      } else {
        payload.status = 'cancelled';
      }
      await api.patch(`/appointments/${selectedApptId}/status/`, payload);
      alert(rescheduleDate ? "Appointment rescheduled & confirmed." : "Update sent.");
      setShowRescheduleModal(false);
      fetchAppointments();
    } catch (err) { alert("Error updating appointment."); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800 flex flex-col transition-colors">
      <Navbar 
        onLogout={onLogout} 
        userType="doctor" 
        user={user} 
        isLoggedIn={true} 
        onNavigate={onNavigate} 
        displayName={doctorName ? `Dr. ${doctorName}` : 'Doctor'} 
        darkMode={darkMode}       // <--- PASSED
        toggleTheme={toggleTheme} // <--- PASSED
      />
      
      <PatientDetailsModal patient={selectedPatient} onClose={() => setSelectedPatient(null)} />
      
      <RescheduleModal 
        isOpen={showRescheduleModal}
        onClose={() => setShowRescheduleModal(false)}
        onSubmit={submitReschedule}
        note={rescheduleNote}
        setNote={setRescheduleNote}
        date={rescheduleDate}
        setDate={setRescheduleDate}
      />

      <div className="flex-grow pt-32 pb-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 animate-fade-in">
            <div>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white">{doctorName ? `Dr. ${doctorName}` : 'Doctor Dashboard'}</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Manage patient records and appointments</p>
            </div>
            
            <div className="mt-4 md:mt-0 bg-white dark:bg-gray-800 p-1 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm inline-flex">
                <button 
                    onClick={() => setActiveTab('records')}
                    className={`flex items-center px-4 py-2 rounded-lg text-sm font-semibold transition ${activeTab === 'records' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                >
                    <ClipboardList className="w-4 h-4 mr-2" />
                    Patient Records
                </button>
                <button 
                    onClick={() => setActiveTab('appointments')}
                    className={`flex items-center px-4 py-2 rounded-lg text-sm font-semibold transition ${activeTab === 'appointments' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                >
                    <Calendar className="w-4 h-4 mr-2" />
                    Appointments
                </button>
            </div>
          </div>

          {activeTab === 'records' && (
             <div className="animate-fade-in">
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    {[
                    { icon: Users, label: "Total Cases", value: stats.total || 0, gradient: "from-blue-500 to-blue-600" },
                    { icon: CheckCircle, label: "Negative Cases", value: stats.negative || 0, gradient: "from-green-500 to-green-600" },
                    { icon: AlertCircle, label: "Positive Cases", value: stats.positive || 0, gradient: "from-orange-500 to-orange-600" },
                    ].map((stat, idx) => (
                    <div key={idx} className={`bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex items-center justify-between`}>
                        <div>
                            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{stat.label}</p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</p>
                        </div>
                        <div className={`w-12 h-12 bg-gradient-to-br ${stat.gradient} rounded-xl flex items-center justify-center shadow-lg`}>
                            <stat.icon className="w-6 h-6 text-white" />
                        </div>
                    </div>
                    ))}
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 mb-6 flex items-center space-x-4">
                    <Filter className="w-5 h-5 text-gray-400" />
                    <select value={selectedState} onChange={(e) => setSelectedState(e.target.value)} className="flex-1 border-none bg-transparent font-medium text-gray-700 dark:text-gray-200 focus:ring-0 cursor-pointer outline-none">
                        {states.map(state => <option key={state} value={state} className="dark:bg-gray-800">{state}</option>)}
                    </select>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
                    {loading ? (
                        <div className="p-12 text-center text-gray-500"><Loader className="w-8 h-8 animate-spin mx-auto mb-2"/>Loading data...</div>
                    ) : patients.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">No records found.</div>
                    ) : (
                        <div className="divide-y divide-gray-100 dark:divide-gray-700">
                            {patients.map((patient) => (
                                <div key={patient.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-12 h-12 bg-cyan-100 dark:bg-cyan-900 rounded-full flex items-center justify-center text-cyan-700 dark:text-cyan-300 font-bold">{patient.name.charAt(0)}</div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 dark:text-white">{patient.name}</h3>
                                            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 space-x-3 mt-1">
                                                <span>{patient.age} yrs</span>
                                                <span>•</span>
                                                <span className="flex items-center"><MapPin className="w-3 h-3 mr-1"/>{patient.city}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-6">
                                        <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${patient.result === 'Positive' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300' : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'}`}>{patient.result}</div>
                                        <button onClick={() => setSelectedPatient(patient)} className="px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition">View Details</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
             </div>
          )}

          {activeTab === 'appointments' && (
              <div className="animate-fade-in">
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden min-h-[400px]">
                      {apptLoading ? (
                          <div className="p-12 text-center text-gray-500"><Loader className="w-8 h-8 animate-spin mx-auto mb-2"/>Loading appointments...</div>
                      ) : appointments.length === 0 ? (
                          <div className="p-20 text-center">
                              <Calendar className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                              <h3 className="text-xl font-bold text-gray-900 dark:text-white">No Appointments</h3>
                              <p className="text-gray-500 dark:text-gray-400">You don't have any pending consultation requests.</p>
                          </div>
                      ) : (
                          <div className="divide-y divide-gray-100 dark:divide-gray-700">
                              {appointments.map((appt) => (
                                  <div key={appt.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                          <div className="flex items-start space-x-4">
                                              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-xl text-purple-600 dark:text-purple-300">
                                                  <User className="w-6 h-6" />
                                              </div>
                                              <div>
                                                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">{appt.patient_name || "Unknown"}</h3>
                                                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{appt.patient_email}</p>
                                                  
                                                  <div className="flex items-center space-x-4 text-sm text-gray-700 dark:text-gray-300">
                                                      <div className="flex items-center bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                                                          <Calendar className="w-4 h-4 mr-2 text-gray-400"/>
                                                          {new Date(appt.date_time).toLocaleDateString()}
                                                      </div>
                                                      <div className="flex items-center bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                                                          <Clock className="w-4 h-4 mr-2 text-gray-400"/>
                                                          {new Date(appt.date_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                      </div>
                                                  </div>
                                                  {appt.reason && (
                                                      <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 italic border-l-2 border-gray-300 dark:border-gray-600 pl-2">
                                                          "{appt.reason}"
                                                      </div>
                                                  )}
                                              </div>
                                          </div>

                                          <div className="flex flex-col items-end gap-2">
                                              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                                                  appt.status === 'confirmed' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 
                                                  appt.status === 'cancelled' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' : 
                                                  'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300'
                                              }`}>
                                                  {appt.status}
                                              </span>

                                              {appt.status === 'pending' && (
                                                  <div className="flex items-center space-x-2 mt-2">
                                                      <button 
                                                          onClick={() => handleApproveAppointment(appt.id)}
                                                          className="flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 shadow-sm transition"
                                                      >
                                                          <CheckCircle className="w-4 h-4 mr-2" />
                                                          Approve
                                                      </button>
                                                      <button 
                                                          onClick={() => openRescheduleModal(appt.id)}
                                                          className="flex items-center px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition"
                                                      >
                                                          <MessageSquare className="w-4 h-4 mr-2" />
                                                          Comment/Change
                                                      </button>
                                                  </div>
                                              )}
                                          </div>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      )}
                  </div>
              </div>
          )}

        </div>
      </div>
      <Footer />
    </div>
  );
};

export default DoctorHomePage;
