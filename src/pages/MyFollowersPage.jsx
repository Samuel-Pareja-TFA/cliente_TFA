import React from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { usePagination } from '../hooks/usePagination.js';
import PaginationControls from '../components/ui/PaginationControls.jsx';

/**
 * Página que muestra los seguidores (followers) del usuario logueado.
 *
 * Ruta: "/me/followers"
 *
 * Usa el endpoint:
 *   GET /api/v1/users/{userId}/followers
 * que devuelve un Page<UserDto>.
 */
function MyFollowersPage() {
  const { user, ensureValidAccessToken } = useAuth();

  const {
    page,
    items: followers,
    totalPages,
    isLoading,
    isError,
    error,
    nextPage,
    prevPage
  } = usePagination(
    user ? `/api/v1/users/${user.userId}/followers` : '',
    {
      enabled: !!user,
      getToken: ensureValidAccessToken
    }
  );

  if (!user) {
    return <p>Debes iniciar sesión para ver tus seguidores.</p>;
  }

  return (
    <div className="page-container">
      <h1>Mis seguidores</h1>

      {isLoading && <p>Cargando seguidores...</p>}

      {isError && (
        <p className="error-message">
          {error?.body?.message || error?.message || 'Error al cargar seguidores'}
        </p>
      )}

      {!isLoading && !isError && (
        <>
          {followers.length === 0 && <p>Aún no tienes seguidores.</p>}

          {followers.length > 0 && (
            <ul className="followers-list">
              {followers.map((follower) => (
                <li key={follower.userId} className="followers-list__item">
                  <span className="followers-list__username">
                    @{follower.username}
                  </span>
                  <span className="followers-list__email">
                    {follower.email}
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

export default MyFollowersPage;