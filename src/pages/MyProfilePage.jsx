import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth.js';
import { usePagination } from '../hooks/usePagination.js';
import { updateUsernameRequest, getFollowersCountRequest, getFollowingCountRequest } from '../api/commands/users.js';
import GetProfile from '../components/profile/GetProfile.jsx';
import PaginationControls from '../components/ui/PaginationControls.jsx';

/**
 * Página del perfil del usuario logueado.
 *
 * Permite ver publicaciones propias y cambiar el nombre de usuario.
 *
 * Ruta: "/me"
 *
 * @returns {JSX.Element}
 */
function MyProfilePage() {
  const { user, ensureValidAccessToken } = useAuth();
  const [newUsername, setNewUsername] = useState(user?.username ?? '');
  const [localUser, setLocalUser] = useState(user);

  // Número de seguidores del usuario logueado
  const { data: followersCountData } = useQuery({
    queryKey: ['followersCount', user?.userId],
    enabled: !!user,
    queryFn: async () => {
      const token = await ensureValidAccessToken();
      if (!token) {
        throw new Error('No hay token válido para obtener seguidores');
      }
      return getFollowersCountRequest(user.userId, token);
    }
  });

  // Número de seguidos del usuario logueado
  const { data: followingCountData } = useQuery({
    queryKey: ['followingCount', user?.userId],
    enabled: !!user,
    queryFn: async () => {
      const token = await ensureValidAccessToken();
      if (!token) {
        throw new Error('No hay token válido para obtener seguidos');
      }
      return getFollowingCountRequest(user.userId, token);
    }
  });

  const followersCount = followersCountData ?? 0;
  const followingCount = followingCountData ?? 0;

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
    user ? `/api/v1/publications/user/${user.userId}` : '',
    {
      enabled: !!user
      // este endpoint es público, no necesita token obligatorio
    }
  );

  const {
    mutateAsync,
    isPending,
    error: updateError
  } = useMutation({
    mutationFn: async (username) => {
      const token = await ensureValidAccessToken();
      if (!token) {
        throw new Error('No hay token válido para actualizar el username');
      }
      return updateUsernameRequest(user.userId, username, token);
    },
    onSuccess: (updatedUser) => {
      setLocalUser(updatedUser);
    }
  });

  if (!user) {
    return <p>Debes iniciar sesión para ver tu perfil.</p>;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!newUsername.trim() || newUsername === localUser.username) return;
    await mutateAsync(newUsername.trim());
  };

  return (
    <div className="page-container">
      <h1>Mi perfil</h1>

      {localUser && (
        <GetProfile
          username={localUser.username}
          email={localUser.email}
          description={localUser.description}
          createDate={localUser.createDate}
          publications={publications}
          // nuevo: contadores de seguidores/seguidos
          followersCount={followersCount}
          followingCount={followingCount}
        />
      )}

      <section className="profile-update-section">
        <h2>Cambiar nombre de usuario</h2>
        <form onSubmit={handleSubmit} className="profile-update-form">
          <input
            type="text"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            placeholder="Nuevo nombre de usuario"
          />
          <button type="submit" disabled={isPending}>
            {isPending ? 'Actualizando...' : 'Guardar'}
          </button>
        </form>
        {updateError && (
          <p className="error-message">
            {updateError.body?.message ||
              updateError.message ||
              'Error al actualizar el nombre de usuario'}
          </p>
        )}
      </section>

      {isLoading && <p>Cargando publicaciones...</p>}
      {isError && (
        <p className="error-message">
          {error.body?.message || error.message || 'Error al cargar publicaciones'}
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

export default MyProfilePage;
