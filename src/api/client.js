import axios from 'axios';

// Create generic Axios instance pointing to the Vite proxy (/api)
const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Automatically attach the JWT token if it exists
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle global errors like 401 Unauthorized securely
apiClient.interceptors.response.use(
  (response) => response.data, // Unpack the generic ApiResponse wrapping automatically
  (error) => {
    if (error.response?.status === 401) {
      // User is completely unauthorized or token expired
      localStorage.removeItem('token');
      // Rather than a hard refresh, we rely on AuthContext spotting the token is gone,
      // but if we were outside React we could trigger window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
