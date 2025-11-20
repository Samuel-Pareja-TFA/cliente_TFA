import React from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { usePagination } from '../hooks/usePagination.js';
import PaginationControls from '../components/ui/PaginationControls.jsx';

/**
 * Página que muestra los usuarios a los que sigue
 * el usuario logueado (following).
 *
 * Ruta: "/me/following"
 *
 * Usa el endpoint:
 *   GET /api/v1/users/{userId}/following
 * que devuelve un Page<UserDto>.
 */
function MyFollowingPage() {
  const { user, ensureValidAccessToken } = useAuth();

  if (!user) {
    return <p>Debes iniciar sesión para ver a quién sigues.</p>;
  }

  const {
    page,
    items: following,
    totalPages,
    isLoading,
    isError,
    error,
    nextPage,
    prevPage
  } = usePagination(`/api/v1/users/${user.userId}/following`, {
    enabled: !!user,
    getToken: ensureValidAccessToken
  });

  return (
    <div className="page-container">
      <h1>Usuarios a los que sigo</h1>

      {isLoading && <p>Cargando usuarios...</p>}

      {isError && (
        <p className="error-message">
          {error?.body?.message || error?.message || 'Error al cargar usuarios seguidos'}
        </p>
      )}

      {!isLoading && !isError && (
        <>
          {following.length === 0 && <p>Aún no sigues a ningún usuario.</p>}

          {following.length > 0 && (
            <ul className="followers-list">
              {following.map((u) => (
                <li key={u.userId} className="followers-list__item">
                  <span className="followers-list__username">
                    @{u.username}
                  </span>
                  <span className="followers-list__email">
                    {u.email}
                  </span>
                </li>
              ))}
            </ul>
          )}

          <PaginationControls
            page={page}
            totalPages={totalPages}
            onPrev={prevPage}
            onNext={nextPage}
          />
        </>
      )}
    </div>
  );
}

export default MyFollowingPage;