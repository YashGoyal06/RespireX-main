import React, { useState, useEffect } from 'react';
import Navbar from './components/common/Navbar';
import LandingPage from './components/pages/LandingPage';
import LoginPage from './components/pages/LoginPage';
import SignupPage from './components/pages/SignupPage';
import DoctorSignup from './components/pages/DoctorSignup';
import PatientSignup from './components/pages/PatientSignup';
import PatientHomePage from './components/pages/PatientHomePage';
import DoctorHomePage from './components/pages/DoctorHomePage';
import SymptomTestPage from './components/pages/SymptomTestPage';
import TestHistoryPage from './components/pages/TestHistoryPage';
import TestResultPage from './components/pages/TestResultPage';
import XRayUploadPage from './components/pages/XRayUploadPage';

import { supabase } from './lib/supabase';
import api from './lib/api';
import { Loader } from 'lucide-react';

const App = () => {
  const [currentPage, setCurrentPage] = useState('landing');
  const [loading, setLoading] = useState(true);

  // --- 1. SESSION CHECK LOGIC ---
  useEffect(() => {
    let mounted = true;
    
    // Safety Timer
    const safetyTimer = setTimeout(() => {
      if (mounted && loading) setLoading(false);
    }, 3000);

    const initApp = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user && mounted) {
          await fetchUserRole(user);
        } else if (mounted) {
          setCurrentPage('landing');
        }
      } catch (error) {
        if (mounted) setCurrentPage('landing');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initApp();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        await fetchUserRole(session.user);
      } else if (event === 'SIGNED_OUT') {
        setCurrentPage('landing');
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      clearTimeout(safetyTimer);
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserRole = async (user) => {
    try {
      const response = await api.get('/profile/');
      const role = response.data.role;
      if (role === 'doctor') setCurrentPage('doctor-home');
      else setCurrentPage('patient-home');
    } catch (err) {
      // Fallback
      if (user.user_metadata?.role === 'doctor') setCurrentPage('doctor-home');
      else setCurrentPage('patient-home'); 
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setCurrentPage('landing');
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // --- 2. RENDER LOGIC ---
  const renderPage = () => {
    switch (currentPage) {
      case 'landing': return <LandingPage onNavigate={setCurrentPage} />;
      case 'login': return <LoginPage onNavigate={setCurrentPage} />;
      case 'signup': return <SignupPage onNavigate={setCurrentPage} />;
      case 'doctor-signup': return <DoctorSignup onNavigate={setCurrentPage} />;
      case 'patient-signup': return <PatientSignup onNavigate={setCurrentPage} />;
      case 'patient-home': return <PatientHomePage onNavigate={setCurrentPage} />;
      case 'doctor-home': return <DoctorHomePage onNavigate={setCurrentPage} />;
      case 'symptom-test': return <SymptomTestPage onNavigate={setCurrentPage} />;
      case 'test-history': return <TestHistoryPage onNavigate={setCurrentPage} />;
      case 'test-result': return <TestResultPage onNavigate={setCurrentPage} />;
      case 'xray-upload': return <XRayUploadPage onNavigate={setCurrentPage} />;
      default: return <LandingPage onNavigate={setCurrentPage} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  // --- 3. NAVBAR CONTROL ---
  // Agar page Login/Signup nahi hai, tabhi Navbar dikhao
  const showNavbar = !['login', 'signup', 'doctor-signup', 'patient-signup'].includes(currentPage);
  
  // Agar Landing Page par NAHI ho, iska matlab Logged In ho
  const isUserLoggedIn = currentPage !== 'landing';

  return (
    <div className="app-container">
      {showNavbar && (
        <Navbar 
          // Yaha hum explicit bata rahe hain ki banda logged in hai ya nahi
          isLoggedIn={isUserLoggedIn}
          
          onLogin={() => setCurrentPage('login')}
          onLogout={handleLogout}
          
          userType={currentPage.includes('doctor') ? 'doctor' : currentPage.includes('patient') ? 'patient' : null}
          onNavigate={setCurrentPage}
          
          // Back Button Logic
          showBackButton={isUserLoggedIn && !['patient-home', 'doctor-home'].includes(currentPage)}
          onBack={() => setCurrentPage('patient-home')} // Default back to home
        />
      )}
      {renderPage()}
    </div>
  );
};

export default App;