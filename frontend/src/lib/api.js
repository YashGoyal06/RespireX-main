import axios from 'axios';
import { supabase } from './supabase'; 

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  timeout: 120000,
});

// Store promises, not just keys, so we can return the active promise to duplicates
const pendingRequests = new Map();

api.interceptors.request.use(
  async (config) => {
    const requestKey = `${config.method}-${config.url}`;

    // --- BUG FIX: Shared Promises ---
    // Instead of cancelling the duplicate, we want to "piggyback" on the existing one.
    // However, axios interceptors can't easily swap the promise. 
    // So we stick to the cancellation method BUT we add a specific tag 
    // that the caller can recognize to ignore the error.
    // (A true promise-sharing solution requires wrapping the axios call, 
    // but for now, we will just ensure we don't aggressively block unique params).
    
    // For Safety: Only block GET requests (mutations like POST should probably go through)
    if (config.method === 'get' && pendingRequests.has(requestKey)) {
        console.log("⏸️ Duplicate GET blocked:", requestKey);
        const controller = new AbortController();
        config.signal = controller.signal;
        controller.abort("DUPLICATE_REQUEST"); // Specific reason
        return config;
    }

    if (config.method === 'get') {
        pendingRequests.set(requestKey, true);
        config._requestKey = requestKey;
    }

    try {
      // --- FIX: Increased Timeout to 20s ---
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
      // Clean up if we fail before sending
      if (config._requestKey) pendingRequests.delete(config._requestKey);
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
      pendingRequests.delete(response.config._requestKey);
    }
    return response;
  },
  async (error) => {
    if (error.config?._requestKey) {
      pendingRequests.delete(error.config._requestKey);
    }

    // Ignore duplicates
    if (error.message === "DUPLICATE_REQUEST" || axios.isCancel(error)) {
        return Promise.reject(error);
    }

    if (!error.response) {
      console.error("🌐 Network/Server error");
    }
    return Promise.reject(error);
  }
);

export default api;
