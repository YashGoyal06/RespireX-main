import axios from 'axios';
import { supabase } from './supabase'; 

const api = axios.create({
  // Ensure this matches your Django backend URL
  baseURL: 'http://localhost:8000/api', 
});

// Request Interceptor
api.interceptors.request.use(
  async (config) => {
    // 1. Get current session
    const { data } = await supabase.auth.getSession();
    const token = data?.session?.access_token;

    // 🔍 DEBUG LOGS (Check your browser console for these!)
    console.log("🚀 Interceptor Running for:", config.url);
    
    if (token) {
      console.log("✅ Token found! Attaching to header.");
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn("⚠️ No Session/Token found in Supabase! Sending request without Auth.");
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;