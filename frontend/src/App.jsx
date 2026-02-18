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
import BookAppointmentPage from './components/pages/BookAppointmentPage';
import AppointmentsPage from './components/pages/AppointmentsPage';

import { supabase } from './lib/supabase';
import api from './lib/api';
import { GooeyLoader } from './components/common/GooeyLoader'; 
import axios from 'axios'; // Import axios for isCancel check

const App = () => {
  const [currentPage, setCurrentPage] = useState('landing');
  const [loading, setLoading] = useState(true);
  const [pageData, setPageData] = useState(null);
  const [symptomAnswers, setSymptomAnswers] = useState({});
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    let mounted = true;
    
    // Timer to prevent infinite loading state
    const safetyTimer = setTimeout(() => {
      if (mounted && loading) {
        console.warn("⚠️ Safety timer triggered.");
        setLoading(false);
      }
    }, 20000); // 20 seconds

    const initApp = async () => {
      if (isCheckingAuth) return;

      try {
        setIsCheckingAuth(true);
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        if (session?.user && mounted) {
          setUser(session.user);
          await fetchUserRole(session.user);
        } else if (mounted) {
          setLoading(false);
        }
      } catch (error) {
        console.log("Init session check failed or no session:", error.message);
        if (mounted) setLoading(false);
      } finally {
        if (mounted) setIsCheckingAuth(false);
      }
    };

    initApp();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session) {
        if (mounted) {
          setUser(session.user);
          // Only fetch if we aren't already loading/checking
          if (!isCheckingAuth) {
             await fetchUserRole(session.user);
          }
        }
      } else if (event === 'SIGNED_OUT') {
        if (mounted) {
          setUser(null);
          setCurrentPage('landing');
          setLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      clearTimeout(safetyTimer);
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserRole = async (currentUser) => {
    // If we are already on the correct page, don't refetch hard
    if (currentPage === 'doctor-home' || currentPage === 'patient-home') {
        setLoading(false);
        return;
    }

    try {
      setIsCheckingAuth(true);
      const response = await api.get('/profile/');
      const role = response.data.role;
      
      if (role === 'doctor') {
        setCurrentPage('doctor-home');
      } else {
        setCurrentPage('patient-home');
      }
      setLoading(false);

    } catch (err) {
      // --- CRITICAL FIX: IGNORE DUPLICATES ---
      if (axios.isCancel(err) || err.message === "DUPLICATE_REQUEST") {
          console.log("ℹ️ Duplicate profile request ignored.");
          return; // Do NOT set loading=false, let the other request finish
      }

      console.error("Profile fetch error:", err);

      // 1. If 404, user needs to create profile
      if (err.response && err.response.status === 404) {
        setCurrentPage('patient-signup'); 
        setLoading(false);
        return;
      }

      // 2. Try Supabase Metadata as backup
      const metaRole = currentUser?.user_metadata?.role;
      if (metaRole === 'doctor') {
         setCurrentPage('doctor-home');
         setLoading(false);
         return;
      } else if (metaRole === 'patient') {
         setCurrentPage('patient-home');
         setLoading(false);
         return;
      }

      // 3. --- FINAL FAILSAFE ---
      // If API failed AND metadata is missing, DO NOT DEFAULT TO PATIENT.
      // Defaulting to patient is what causes the "glitch".
      // Instead, stay on current page (likely Landing/Login) and show alert.
      if (currentPage !== 'doctor-home') {
          console.warn("⚠️ Could not determine role. API failed & no metadata.");
          // Ideally show a toast here: "Connection failed. Please refresh."
          // But do NOT send them to patient-home.
      }
      
      setLoading(false);
      setIsCheckingAuth(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("❌ Logout error:", error);
    }
  };

  const handleNavigate = (page, data = null) => {
    setCurrentPage(page);
    if (data) setPageData(data);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'landing': return <LandingPage onNavigate={handleNavigate} user={user} onLogout={handleLogout} />;
      case 'login': return <LoginPage onNavigate={handleNavigate} />;
      case 'signup': return <SignupPage onNavigate={handleNavigate} />;
      case 'doctor-signup': return <DoctorSignup onNavigate={handleNavigate} />;
      case 'patient-signup': return <PatientSignup onNavigate={handleNavigate} user={user} />;
      case 'patient-home': return <PatientHomePage onNavigate={handleNavigate} onLogout={handleLogout} user={user} />;
      case 'doctor-home': return <DoctorHomePage onNavigate={handleNavigate} onLogout={handleLogout} user={user} />;
      case 'test-history': return <TestHistoryPage onNavigate={handleNavigate} onLogout={handleLogout} user={user} />;
      case 'book-appointment': return <BookAppointmentPage onNavigate={handleNavigate} user={user} onLogout={handleLogout} />;
      case 'appointments': return <AppointmentsPage onNavigate={handleNavigate} user={user} onLogout={handleLogout} />;
      case 'symptom-test': return <SymptomTestPage onNavigate={handleNavigate} symptomAnswers={symptomAnswers} setSymptomAnswers={setSymptomAnswers} onLogout={handleLogout} user={user} />;
      case 'xray-upload': return <XRayUploadPage onNavigate={handleNavigate} symptomAnswers={symptomAnswers} onLogout={handleLogout} user={user} />;
      case 'test-result': return <TestResultPage onNavigate={handleNavigate} resultData={pageData} onLogout={handleLogout} user={user} symptomAnswers={symptomAnswers} />;
      default: return <LandingPage onNavigate={handleNavigate} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <GooeyLoader className="mx-auto mb-8" primaryColor="#60a5fa" secondaryColor="#bae6fd" borderColor="#bfdbfe" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const showNavbar = !['landing', 'login', 'signup', 'doctor-signup', 'patient-signup', 'patient-home', 'doctor-home', 'test-history', 'symptom-test', 'xray-upload', 'test-result','book-appointment', 'appointments'].includes(currentPage);
  const isUserLoggedIn = !!user;

  return (
    <div className="app-container">
      {showNavbar && (
        <Navbar 
          isLoggedIn={isUserLoggedIn}
          user={user}
          onLogin={() => handleNavigate('login')}
          onLogout={handleLogout}
          userType={null}
          onNavigate={handleNavigate}
        />
      )}
      {renderPage()}
    </div>
  );
};

export default App;
