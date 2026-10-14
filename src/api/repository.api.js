import client from './client';

/**
 * List repositories for the current authenticated user.
 *
 * @param {boolean} refresh - When true the backend syncs with GitHub first (expensive).
 *                            Use false to read from the local DB cache.
 * @returns {Promise<RepositoryResponse[]>}
 */
export async function getRepositories(refresh = false) {
  const { data } = await client.get('/api/repos', {
    params: { refresh },
  });
  return data;
}

/**
 * Get a single repository by its application UUID.
 *
 * @param {string} id - Application UUID (not githubRepoId)
 * @returns {Promise<RepositoryResponse>}
 */
export async function getRepository(id) {
  const { data } = await client.get(`/api/repos/${id}`);
  return data;
}

/**
 * Get the indexing status of a repository.
 * Poll this endpoint while indexStatus is PENDING or INDEXING.
 *
 * @param {string} id - Application UUID
 * @returns {Promise<IndexStatusResponse>}
 */
export async function getRepositoryStatus(id) {
  const { data } = await client.get(`/api/repos/${id}/status`);
  return data;
}

/**
 * Trigger indexing for a repository.
 * Backend endpoint: POST /api/repos/{id}/index
 *
 * @param {string} id - Application UUID
 * @returns {Promise<void>}
 */
export async function startIndexing(id) {
  await client.post(`/api/repos/${id}/index`);
}

/**
 * Cancel an ongoing indexing process.
 * Backend endpoint: POST /api/repos/{id}/index/cancel
 *
 * @param {string} id - Application UUID
 * @returns {Promise<void>}
 */
export async function cancelIndexing(id) {
  await client.post(`/api/repos/${id}/index/cancel`);
}

