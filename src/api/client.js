import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!BASE_URL) {
  throw new Error(
    'VITE_API_BASE_URL is not configured. Please set it in the frontend environment variables.'
  );
}

const client = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor — handle auth errors globally
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.dispatchEvent(
        new CustomEvent('auth:unauthorized')
      );
    }

    return Promise.reject(error);
  }
);

export default client;