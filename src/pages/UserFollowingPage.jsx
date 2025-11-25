import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth.js';
import { usePagination } from '../hooks/usePagination.js';
import { getUserByUsernameRequest } from '../api/commands/users.js';
import PaginationControls from '../components/ui/PaginationControls.jsx';

/**
 * Página que muestra los usuarios a los que sigue un usuario concreto.
 *
 * Ruta: "/profile/:name/following"
 *
 * Flujo:
 *  1) Obtenemos el usuario por su username (param :name) -> userId.
 *  2) Usamos usePagination con:
 *       GET /api/v1/users/{userId}/following
 *     para obtener la lista de usuarios seguidos.
 *
 * Requiere estar autenticado.
 *
 * @returns {JSX.Element}
 */
function UserFollowingPage() {
  const { name } = useParams();
  const { ensureValidAccessToken } = useAuth();

  // 1) Cargar datos del usuario dueño del perfil
  const {
    data: profileUser,
    isLoading: isLoadingUser,
    isError: isErrorUser,
    error: userError
  } = useQuery({
    queryKey: ['profileUserFollowing', name],
    queryFn: () => getUserByUsernameRequest(name)
  });

  const userId = profileUser?.userId ?? profileUser?.id ?? null;

  // 2) Paginación de usuarios a los que sigue
  const {
    page,
    items: following,
    totalPages,
    isLoading,
    isError,
    error,
    nextPage,
    prevPage
  } = usePagination(
    userId ? `/api/v1/users/${userId}/following` : '',
    {
      enabled: !!userId,
      getToken: ensureValidAccessToken
    }
  );

  if (isLoadingUser) {
    return (
      <div className="page-container">
        <h1>Usuarios seguidos por @{name}</h1>
        <p>Cargando usuario...</p>
      </div>
    );
  }

  if (isErrorUser || !profileUser) {
    return (
      <div className="page-container">
        <h1>Usuarios seguidos por @{name}</h1>
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
      <h1>Usuarios seguidos por @{profileUser.username}</h1>

      {isLoading && <p>Cargando usuarios seguidos...</p>}

      {isError && (
        <p className="error-message">
          {error?.body?.message ||
            error?.message ||
            'Error al cargar usuarios seguidos'}
        </p>
      )}

      {!isLoading && !isError && (
        <>
          {following.length === 0 && (
            <p>Este usuario todavía no sigue a nadie.</p>
          )}

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

export default UserFollowingPage;