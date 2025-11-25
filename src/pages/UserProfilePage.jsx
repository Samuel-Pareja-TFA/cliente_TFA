import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getUserByUsernameRequest } from '../api/commands/users.js';
import { usePagination } from '../hooks/usePagination.js';
import GetProfile from '../components/profile/GetProfile.jsx';
import PaginationControls from '../components/ui/PaginationControls.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { getFollowersCountRequest, getFollowingCountRequest } from '../api/commands/users.js';

/**
 * Página de perfil público de un usuario por su username.
 *
 * Ruta: "/profile/:name"
 *
 * Muestra los datos del usuario (username, email, descripción, fecha)
 * y todas sus publicaciones, ordenadas de más nuevas a más antiguas.
 *
 * Además, muestra el número de seguidores y seguidos, igual que en "/me".
 *
 * @returns {JSX.Element}
 */
function UserProfilePage() {
  const { name } = useParams();
  const { ensureValidAccessToken } = useAuth();

  // 1) Datos del usuario por username
  const {
    data: profileUser,
    isLoading: isLoadingUser,
    isError: isErrorUser,
    error: userError
  } = useQuery({
    queryKey: ['profileUser', name],
    queryFn: () => getUserByUsernameRequest(name)
  });

  // 2) Paginación de publicaciones de ese usuario
  const userId = profileUser?.userId ?? profileUser?.id ?? null;

  const {
    page,
    items: publications,
    totalPages,
    isLoading,
    isError,
    error,
    nextPage,
    prevPage
  } = usePagination(
    userId ? `/api/v1/publications/user/${userId}` : '',
    {
      enabled: !!userId
    }
  );

  // 3) Contadores de seguidores / seguidos para este usuario
  const { data: followersCountData } = useQuery({
    queryKey: ['followersCountProfile', userId],
    enabled: !!userId,
    queryFn: async () => {
      const token = await ensureValidAccessToken();
      if (!token) {
        throw new Error('No hay token válido para obtener seguidores');
      }
      return getFollowersCountRequest(userId, token);
    }
  });

  const { data: followingCountData } = useQuery({
    queryKey: ['followingCountProfile', userId],
    enabled: !!userId,
    queryFn: async () => {
      const token = await ensureValidAccessToken();
      if (!token) {
        throw new Error('No hay token válido para obtener seguidos');
      }
      return getFollowingCountRequest(userId, token);
    }
  });

  const followersCount = followersCountData ?? 0;
  const followingCount = followingCountData ?? 0;

  if (isLoadingUser) {
    return (
      <div className="page-container">
        <h1>Perfil de usuario</h1>
        <p>Cargando usuario...</p>
      </div>
    );
  }

  if (isErrorUser || !profileUser) {
    return (
      <div className="page-container">
        <h1>Perfil de usuario</h1>
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
      <h1>Perfil de @{profileUser.username}</h1>

      <GetProfile
        username={profileUser.username}
        email={profileUser.email}
        description={profileUser.description}
        createDate={profileUser.createDate}
        publications={publications}
        followersCount={followersCount}
        followingCount={followingCount}
        followersLinkTo={`/profile/${profileUser.username}/followers`}
        followingLinkTo={`/profile/${profileUser.username}/following`}
      />

      {isLoading && <p>Cargando publicaciones...</p>}
      {isError && (
        <p className="error-message">
          {error?.body?.message ||
            error?.message ||
            'Error al cargar publicaciones del usuario'}
        </p>
      )}

      {!isLoading && !isError && (
        <PaginationControls
          page={page}
          totalPages={totalPages}
          onPrev={prevPage}
          onNext={nextPage}
        />
      )}
    </div>
  );
}

export default UserProfilePage;