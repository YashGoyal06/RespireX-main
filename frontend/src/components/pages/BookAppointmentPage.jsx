import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import Navbar from '../common/Navbar';

const BookAppointmentPage = ({ onNavigate, user, onLogout }) => {
  const [doctors, setDoctors] = useState([]);
  const [formData, setFormData] = useState({ doctor_id: '', date_time: '', reason: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await api.get('/doctors-list/');
        setDoctors(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch doctors", err);
      }
    };
    fetchDoctors();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/appointments/', formData);
      alert('Appointment Booked Successfully!');
      onNavigate('appointments'); // Navigate to list page
    } catch (err) {
      alert('Error booking appointment');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar isLoggedIn={true} user={user} onLogout={onLogout} onNavigate={onNavigate} />
      <div className="max-w-2xl mx-auto py-10 px-4">
        <h2 className="text-3xl font-bold mb-6 text-gray-800">Book a Consultation</h2>
        <div className="bg-white p-6 rounded-lg shadow-md">
            <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-gray-700 mb-2">Select Doctor</label>
                <select 
                    className="w-full p-2 border rounded"
                    onChange={(e) => setFormData({...formData, doctor_id: e.target.value})}
                    required
                >
                    <option value="">-- Choose a Doctor --</option>
                    {doctors.map(doc => (
                        <option key={doc.id} value={doc.id}>
                            Dr. {doc.full_name || doc.email} ({doc.state})
                        </option>
                    ))}
                </select>
            </div>
            <div>
                <label className="block text-gray-700 mb-2">Date & Time</label>
                <input 
                    type="datetime-local" 
                    className="w-full p-2 border rounded"
                    onChange={(e) => setFormData({...formData, date_time: e.target.value})}
                    required
                />
            </div>
            <div>
                <label className="block text-gray-700 mb-2">Reason for Visit</label>
                <textarea 
                    className="w-full p-2 border rounded"
                    rows="3"
                    onChange={(e) => setFormData({...formData, reason: e.target.value})}
                    placeholder="Describe your symptoms..."
                ></textarea>
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                Confirm Booking
            </button>
            </form>
        </div>
      </div>
    </div>
  );
};

export default BookAppointmentPage;
