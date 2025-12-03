import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getUserByUsernameRequest,
  getFollowersCountRequest,
  getFollowingCountRequest,
  followUserRequest,
  unfollowUserRequest
} from '../api/commands/users.js';
import { usePagination } from '../hooks/usePagination.js';
import GetProfile from '../components/profile/GetProfile.jsx';
import PaginationControls from '../components/ui/PaginationControls.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { apiFetch } from '../api/client.js';

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
  const { user, ensureValidAccessToken } = useAuth();
  const queryClient = useQueryClient();

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

  // 3) Contadores de seguidores / seguidos para este usuario (desde backend)
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

  const baseFollowersCount = followersCountData ?? 0;
  const followingCount = followingCountData ?? 0;

  // 4) Lista de seguidores para saber si el usuario logueado ya sigue a este perfil
  const { data: followersPage } = useQuery({
    queryKey: ['profileFollowersList', userId],
    enabled: !!userId && !!user,
    queryFn: async () => {
      const token = await ensureValidAccessToken();
      if (!token) {
        throw new Error('No hay token válido para obtener lista de seguidores');
      }
      return apiFetch(`/api/v1/users/${userId}/followers?page=0&size=50`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    }
  });

  const followersList = followersPage?.content ?? [];
  const followersTotal = followersPage?.totalElements ?? baseFollowersCount;

  const isFollowingFromData = !!followersList.some(
    (follower) => follower.userId === user?.userId
  );

  const isFollowing = isFollowingFromData;
  const followersCount = followersTotal;

  // 5) ¿Es el propio perfil del usuario logueado?
  const isOwnProfile =
    !!user && !!userId && user.userId === userId;

  // 6) Mutaciones para seguir / dejar de seguir, actualizando la caché de React Query
  const followMutation = useMutation({
    mutationFn: async () => {
      if (!user || !userId) return;
      const token = await ensureValidAccessToken();
      if (!token) {
        throw new Error('No hay token válido para seguir al usuario');
      }
      // followerId = user.userId, followedId = userId (del perfil visitado)
      return followUserRequest(user.userId, userId, token);
    },
    onSuccess: () => {
      // Actualizar cache de lista de seguidores
      queryClient.setQueryData(['profileFollowersList', userId], (old) => {
        if (!old) return old;

        const already = old.content?.some((f) => f.userId === user.userId);
        if (already) return old;

        return {
          ...old,
          totalElements: (old.totalElements ?? 0) + 1,
          content: [
            ...old.content,
            {
              userId: user.userId,
              username: user.username,
              email: user.email
            }
          ]
        };
      });

      // Actualizar cache del contador de seguidores
      queryClient.setQueryData(['followersCountProfile', userId], (oldCount) => {
        const base = oldCount ?? baseFollowersCount;
        return base + 1;
      });

      // (Opcional) invalidar por si quieres refetch real del backend
      queryClient.invalidateQueries({ queryKey: ['followersCountProfile', userId] });
      queryClient.invalidateQueries({ queryKey: ['profileFollowersList', userId] });
    }
  });

  const unfollowMutation = useMutation({
    mutationFn: async () => {
      if (!user || !userId) return;
      const token = await ensureValidAccessToken();
      if (!token) {
        throw new Error('No hay token válido para dejar de seguir al usuario');
      }
      return unfollowUserRequest(user.userId, userId, token);
    },
    onSuccess: () => {
      // Actualizar cache de lista de seguidores
      queryClient.setQueryData(['profileFollowersList', userId], (old) => {
        if (!old) return old;

        const newContent = old.content?.filter(
          (f) => f.userId !== user.userId
        ) ?? [];

        return {
          ...old,
          totalElements: Math.max((old.totalElements ?? 1) - 1, 0),
          content: newContent
        };
      });

      // Actualizar cache del contador de seguidores
      queryClient.setQueryData(['followersCountProfile', userId], (oldCount) => {
        const base = oldCount ?? baseFollowersCount;
        const next = base - 1;
        return next < 0 ? 0 : next;
      });

      // (Opcional) invalidar por si quieres refetch real del backend
      queryClient.invalidateQueries({ queryKey: ['followersCountProfile', userId] });
      queryClient.invalidateQueries({ queryKey: ['profileFollowersList', userId] });
    }
  });

  const isFollowActionLoading =
    followMutation.isPending || unfollowMutation.isPending;

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

      {/* Botón de seguir / dejar de seguir solo si NO es mi perfil y estoy logueado */}
      {user && !isOwnProfile && (
        <div className="profile-follow-actions">
          <button
            type="button"
            onClick={() =>
              isFollowing
                ? unfollowMutation.mutate()
                : followMutation.mutate()
            }
            disabled={isFollowActionLoading}
            className="profile-follow-button"
          >
            {isFollowActionLoading
              ? 'Actualizando...'
              : isFollowing
                ? 'Dejar de seguir'
                : 'Seguir'}
          </button>
        </div>
      )}

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
