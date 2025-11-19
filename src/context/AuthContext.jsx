import React, { createContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  loginRequest,
  registerRequest,
  fetchMe,
  refreshRequest
} from '../api/commands/auth.js';

/**
 * @typedef {Object} AuthContextValue
 * @property {Object|null} user Usuario autenticado o null si no hay sesión
 * @property {string|null} accessToken JWT de acceso o null
 * @property {string|null} refreshToken JWT de refresco o null
 * @property {boolean} loading Indica si se está comprobando o cambiando el estado de auth
 * @property {string|null} error Mensaje de error de la última acción de auth (login/registro)
 * @property {(credentials: {username:string, password:string}) => Promise<void>} login
 * @property {(data: {username:string, email:string, password:string, description?:string}) => Promise<void>} register
 * @property {() => void} logout
 * @property {() => Promise<string|null>} ensureValidAccessToken Devuelve un access token válido, refrescándolo si hace falta
 */

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext(/** @type {AuthContextValue} */ (null));

/**
 * Proveedor de contexto de autenticación.
 *
 * Se encarga de:
 * - Guardar y recuperar tokens de localStorage
 * - Obtener el usuario actual con /api/v1/auth/me
 * - Refrescar el access token cuando caduca usando el refresh token
 * - Exponer login, register, logout y ensureValidAccessToken
 *
 * @param {{children: React.ReactNode}} props
 * @returns {JSX.Element}
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [accessTokenExpiresAt, setAccessTokenExpiresAt] = useState(null); // timestamp en ms
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Lee tokens de localStorage en el primer render e intenta cargar el usuario.
   */
  useEffect(() => {
    const stored = localStorage.getItem('authTokens');
    if (!stored) {
      setLoading(false);
      return;
    }

    try {
      const parsed = JSON.parse(stored);
      if (!parsed.accessToken) {
        setLoading(false);
        return;
      }

      setAccessToken(parsed.accessToken);
      setRefreshToken(parsed.refreshToken ?? null);
      setAccessTokenExpiresAt(parsed.accessTokenExpiresAt ?? null);

      fetchMe(parsed.accessToken)
        .then((me) => {
          setUser(me);
        })
        .catch(() => {
          // Token inválido o caducado: borramos todo
          localStorage.removeItem('authTokens');
          setUser(null);
          setAccessToken(null);
          setRefreshToken(null);
          setAccessTokenExpiresAt(null);
        })
        .finally(() => {
          setLoading(false);
        });
    } catch {
      localStorage.removeItem('authTokens');
      setLoading(false);
    }
  }, []);

  /**
   * Guarda tokens + expiración en estado y en localStorage
   * y carga los datos del usuario con /me.
   *
   * @param {import('../api/commands/auth.js').AuthResponseDTO} authResponse
   */
  const handleAuthSuccess = async (authResponse) => {
    const access = authResponse.access_token;
    const refresh = authResponse.refresh_token ?? null;
    const expiresInSeconds = authResponse.expires_in ?? 0;

    // Guardamos el instante en el que expira (un poco antes por seguridad)
    const expiresAt =
      Date.now() + expiresInSeconds * 1000 - 5000; // -5s de margen

    setAccessToken(access);
    setRefreshToken(refresh);
    setAccessTokenExpiresAt(expiresAt);

    localStorage.setItem(
      'authTokens',
      JSON.stringify({
        accessToken: access,
        refreshToken: refresh,
        accessTokenExpiresAt: expiresAt
      })
    );

    const me = await fetchMe(access);
    setUser(me);
  };

  /**
   * Asegura que tenemos un access token válido.
   * Si ha caducado, intenta refrescarlo con el refresh token.
   *
   * @returns {Promise<string|null>} access token válido o null si no se puede obtener
   */
  const ensureValidAccessToken = async () => {
    if (!accessToken || !refreshToken) {
      return null;
    }

    // Si aún no ha expirado, usamos el actual
    if (
      accessTokenExpiresAt &&
      Date.now() < accessTokenExpiresAt
    ) {
      return accessToken;
    }

    // Si ha expirado, intentamos refrescar
    try {
      const authResponse = await refreshRequest(refreshToken);
      await handleAuthSuccess(authResponse);
      return authResponse.access_token;
    } catch (err) {
      console.error('Error al refrescar el token:', err);
      // Si falla el refresh, cerramos sesión
      setUser(null);
      setAccessToken(null);
      setRefreshToken(null);
      setAccessTokenExpiresAt(null);
      localStorage.removeItem('authTokens');
      throw err;
    }
  };

  /**
   * Inicia sesión con username + password.
   *
   * @param {{username:string,password:string}} credentials
   */
  const login = async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      const authResponse = await loginRequest(credentials);
      await handleAuthSuccess(authResponse);
    } catch (err) {
      console.error(err);
      setUser(null);
      setAccessToken(null);
      setRefreshToken(null);
      setAccessTokenExpiresAt(null);
      localStorage.removeItem('authTokens');

      setError(
        err.body?.message || err.message || 'Error al iniciar sesión'
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Registra un nuevo usuario.
   *
   * @param {{username:string,password:string,email:string,description?:string}} data
   */
  const register = async (data) => {
    setLoading(true);
    setError(null);
    try {
      const authResponse = await registerRequest(data);
      await handleAuthSuccess(authResponse);
    } catch (err) {
      console.error(err);
      setUser(null);
      setAccessToken(null);
      setRefreshToken(null);
      setAccessTokenExpiresAt(null);
      localStorage.removeItem('authTokens');

      setError(
        err.body?.message || err.message || 'Error al registrarse'
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cierra la sesión actual.
   */
  const logout = () => {
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
    setAccessTokenExpiresAt(null);
    setError(null);
    localStorage.removeItem('authTokens');
  };

  const value = {
    user,
    accessToken,
    refreshToken,
    loading,
    error,
    login,
    register,
    logout,
    ensureValidAccessToken
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired
};
