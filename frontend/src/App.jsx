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
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    let mounted = true;
    
    const safetyTimer = setTimeout(() => {
      if (mounted && loading) {
        setLoading(false);
      }
    }, 5000);

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
      if (event === 'SIGNED_IN' && session) {
        if (mounted) {
          setUser(session.user);
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
      // Logic: User Auth'd but no Profile -> Redirect to Profile Setup
      if (err.response && err.response.status === 404) {
        console.log("ℹ️ User authenticated but no profile found. Redirecting to setup.");
        setCurrentPage('patient-signup'); 
      } else {
        console.error("Profile fetch error:", err);
        const role = currentUser?.user_metadata?.role;
        if (role === 'doctor') {
          setCurrentPage('doctor-home');
        } else {
          setCurrentPage('patient-home');
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
      // Pass User & Logout to Landing Page
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
        />;

      default: return <LandingPage onNavigate={handleNavigate} />;
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

  // Updated exclusion list: Added 'landing' to prevent double navbar
  const showNavbar = !['landing', 'login', 'signup', 'doctor-signup', 'patient-signup', 'patient-home', 'doctor-home', 'test-history', 'symptom-test', 'xray-upload', 'test-result'].includes(currentPage);
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