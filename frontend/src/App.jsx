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

const App = () => {
  const [currentPage, setCurrentPage] = useState('landing');
  const [loading, setLoading] = useState(true);
  const [pageData, setPageData] = useState(null);
  const [symptomAnswers, setSymptomAnswers] = useState({});
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    let mounted = true;
    
    // --- FIX 1: Increased Safety Timer from 5s to 20s ---
    // This prevents the loading screen from disappearing too early on slow connections
    const safetyTimer = setTimeout(() => {
      if (mounted && loading) {
        console.warn("⚠️ Safety timer triggered: Forcing loading to false.");
        setLoading(false);
      }
    }, 20000); 

    const initApp = async () => {
      if (isCheckingAuth) return;

      try {
        setIsCheckingAuth(true);
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          if (mounted) {
            setCurrentPage('landing');
            setLoading(false);
          }
          return;
        }
        
        if (session?.user && mounted) {
          setUser(session.user);
          await fetchUserRole(session.user);
        } else if (mounted) {
          setCurrentPage('landing');
          setLoading(false);
        }
      } catch (error) {
        if (mounted) {
          setCurrentPage('landing');
          setLoading(false);
        }
      } finally {
        if (mounted) setIsCheckingAuth(false);
      }
    };

    initApp();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Handle TOKEN_REFRESHED or SIGNED_IN
      if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session) {
        if (mounted) {
          setUser(session.user);
          // Only fetch role if we aren't already doing it
          if (!isCheckingAuth) {
            setIsCheckingAuth(true);
            await fetchUserRole(session.user);
            setIsCheckingAuth(false);
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
    try {
      const response = await api.get('/profile/');
      const role = response.data.role;
      
      if (role === 'doctor') {
        setCurrentPage('doctor-home');
      } else {
        setCurrentPage('patient-home');
      }
      setLoading(false);

    } catch (err) {
      console.error("Profile fetch error:", err);

      // Logic: User Auth'd but no Profile -> Redirect to Profile Setup
      if (err.response && err.response.status === 404) {
        console.log("ℹ️ User authenticated but no profile found. Redirecting to setup.");
        setCurrentPage('patient-signup'); 
      } else {
        // --- FIX 2: Prevent Doctor -> Patient Glitch ---
        // If the API fails (e.g. network timeout), do NOT forcibly switch the page 
        // if the user is already on the doctor dashboard.
        
        const role = currentUser?.user_metadata?.role;
        
        if (role === 'doctor') {
            setCurrentPage('doctor-home');
        } else {
            // Only fallback to patient-home if we are NOT currently on the doctor page.
            // This prevents a background error from demoting a doctor to a patient view.
            if (currentPage !== 'doctor-home') {
                setCurrentPage('patient-home');
            } else {
                console.warn("⚠️ API failed but keeping user on Doctor Home to prevent glitch.");
            }
        }
      }
      setLoading(false);
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
      
      case 'patient-home': 
        return <PatientHomePage onNavigate={handleNavigate} onLogout={handleLogout} user={user} />;
      case 'doctor-home': 
        return <DoctorHomePage onNavigate={handleNavigate} onLogout={handleLogout} user={user} />;
      
      case 'test-history': 
        return <TestHistoryPage onNavigate={handleNavigate} onLogout={handleLogout} user={user} />;
      case 'book-appointment':
        return <BookAppointmentPage onNavigate={handleNavigate} user={user} onLogout={handleLogout} />;
      case 'appointments':
        return <AppointmentsPage onNavigate={handleNavigate} user={user} onLogout={handleLogout} />;
      case 'symptom-test': 
        return <SymptomTestPage 
          onNavigate={handleNavigate} 
          symptomAnswers={symptomAnswers} 
          setSymptomAnswers={setSymptomAnswers} 
          onLogout={handleLogout}
          user={user}
        />;
      
      case 'xray-upload': 
        return <XRayUploadPage 
          onNavigate={handleNavigate} 
          symptomAnswers={symptomAnswers} 
          onLogout={handleLogout}
          user={user}
        />;
      
      case 'test-result': 
        return <TestResultPage 
          onNavigate={handleNavigate} 
          resultData={pageData} 
          onLogout={handleLogout}
          user={user}
          symptomAnswers={symptomAnswers} 
        />;

      default: return <LandingPage onNavigate={handleNavigate} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <GooeyLoader 
            className="mx-auto mb-8"
            primaryColor="#60a5fa" 
            secondaryColor="#bae6fd" 
            borderColor="#bfdbfe" 
          />
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
