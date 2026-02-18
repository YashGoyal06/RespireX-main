import axios from 'axios';
import { supabase } from './supabase'; 

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  timeout: 120000,
});

// Tracks in-flight requests to prevent exact duplicates
const ongoingRequests = new Set();

// Request Interceptor
api.interceptors.request.use(
  async (config) => {
    const requestKey = `${config.method}-${config.url}`;

    // --- Duplicate detection ---
    if (ongoingRequests.has(requestKey)) {
      console.log("⏸️ Duplicate request blocked:", requestKey);
      const controller = new AbortController();
      config.signal = controller.signal;
      controller.abort();
      return config;
    }

    console.log("🚀 API Request:", config.method?.toUpperCase(), config.url);

    ongoingRequests.add(requestKey);
    config._requestKey = requestKey;

    try {
      // --- FIX 3: Increased Session Timeout from 8s to 15s ---
      // This helps on cold starts where getting the token takes longer.
      const sessionPromise = Promise.race([
        supabase.auth.getSession(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Session timeout')), 15000) 
        )
      ]);

      const { data } = await sessionPromise;
      const token = data?.session?.access_token;

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error("❌ Request interceptor error:", error.message);
      ongoingRequests.delete(requestKey);
    }

    return config;
  },
  (error) => {
    console.error("❌ Request setup error:", error);
    return Promise.reject(error);
  }
);

// Response Interceptor
api.interceptors.response.use(
  (response) => {
    if (response.config._requestKey) {
      ongoingRequests.delete(response.config._requestKey);
    }
    return response;
  },
  async (error) => {
    if (error.config?._requestKey) {
      ongoingRequests.delete(error.config._requestKey);
    }

    if (!error.response) {
      if (error.name === 'AbortError' || error.code === 'ERR_CANCELED') {
        return Promise.reject(error);
      }
      console.error("🌐 Network error - backend unreachable");
      error.message =
        "Cannot connect to server. If running locally, ensure 'python manage.py runserver' is running. If deployed, check your VITE_API_URL setting.";
    }

    return Promise.reject(error);
  }
);

export default api;
