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
import axios from 'axios'; 

const App = () => {
  const [currentPage, setCurrentPage] = useState('landing');
  const [loading, setLoading] = useState(true);
  const [pageData, setPageData] = useState(null);
  const [symptomAnswers, setSymptomAnswers] = useState({});
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);
  const [user, setUser] = useState(null);

  // --- MULTILINGUAL STATE ---
  const [language, setLanguage] = useState('en'); // 'en' (English) | 'hi' (Hindi)
  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'hi' : 'en');
  };

  useEffect(() => {
    let mounted = true;
    
    // Safety timer
    const safetyTimer = setTimeout(() => {
      if (mounted && loading) {
        console.warn("⚠️ Safety timer triggered.");
        setLoading(false);
      }
    }, 20000); 

    const initApp = async () => {
      if (isCheckingAuth) return;

      try {
        setIsCheckingAuth(true);
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        if (session?.user && mounted) {
          setUser(session.user);
          // PRE-CHECK: If metadata already says doctor, set it immediately
          if (session.user.user_metadata?.role === 'doctor') {
             setCurrentPage('doctor-home');
          }
          await fetchUserRole(session.user);
        } else if (mounted) {
          setLoading(false);
        }
      } catch (error) {
        console.log("Init session check failed:", error.message);
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
          if (session.user.user_metadata?.role === 'doctor') {
             setCurrentPage('doctor-home');
          }
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
      } else if (role === 'patient') {
        setCurrentPage('patient-home');
      }
      setLoading(false);

    } catch (err) {
      if (axios.isCancel(err)) {
          return; 
      }
      console.error("Profile fetch error:", err);

      if (err.response && err.response.status === 404) {
        setCurrentPage('patient-signup'); 
        setLoading(false);
        return;
      }

      const metaRole = currentUser?.user_metadata?.role;
      if (metaRole === 'doctor') {
         setCurrentPage('doctor-home');
      } else if (metaRole === 'patient') {
         setCurrentPage('patient-home');
      } else {
         console.warn("⚠️ Role unknown and API failed. Staying on current page.");
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
      
      // --- UPDATED PATIENT PAGES (Passing language props) ---
      case 'patient-home': 
        return <PatientHomePage 
          onNavigate={handleNavigate} 
          onLogout={handleLogout} 
          user={user} 
          language={language}             // <--- Passed
          toggleLanguage={toggleLanguage} // <--- Passed
        />;

      case 'test-history': 
        return <TestHistoryPage 
          onNavigate={handleNavigate} 
          onLogout={handleLogout} 
          user={user} 
          language={language}             // <--- Passed
          toggleLanguage={toggleLanguage} // <--- Passed
        />;

      case 'book-appointment':
        return <BookAppointmentPage 
          onNavigate={handleNavigate} 
          user={user} 
          onLogout={handleLogout} 
          language={language}             // <--- Passed
          toggleLanguage={toggleLanguage} // <--- Passed
        />;

      case 'appointments':
        return <AppointmentsPage 
          onNavigate={handleNavigate} 
          user={user} 
          onLogout={handleLogout} 
          language={language}             // <--- Passed
          toggleLanguage={toggleLanguage} // <--- Passed
        />;
      
      case 'xray-upload': 
        return <XRayUploadPage 
          onNavigate={handleNavigate} 
          symptomAnswers={symptomAnswers} 
          onLogout={handleLogout} 
          user={user}
          language={language}             // <--- Passed
          toggleLanguage={toggleLanguage} // <--- Passed
        />;

      case 'symptom-test': 
        return <SymptomTestPage 
          onNavigate={handleNavigate} 
          symptomAnswers={symptomAnswers} 
          setSymptomAnswers={setSymptomAnswers} 
          onLogout={handleLogout}
          user={user}
          language={language}             
          toggleLanguage={toggleLanguage} 
        />;
      
      case 'test-result': 
        return <TestResultPage 
          onNavigate={handleNavigate} 
          resultData={pageData} 
          onLogout={handleLogout}
          user={user}
          symptomAnswers={symptomAnswers}
          language={language}             
          toggleLanguage={toggleLanguage} 
        />;

      // Doctor pages (No changes as requested)
      case 'doctor-home': 
        return <DoctorHomePage onNavigate={handleNavigate} onLogout={handleLogout} user={user} />;
      
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

  // Navbar Logic
  const showNavbar = !['landing', 'login', 'signup', 'doctor-signup', 'patient-signup', 'patient-home', 'doctor-home', 'test-history', 'xray-upload','book-appointment', 'appointments'].includes(currentPage);
  
  const isUserLoggedIn = !!user;

  return (
    <div className="app-container">
      {/* Global Navbar for pages that use it (and aren't excluding it) */}
      {showNavbar && !['symptom-test', 'test-result'].includes(currentPage) && (
        <Navbar 
          isLoggedIn={isUserLoggedIn}
          user={user}
          onLogin={() => handleNavigate('login')}
          onLogout={handleLogout}
          userType={null}
          onNavigate={handleNavigate}
          // Pass props here too if Landing/Generic pages need toggle
          language={language}
          toggleLanguage={toggleLanguage}
        />
      )}
      {renderPage()}
    </div>
  );
};

export default App;
