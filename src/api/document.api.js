/**
 * Document API — NOT YET IMPLEMENTED on the backend.
 * These are clean abstractions ready to be wired to real endpoints.
 */

import client from './client';

export async function getDocuments() {
  const { data } = await client.get('/api/documents');
  return data;
}

export async function getDocument(documentId) {
  const { data } = await client.get(`/api/documents/${documentId}`);
  return data;
}

export async function uploadDocument(file) {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await client.post('/api/documents', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function deleteDocument(documentId) {
  await client.delete(`/api/documents/${documentId}`);
}

export async function searchDocuments(query) {
  const { data } = await client.get('/api/documents/search', {
    params: { q: query },
  });
  return data;
}
