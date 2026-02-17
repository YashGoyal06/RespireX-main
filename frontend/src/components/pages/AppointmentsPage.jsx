import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import Navbar from '../common/Navbar';

const AppointmentsPage = ({ onNavigate, user, onLogout }) => {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    const fetchAppts = async () => {
        try {
            const res = await api.get('/appointments/');
            setAppointments(res.data);
        } catch(err) {
            console.error(err);
        }
    };
    fetchAppts();
  }, []);

  const handleStatusUpdate = async (id, status) => {
      try {
          await api.patch(`/appointments/${id}/status/`, { status });
          // Refresh list
          const res = await api.get('/appointments/');
          setAppointments(res.data);
      } catch (err) {
          alert("Failed to update status");
      }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar isLoggedIn={true} user={user} onLogout={onLogout} onNavigate={onNavigate} />
      <div className="max-w-4xl mx-auto py-10 px-4">
        <h2 className="text-3xl font-bold mb-6 text-gray-800">My Appointments</h2>
        <div className="space-y-4">
            {appointments.map(appt => (
                <div key={appt.id} className="bg-white p-4 rounded-lg shadow flex justify-between items-center">
                    <div>
                        <p className="font-bold text-lg">
                            {user?.user_metadata?.role === 'doctor' 
                                ? `Patient: ${appt.patient_name || appt.patient_email}`
                                : `Dr. ${appt.doctor_name}`
                            }
                        </p>
                        <p className="text-gray-600">{new Date(appt.date_time).toLocaleString()}</p>
                        <p className="text-sm text-gray-500">Reason: {appt.reason}</p>
                        <span className={`inline-block px-2 py-1 text-xs rounded mt-2 
                            ${appt.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                              appt.status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {appt.status.toUpperCase()}
                        </span>
                    </div>
                    
                    {/* Only show actions for Doctor */}
                    {/* Note: You might need to check role from props or stored profile data */}
                    <div className="space-x-2">
                         <button onClick={() => handleStatusUpdate(appt.id, 'confirmed')} className="text-green-600 hover:underline">Confirm</button>
                         <button onClick={() => handleStatusUpdate(appt.id, 'cancelled')} className="text-red-600 hover:underline">Cancel</button>
                    </div>
                </div>
            ))}
            {appointments.length === 0 && <p className="text-gray-500">No appointments found.</p>}
        </div>
      </div>
    </div>
  );
};

export default AppointmentsPage;
