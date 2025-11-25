import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth.js';
import { usePagination } from '../hooks/usePagination.js';
import { getUserByUsernameRequest } from '../api/commands/users.js';
import PaginationControls from '../components/ui/PaginationControls.jsx';

/**
 * Página que muestra los seguidores (followers) de un usuario concreto.
 *
 * Ruta: "/profile/:name/followers"
 *
 * Flujo:
 *  1) Obtenemos el usuario por su username (param :name) -> userId.
 *  2) Usamos usePagination con:
 *       GET /api/v1/users/{userId}/followers
 *     para obtener la lista de seguidores.
 *
 * Requiere estar autenticado, ya que el backend protege /api/v1/users/**.
 *
 * @returns {JSX.Element}
 */
function UserFollowersPage() {
  const { name } = useParams();
  const { ensureValidAccessToken } = useAuth();

  // 1) Cargar datos del usuario dueño del perfil
  const {
    data: profileUser,
    isLoading: isLoadingUser,
    isError: isErrorUser,
    error: userError
  } = useQuery({
    queryKey: ['profileUserFollowers', name],
    queryFn: () => getUserByUsernameRequest(name)
  });

  const userId = profileUser?.userId ?? profileUser?.id ?? null;

  // 2) Paginación de seguidores de ese usuario
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
    userId ? `/api/v1/users/${userId}/followers` : '',
    {
      enabled: !!userId,
      getToken: ensureValidAccessToken
    }
  );

  if (isLoadingUser) {
    return (
      <div className="page-container">
        <h1>Seguidores de @{name}</h1>
        <p>Cargando usuario...</p>
      </div>
    );
  }

  if (isErrorUser || !profileUser) {
    return (
      <div className="page-container">
        <h1>Seguidores de @{name}</h1>
        <p className="error-message">
          {userError?.body?.message ||
            userError?.message ||
            'No se ha podido cargar el usuario.'}
        </p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h1>Seguidores de @{profileUser.username}</h1>

      {isLoading && <p>Cargando seguidores...</p>}

      {isError && (
        <p className="error-message">
          {error?.body?.message ||
            error?.message ||
            'Error al cargar seguidores'}
        </p>
      )}

      {!isLoading && !isError && (
        <>
          {followers.length === 0 && (
            <p>Este usuario todavía no tiene seguidores.</p>
          )}

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

export default UserFollowersPage;