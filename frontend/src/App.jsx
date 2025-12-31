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
  const [pageData, setPageData] = useState(null);
  const [symptomAnswers, setSymptomAnswers] = useState({});
  const [isCheckingAuth, setIsCheckingAuth] = useState(false); // Prevent multiple checks

  useEffect(() => {
    let mounted = true;
    
    const safetyTimer = setTimeout(() => {
      if (mounted && loading) {
        console.log("⏱️ Safety timer triggered");
        setLoading(false);
      }
    }, 5000);

    const initApp = async () => {
      if (isCheckingAuth) {
        console.log("🔄 Auth check already in progress, skipping...");
        return;
      }

      try {
        setIsCheckingAuth(true);
        console.log("🔍 Checking user session...");
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("❌ Session error:", error);
          if (mounted) {
            setCurrentPage('landing');
            setLoading(false);
          }
          return;
        }
        
        if (session?.user && mounted) {
          console.log("✅ User session found:", session.user.email);
          await fetchUserRole(session.user);
        } else if (mounted) {
          console.log("ℹ️ No session found, showing landing page");
          setCurrentPage('landing');
          setLoading(false);
        }
      } catch (error) {
        console.error("❌ Init error:", error);
        if (mounted) {
          setCurrentPage('landing');
          setLoading(false);
        }
      } finally {
        if (mounted) {
          setIsCheckingAuth(false);
        }
      }
    };

    initApp();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("🔔 Auth state changed:", event);
      
      if (event === 'SIGNED_IN' && session && !isCheckingAuth) {
        console.log("✅ User signed in:", session.user.email);
        setIsCheckingAuth(true);
        await fetchUserRole(session.user);
        setIsCheckingAuth(false);
      } else if (event === 'SIGNED_OUT') {
        console.log("🚪 User signed out");
        setCurrentPage('landing');
        setLoading(false);
        setIsCheckingAuth(false);
      }
    });

    return () => {
      mounted = false;
      clearTimeout(safetyTimer);
      subscription.unsubscribe();
    };
  }, []); // Only run once on mount

  const fetchUserRole = async (user) => {
    try {
      console.log("🔎 Fetching user role from backend...");
      
      // Try to get profile from backend
      const response = await api.get('/profile/');
      const role = response.data.role;
      
      console.log("✅ User role from backend:", role);
      
      // Navigate based on role
      if (role === 'doctor') {
        console.log("➡️ Navigating to doctor home");
        setCurrentPage('doctor-home');
      } else {
        console.log("➡️ Navigating to patient home");
        setCurrentPage('patient-home');
      }
      
      setLoading(false);
      
    } catch (err) {
      console.warn("⚠️ Backend fetch failed:", err.message);
      
      // Fallback to metadata if backend fails
      const role = user.user_metadata?.role;
      console.log("🔄 Using metadata role:", role);
      
      if (role === 'doctor') {
        console.log("➡️ Navigating to doctor home (fallback)");
        setCurrentPage('doctor-home');
      } else {
        console.log("➡️ Navigating to patient home (fallback)");
        setCurrentPage('patient-home');
      }
      
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      console.log("🚪 Logging out...");
      await supabase.auth.signOut();
      setCurrentPage('landing');
      setPageData(null);
      setSymptomAnswers({});
      console.log("✅ Logout successful");
    } catch (error) {
      console.error("❌ Logout error:", error);
    }
  };

  const handleNavigate = (page, data = null) => {
    console.log("🧭 Navigating to:", page);
    setCurrentPage(page);
    if (data) {
      setPageData(data);
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'landing': 
        return <LandingPage onNavigate={handleNavigate} />;
      case 'login': 
        return <LoginPage onNavigate={handleNavigate} />;
      case 'signup': 
        return <SignupPage onNavigate={handleNavigate} />;
      case 'doctor-signup': 
        return <DoctorSignup onNavigate={handleNavigate} />;
      case 'patient-signup': 
        return <PatientSignup onNavigate={handleNavigate} />;
      case 'patient-home': 
        return <PatientHomePage onNavigate={handleNavigate} onLogout={handleLogout} />;
      case 'doctor-home': 
        return <DoctorHomePage onNavigate={handleNavigate} onLogout={handleLogout} />;
      case 'symptom-test': 
        return <SymptomTestPage 
          onNavigate={handleNavigate} 
          symptomAnswers={symptomAnswers}
          setSymptomAnswers={setSymptomAnswers}
        />;
      case 'test-history': 
        return <TestHistoryPage onNavigate={handleNavigate} />;
      case 'test-result': 
        return <TestResultPage 
          onNavigate={handleNavigate} 
          resultData={pageData}
        />;
      case 'xray-upload': 
        return <XRayUploadPage 
          onNavigate={handleNavigate}
          symptomAnswers={symptomAnswers}
        />;
      default: 
        return <LandingPage onNavigate={handleNavigate} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const showNavbar = !['login', 'signup', 'doctor-signup', 'patient-signup'].includes(currentPage);
  const isUserLoggedIn = currentPage !== 'landing';

  return (
    <div className="app-container">
      {showNavbar && (
        <Navbar 
          isLoggedIn={isUserLoggedIn}
          onLogin={() => handleNavigate('login')}
          onLogout={handleLogout}
          userType={currentPage.includes('doctor') ? 'doctor' : currentPage.includes('patient') ? 'patient' : null}
          onNavigate={handleNavigate}
          showBackButton={isUserLoggedIn && !['patient-home', 'doctor-home'].includes(currentPage)}
          onBack={() => {
            if (currentPage.includes('doctor')) {
              handleNavigate('doctor-home');
            } else {
              handleNavigate('patient-home');
            }
          }}
        />
      )}
      {renderPage()}
    </div>
  );
};

export default App;