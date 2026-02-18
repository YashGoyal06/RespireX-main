import axios from 'axios';
import { supabase } from './supabase'; 

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  timeout: 120000,
});

// Tracks in-flight requests 
const ongoingRequests = new Set();

api.interceptors.request.use(
  async (config) => {
    const requestKey = `${config.method}-${config.url}`;

    // --- SIMPLIFIED DUPLICATE HANDLING ---
    // We only block non-GET requests (like POST/PUT) to prevent double submissions.
    // We ALLOW duplicate GET requests (e.g. fetching profile) to prevent race-condition errors.
    if (config.method !== 'get' && ongoingRequests.has(requestKey)) {
      console.log("⏸️ Duplicate mutation blocked:", requestKey);
      const controller = new AbortController();
      config.signal = controller.signal;
      controller.abort("DUPLICATE_REQ");
      return config;
    }

    if (config.method !== 'get') {
        ongoingRequests.add(requestKey);
        config._requestKey = requestKey;
    }

    try {
      // 20s Timeout for slow cold starts
      const sessionPromise = Promise.race([
        supabase.auth.getSession(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Session timeout')), 20000)
        )
      ]);

      const { data } = await sessionPromise;
      const token = data?.session?.access_token;

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error("❌ Request interceptor error:", error.message);
      if (config._requestKey) ongoingRequests.delete(config._requestKey);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

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

    if (error.message === "DUPLICATE_REQ" || axios.isCancel(error)) {
        return Promise.reject(error);
    }

    if (!error.response) {
      console.error("🌐 Network/Server error");
    }
    return Promise.reject(error);
  }
);

export default api;
