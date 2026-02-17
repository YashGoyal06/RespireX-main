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

    // --- BUG FIX #1: Duplicate detection ---
    // Previously: stored config in a Map and returned it on duplicate.
    // Returning a config object from a request interceptor does NOT cancel
    // the request — axios just uses it as the new config and fires anyway.
    // Worse, if the first request errored out without hitting the response
    // interceptor (e.g. a network drop), the Map entry was never deleted,
    // permanently blocking that endpoint for the rest of the session.
    // Fix: use a Set of keys; cancel duplicates with a real CancelToken.
    if (ongoingRequests.has(requestKey)) {
      console.log("⏸️ Duplicate request blocked:", requestKey);
      // Return a cancelled request so the caller gets a clean rejection
      const controller = new AbortController();
      config.signal = controller.signal;
      controller.abort();
      return config;
    }

    console.log("🚀 API Request:", config.method?.toUpperCase(), config.url);

    // Mark this request as in-flight
    ongoingRequests.add(requestKey);
    // Attach the key so the response interceptor can always find it
    config._requestKey = requestKey;

    try {
      // --- BUG FIX #2: Session timeout was 3 s ---
      // On cold starts (Render / HuggingFace) supabase.auth.getSession() can
      // easily exceed 3 s, causing the race to reject, the catch to swallow
      // the error, and the request to go out with NO Authorization header.
      // The backend then returns 403, which looks like "doctors not loading".
      // Raised to 8 s — long enough for cold starts, short enough to fail fast.
      const sessionPromise = Promise.race([
        supabase.auth.getSession(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Session timeout')), 8000)
        )
      ]);

      const { data } = await sessionPromise;
      const token = data?.session?.access_token;

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      // --- BUG FIX #3: Clean up on interceptor error ---
      // Previously the catch block did nothing with the Set/Map, so a timeout
      // here left the key stuck forever. Now we always clean up.
      console.error("❌ Request interceptor error:", error.message);
      ongoingRequests.delete(requestKey);
      // Still return config so the request fires (without a token it will get
      // a clean 401/403 rather than hanging indefinitely).
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
    // Clean up using the key we attached in the request interceptor
    if (response.config._requestKey) {
      ongoingRequests.delete(response.config._requestKey);
    }
    return response;
  },
  async (error) => {
    // --- BUG FIX #4: Always clean up, even on network errors ---
    // Previously: used `error.config.method + error.config.url` to build the
    // key, but error.config can be undefined on network-level failures (e.g.
    // CORS, abort, timeout), so the delete never ran and the entry got stuck.
    if (error.config?._requestKey) {
      ongoingRequests.delete(error.config._requestKey);
    }

    if (!error.response) {
      // Swallow AbortError from our own duplicate-blocking above
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
