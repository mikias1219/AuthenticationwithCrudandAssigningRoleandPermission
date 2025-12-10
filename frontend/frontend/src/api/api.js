import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor - add token to all requests
api.interceptors.request.use(
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

// Response interceptor - handle errors globally
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // Handle 401 Unauthorized
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(error);
      }
      
      // Handle 403 Forbidden (Permission denied)
      if (error.response.status === 403) {
        const url = error.config?.url || '';
        // Don't show alert for GET requests on list endpoints (dashboard handles these gracefully)
        // Only show alert for POST/PUT/DELETE operations or specific actions
        const isListRequest = error.config?.method === 'get' && (
          url.includes('/users') || 
          url.includes('/roles') || 
          url.includes('/permissions')
        );
        
        if (!isListRequest) {
          const message = error.response.data?.message || 'You do not have permission to perform this action.';
          alert(message);
        }
        return Promise.reject(error);
      }
      
      // Handle 419 CSRF token mismatch
      if (error.response.status === 419) {
        alert('Session expired. Please login again.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }
    
    return Promise.reject(error);
  }
);
