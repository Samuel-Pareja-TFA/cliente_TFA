import React from 'react';
import PropTypes from 'prop-types';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

import HomePage from '../pages/HomePage.jsx';
import AllPublicationsPage from '../pages/AllPublicationsPage.jsx';
import MyProfilePage from '../pages/MyProfilePage.jsx';
import UserProfilePage from '../pages/UserProfilePage.jsx';
import LoginPage from '../pages/Auth/LoginPage.jsx';
import RegisterPage from '../pages/Auth/RegisterPage.jsx';

/**
 * Ruta protegida: solo permite el acceso si hay usuario autenticado.
 *
 * @param {{ children: React.ReactNode }} props
 * @returns {JSX.Element}
 */
function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <p>Cargando autenticación...</p>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

PrivateRoute.propTypes = {
  children: PropTypes.node.isRequired
};

/**
 * Definición de las rutas principales de la aplicación.
 *
 * @returns {JSX.Element}
 */
export function AppRoutes() {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Rutas privadas */}
      <Route
        path="/"
        element={
          <PrivateRoute>
            <HomePage />
          </PrivateRoute>
        }
      />
      <Route
        path="/all"
        element={
          <PrivateRoute>
            <AllPublicationsPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/me"
        element={
          <PrivateRoute>
            <MyProfilePage />
          </PrivateRoute>
        }
      />
      <Route
        path="/profile/:name"
        element={
          <PrivateRoute>
            <UserProfilePage />
          </PrivateRoute>
        }
      />

      {/* Cualquier ruta desconocida redirige a la raíz */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;