/**
 * @file api-client.ts
 * @description Centralized Axios instance for making API requests to the backend.
 * Features:
 * - Base URL configuration from environment variables.
 * - Request interceptors to automatically attach the Bearer token from SecureStore.
 * - Response interceptors for global error handling (e.g., handling 401 Unauthorized).
 */

import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.176:3001/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor to add the auth token to every request
apiClient.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized errors (e.g., logout user or refresh token)
    if (error.response?.status === 401) {
      // Potentially trigger a global logout or refresh flow here
      console.warn('Unauthorized request - session may have expired');
    }
    return Promise.reject(error);
  }
);

export default apiClient;
