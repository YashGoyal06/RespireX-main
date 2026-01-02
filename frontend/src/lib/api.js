import axios from 'axios';
import { supabase } from './supabase'; 

// SHORTCUT FIX: Use environment variable for URL, fallback to localhost
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  timeout: 120000, // Change 30000 to 120000 (2 mins) for Render cold starts
});

// Track ongoing requests to prevent duplicates
const ongoingRequests = new Map();

// Request Interceptor
api.interceptors.request.use(
  async (config) => {
    try {
      // Create a unique key for this request
      const requestKey = `${config.method}-${config.url}`;
      
      // Check if this exact request is already in progress
      if (ongoingRequests.has(requestKey)) {
        console.log("⏸️ Duplicate request blocked:", requestKey);
        return ongoingRequests.get(requestKey);
      }

      console.log("🚀 API Request:", config.method?.toUpperCase(), config.url);
      
      // Get current session with timeout
      const sessionPromise = Promise.race([
        supabase.auth.getSession(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Session timeout')), 3000)
        )
      ]);
      
      const { data } = await sessionPromise;
      const token = data?.session?.access_token;
      
      if (token) {
        // console.log("✅ Token attached to request"); // Reduced log noise
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Store this request
      ongoingRequests.set(requestKey, config);

      return config;
    } catch (error) {
      console.error("❌ Request interceptor error:", error.message);
      return config;
    }
  },
  (error) => {
    console.error("❌ Request setup error:", error);
    return Promise.reject(error);
  }
);

// Response Interceptor
api.interceptors.response.use(
  (response) => {
    const requestKey = `${response.config.method}-${response.config.url}`;
    ongoingRequests.delete(requestKey);
    return response;
  },
  async (error) => {
    if (error.config) {
      const requestKey = `${error.config.method}-${error.config.url}`;
      ongoingRequests.delete(requestKey);
    }
    
    // Custom Error Message for Connection Failure
    if (!error.response) {
      console.error("🌐 Network error - backend unreachable");
      error.message = "Cannot connect to server. If running locally, ensure 'python manage.py runserver' is running. If deployed, check your VITE_API_URL setting.";
    }
    
    return Promise.reject(error);
  }
);

export default api;