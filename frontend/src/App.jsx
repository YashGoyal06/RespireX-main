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
import { GooeyLoader } from './components/common/GooeyLoader.jsx'; // Fixed for Vercel

const App = () => {
  const [currentPage, setCurrentPage] = useState('landing');
  const [loading, setLoading] = useState(true);
  const [isFading, setIsFading] = useState(false); // New state for fade animation
  const [pageData, setPageData] = useState(null);
  const [symptomAnswers, setSymptomAnswers] = useState({});
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    let mounted = true;
    
    const initApp = async () => {
      if (isCheckingAuth) return;

      try {
        setIsCheckingAuth(true);
        
        // Wait for session and force at least 1 second of loading
        const [sessionResult] = await Promise.all([
          supabase.auth.getSession(),
          new Promise(resolve => setTimeout(resolve, 1000))
        ]);

        const { data: { session }, error } = sessionResult;
        
        if (session?.user && mounted) {
          setUser(session.user);
          await fetchUserRole(session.user);
        } else if (mounted) {
          setCurrentPage('landing');
          triggerFadeOut();
        }
      } catch (error) {
        if (mounted) {
          setCurrentPage('landing');
          triggerFadeOut();
        }
      } finally {
        if (mounted) setIsCheckingAuth(false);
      }
    };

    const triggerFadeOut = () => {
      setIsFading(true);
      setTimeout(() => {
        if (mounted) setLoading(false);
      }, 500); // Duration of the fade-out transition
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
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserRole = async (currentUser) => {
    try {
      const response = await api.get('/profile/');
      const role = response.data.role;
      setCurrentPage(role === 'doctor' ? 'doctor-home' : 'patient-home');
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setCurrentPage('patient-signup'); 
      } else {
        const role = currentUser?.user_metadata?.role;
        setCurrentPage(role === 'doctor' ? 'doctor-home' : 'patient-home');
      }
    } finally {
      setIsFading(true);
      setTimeout(() => setLoading(false), 500);
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
      case 'symptom-test': return <SymptomTestPage onNavigate={handleNavigate} symptomAnswers={symptomAnswers} setSymptomAnswers={setSymptomAnswers} onLogout={handleLogout} user={user} />;
      case 'xray-upload': return <XRayUploadPage onNavigate={handleNavigate} symptomAnswers={symptomAnswers} onLogout={handleLogout} user={user} />;
      case 'test-result': return <TestResultPage onNavigate={handleNavigate} resultData={pageData} onLogout={handleLogout} user={user} symptomAnswers={symptomAnswers} />;
      default: return <LandingPage onNavigate={handleNavigate} />;
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center bg-gray-50 transition-opacity duration-500 ${isFading ? 'opacity-0' : 'opacity-100'}`}>
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

  const showNavbar = !['landing', 'login', 'signup', 'doctor-signup', 'patient-signup', 'patient-home', 'doctor-home', 'test-history', 'symptom-test', 'xray-upload', 'test-result'].includes(currentPage);

  return (
    <div className="app-container">
      {showNavbar && (
        <Navbar 
          isLoggedIn={!!user}
          user={user}
          onLogin={() => handleNavigate('login')}
          onLogout={handleLogout}
          onNavigate={handleNavigate}
        />
      )}
      {renderPage()}
    </div>
  );
};

export default App;
