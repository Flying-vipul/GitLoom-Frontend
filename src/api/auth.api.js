import client from './client';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!BASE_URL) {
  throw new Error('VITE_API_BASE_URL is not configured');
}

export async function getLoginUrl() {
  const { data } = await client.get('/api/auth/login-url');
  return data;
}

export function redirectToGithubLogin() {
  window.location.href = `${BASE_URL}/oauth2/authorization/github`;
}

export async function getCurrentUser() {
  try {
    const { data } = await client.get('/api/auth/me');
    return data;
  } catch (error) {
    if (error.response?.status === 401) {
      return null;
    }
    throw error;
  }
}

export async function logout() {
  await client.post('/api/auth/logout');
}