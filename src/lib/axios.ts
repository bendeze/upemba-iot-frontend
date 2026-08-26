import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';

function getBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (envUrl && envUrl.trim().length > 0) {
    const cleaned = envUrl.split('#')[0].trim().replace(/\/+$/, '');
    if (cleaned.length > 0) return cleaned;
  }
  // In the browser, use relative '/api' which is proxied by Next.js rewrites to Django on port 8000
  if (typeof window !== 'undefined') {
    return '/api';
  }
  return 'http://127.0.0.1:8000/api';
}

export const apiClient = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// 1. Structural Request Interceptor
// Statically attaches the JWT access token to every active fetch sequence
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (!config.baseURL) {
      config.baseURL = getBaseUrl();
    }
    // Native JWT uses 'access_token' cookie securely
    const token = Cookies.get('access_token');

    if (token && config.headers) {
      // Conform exactly to standard JWT protocol limits
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 2. Structural Response Interceptor
// Diagnoses API Drops catching the Django `HTTP_401_UNAUTHORIZED` globally
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    // Catch 401 Unauthorized strictly
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshToken = Cookies.get('refresh_token');
      if (refreshToken) {
        try {
          // Attempt to refresh the access token
          const response = await axios.post(`${getBaseUrl()}/token/refresh/`, {
            refresh: refreshToken
          });
          
          if (response.data.access) {
            Cookies.set('access_token', response.data.access, { path: '/', secure: process.env.NODE_ENV === 'production' });
            
            // Retry the original request with the new token
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
            }
            return apiClient(originalRequest);
          }
        } catch (refreshError) {
          // If refresh fails, log out
          Cookies.remove('access_token');
          Cookies.remove('refresh_token');
          if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
        }
      } else {
        // No refresh token available, log out
        Cookies.remove('access_token');
        Cookies.remove('refresh_token');
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
    }

    // Pass arbitrary non 401 errors cleanly forward
    return Promise.reject(error);
  }
);
