import React, { useState, useEffect } from 'react';
import { Activity, Users, CheckCircle, AlertCircle, User, MapPin, Filter, Loader, X, Phone, Mail, Calendar, FileText } from 'lucide-react';
import Navbar from '../common/Navbar';
import Footer from '../common/Footer';
import api from '../../lib/api';

const DoctorHomePage = ({ onNavigate, onLogout, user }) => { 
  const [selectedState, setSelectedState] = useState('all');
  const [stats, setStats] = useState({ total: 0, positive: 0, negative: 0, underReview: 0 });
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState(null);

  const states = [
    'All States', 'Andhra Pradesh', 'Bihar', 'Gujarat', 'Karnataka', 
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Punjab', 'Rajasthan',
    'Tamil Nadu', 'Uttar Pradesh', 'West Bengal'
  ];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/doctor/dashboard/?state=${selectedState === 'All States' ? 'all' : selectedState}`);
        setStats(response.data.stats);
        
        const mappedPatients = response.data.records.map(record => ({
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
          riskLevel: record.risk_level,
          confidence: record.confidence_score ? Math.round(record.confidence_score) : 0
        }));
        
        setPatients(mappedPatients);
      } catch (err) {
        console.error("Failed to load dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedState]);

  // 🎨 REDESIGNED MODAL: Minimal & Professional
  const PatientDetailsModal = ({ patient, onClose }) => {
    if (!patient) return null;

    const isPositive = patient.result === 'Positive';

    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-fade-in">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-scale ring-1 ring-gray-100">
          
          {/* Header with Close Button */}
          <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-white">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Patient Profile</h3>
              <p className="text-sm text-gray-500 mt-1">ID: #{patient.id}</p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-8">
            <div className="flex flex-col md:flex-row gap-8">
              
              {/* Left Col: Identity */}
              <div className="flex-shrink-0 text-center md:text-left">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl flex items-center justify-center mx-auto md:mx-0 mb-4 shadow-inner">
                  <span className="text-4xl font-bold text-blue-600">
                    {patient.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">{patient.name}</h2>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-sm font-medium text-gray-600">
                  <span className="capitalize">{patient.gender}</span>
                  <span>•</span>
                  <span>{patient.age} yrs</span>
                </div>
              </div>

              {/* Right Col: Details Grid */}
              <div className="flex-grow grid grid-cols-1 gap-6">
                
                {/* Contact Section */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Contact Information</h4>
                  
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium text-gray-900">{patient.phone}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium text-gray-900 truncate max-w-[200px]">{patient.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      {/* Address Logic: Only show street address if it exists */}
                      <p className="font-medium text-gray-900">
                        {patient.address ? `${patient.address}, ` : ''}
                        {patient.city}, {patient.state}
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Medical Card Section */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Latest Screening Result</h4>
              
              <div className={`rounded-2xl p-5 border ${
                isPositive 
                  ? 'bg-orange-50 border-orange-100' 
                  : 'bg-green-50 border-green-100'
              } flex items-center justify-between`}>
                
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    isPositive ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'
                  }`}>
                    {isPositive ? <Activity className="w-6 h-6" /> : <CheckCircle className="w-6 h-6" />}
                  </div>
                  <div>
                    <p className={`font-bold text-lg ${
                      isPositive ? 'text-orange-900' : 'text-green-900'
                    }`}>
                      {patient.result}
                    </p>
                    <p className={`text-sm ${
                      isPositive ? 'text-orange-700' : 'text-green-700'
                    }`}>
                      Confidence Score: {patient.confidence}%
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide mb-1 ${
                    patient.riskLevel === 'High' ? 'bg-red-200 text-red-800' :
                    patient.riskLevel === 'Medium' ? 'bg-yellow-200 text-yellow-800' :
                    'bg-green-200 text-green-800'
                  }`}>
                    {patient.riskLevel} Risk
                  </span>
                  <p className="text-xs text-gray-500 mt-1">Tested: {patient.lastTest}</p>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-cyan-50 flex flex-col">
      <Navbar 
        onLogout={onLogout} 
        userType="doctor" 
        user={user}
        isLoggedIn={true}
        onNavigate={onNavigate} 
      />

      {/* Render Modal */}
      {selectedPatient && (
        <PatientDetailsModal 
          patient={selectedPatient} 
          onClose={() => setSelectedPatient(null)} 
        />
      )}

      <div className="flex-grow pt-32 pb-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-12 animate-fade-in">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">Patient Dashboard</h1>
            <p className="text-xl text-gray-600">Monitor and manage patient records</p>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-4 gap-6 mb-12">
            {[
              { icon: Users, label: "Total Patients", value: stats.total || 0, gradient: "from-blue-500 to-blue-600" },
              { icon: CheckCircle, label: "Negative Cases", value: stats.negative || 0, gradient: "from-green-500 to-green-600" },
              { icon: AlertCircle, label: "Positive Cases", value: stats.positive || 0, gradient: "from-orange-500 to-orange-600" },
              { icon: Activity, label: "Under Review", value: stats.underReview || 0, gradient: "from-purple-500 to-purple-600" }
            ].map((stat, idx) => (
              <div key={idx} className={`bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover-lift animate-fade-in stagger-${idx + 1}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${stat.gradient} rounded-xl flex items-center justify-center shadow-lg`}>
                    <stat.icon className="w-6 h-6 text-white" strokeWidth={2} />
                  </div>
                  <span className="text-4xl font-bold text-gray-900">{stat.value}</span>
                </div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Filter Section */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8 animate-fade-in stagger-5">
            <div className="flex items-center space-x-4">
              <Filter className="w-5 h-5 text-gray-400" />
              <MapPin className="w-5 h-5 text-gray-400" />
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition text-gray-900 font-medium"
              >
                {states.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Patient List */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden animate-fade-in stagger-5">
            <div className="px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <h2 className="text-2xl font-bold text-gray-900">Patient Records</h2>
              <p className="text-gray-600 mt-1">
                {loading ? 'Loading...' : `Total ${patients.length} records found`}
              </p>
            </div>
            
            {loading ? (
              <div className="p-12 text-center text-gray-500">
                 <Loader className="w-8 h-8 animate-spin mx-auto mb-2"/>
                 Loading data...
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {patients.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">No records found for this selection.</div>
                ) : (
                  patients.map((patient, idx) => (
                    <div key={patient.id} className={`p-8 hover:bg-gray-50 transition-all animate-fade-in stagger-${idx + 1}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-6">
                          <div className="w-14 h-14 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-2xl flex items-center justify-center">
                            <User className="w-7 h-7 text-cyan-600" strokeWidth={2} />
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900 text-lg mb-1">{patient.name}</h3>
                            <p className="text-gray-600 flex items-center space-x-2">
                              <span>Age {patient.age}</span>
                              <span className="text-gray-400">•</span>
                              <MapPin className="w-4 h-4" />
                              <span>{patient.city}, {patient.state}</span>
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-8">
                          <div className="text-right">
                            <p className="text-sm text-gray-500 mb-1">Last Test</p>
                            <p className="font-semibold text-gray-900">{patient.lastTest}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500 mb-1">Result</p>
                            <p className={`font-bold ${patient.result === 'Positive' ? 'text-orange-600' : 'text-green-600'}`}>
                              {patient.result}
                            </p>
                          </div>
                          <div>
                            <span className={`px-6 py-2 rounded-xl text-sm font-semibold ${
                              patient.riskLevel === 'High' ? 'bg-red-100 text-red-700' :
                              patient.riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-green-100 text-green-700'
                            }`}>
                              {patient.riskLevel}
                            </span>
                          </div>
                          <button 
                            onClick={() => setSelectedPatient(patient)}
                            className="px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition font-semibold shadow-lg hover:shadow-xl btn-primary"
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default DoctorHomePage;