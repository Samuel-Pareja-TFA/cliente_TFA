const API_BASE_URL = 'http://localhost:8080';

/**
 * Helper para hacer peticiones a la API del backend.
 *
 * @param {string} path ruta relativa (ej: "/api/v1/publications")
 * @param {RequestInit} [options] opciones de fetch
 * @returns {Promise<any>} cuerpo JSON parseado
 */
export async function apiFetch(path, options = {}) {
  const url = `${API_BASE_URL}${path}`;
  const { headers = {}, method = 'GET', ...rest } = options;

  // Solo enviamos Content-Type: application/json en métodos que llevan body
  const baseHeaders =
    method === 'GET' || method === 'HEAD'
      ? {}
      : { 'Content-Type': 'application/json' };

  const response = await fetch(url, {
    method,
    ...rest,
    headers: {
      ...baseHeaders,
      ...headers
    }
  });

  if (!response.ok) {
    let errorBody;

    try {
      errorBody = await response.json();
    } catch {
      errorBody = { message: response.statusText };
    }

    const error = new Error(
      errorBody.detail || errorBody.message || 'Error en la API'
    );
    error.status = response.status;
    error.body = errorBody;
    throw error;
  }

  // 204 No Content → no hay cuerpo
  if (response.status === 204) {
    return null;
  }

  return response.json();
}
