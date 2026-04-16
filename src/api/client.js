import axios from 'axios';

// ─── Base URL ────────────────────────────────────────────────────────────────
// In development, VITE_API_BASE_URL is unset so it falls back to '/api',
// which is proxied to http://localhost:5080/api by vite.config.js.
// In production builds, set VITE_API_BASE_URL=https://your-api.com/api
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';

// ─── Standard JSON client ─────────────────────────────────────────────────────
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Multipart/form-data client ───────────────────────────────────────────────
// Used for file uploads (StoryEditor). Keep separate so default headers don't
// override the boundary that axios sets automatically for FormData.
export const apiMultipart = axios.create({
  baseURL: BASE_URL,
  // Let the browser/axios set Content-Type with the correct multipart boundary
});

// ─── Shared interceptor factory ───────────────────────────────────────────────
function attachInterceptors(instance) {
  // Attach JWT on every request
  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Unpack ApiResponse wrapper & handle auth errors globally
  instance.interceptors.response.use(
    (response) => response.data,
    (error) => {
      const status = error.response?.status;

      if (status === 401) {
        localStorage.removeItem('token');
        // Redirect to login outside of React render cycle
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }

      if (status === 403) {
        console.error('[API] Forbidden — insufficient permissions.');
      }

      // Normalise error so callers always get a message string
      const message =
        error.response?.data?.message ||
        error.message ||
        'An unexpected error occurred.';
      return Promise.reject(new Error(message));
    }
  );
}

attachInterceptors(apiClient);
attachInterceptors(apiMultipart);

export default apiClient;
