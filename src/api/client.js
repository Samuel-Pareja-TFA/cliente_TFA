const API_BASE_URL = 'http://localhost:8080';

/**
 * Helper para hacer peticiones a la API del backend.
 *
 * @param {string} path ruta relativa (ej: "/api/v1/publications")
 * @param {RequestInit} [options] opciones de fetch
 * @returns {Promise<any>} cuerpo JSON parseado (o texto plano / null según respuesta)
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

  // Leemos el cuerpo UNA sola vez y soportamos JSON o texto plano
  let rawText = '';
  let parsedBody = null;

  try {
    rawText = await response.text();
  } catch {
    rawText = '';
  }

  if (rawText) {
    try {
      parsedBody = JSON.parse(rawText);
    } catch {
      // No es JSON válido → nos quedamos con el texto tal cual
      parsedBody = rawText;
    }
  }

  if (!response.ok) {
    const errorBody = parsedBody || { message: response.statusText };

    const error = new Error(
      errorBody.detail || errorBody.message || 'Error en la API'
    );
    error.status = response.status;
    error.body = errorBody;
    throw error;
  }

  // 204 No Content → no hay cuerpo
  if (response.status === 204 || !rawText) {
    return null;
  }

  // Si parsedBody es null pero había texto, devolvemos ese texto,
  // si era JSON válido, devolvemos el objeto parseado.
  return parsedBody;
}
