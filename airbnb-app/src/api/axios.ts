import axios from 'axios';
import { ENV } from '../config/env';
import { decrypt } from '../shared/utils/encryption';

const api = axios.create({
  baseURL: ENV.API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the auth token
api.interceptors.request.use(
  (config) => {
    const encryptedToken = localStorage.getItem('token');
    if (encryptedToken) {
      const token = decrypt(encryptedToken);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
