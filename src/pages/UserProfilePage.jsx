import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getUserByUsernameRequest } from '../api/commands/users.js';
import { usePagination } from '../hooks/usePagination.js';
import GetProfile from '../components/profile/GetProfile.jsx';
import PaginationControls from '../components/ui/PaginationControls.jsx';

/**
 * Página de perfil público de un usuario por su username.
 *
 * Ruta: "/profile/:name"
 *
 * @returns {JSX.Element}
 */
function UserProfilePage() {
  const { name } = useParams();

  // 1) Cargar los datos del usuario a partir del username
  const {
    data: profileUser,
    isLoading: isLoadingUser,
    isError: isErrorUser,
    error: userError
  } = useQuery({
    queryKey: ['profileUser', name],
    queryFn: () => getUserByUsernameRequest(name)
  });

  // 2) Cuando ya sabemos el userId, cargamos sus publicaciones paginadas
  const {
    page,
    items: publications,
    totalPages,
    isLoading: isLoadingPubs,
    isError: isErrorPubs,
    error: pubsError,
    nextPage,
    prevPage
  } = usePagination(
    profileUser ? `/api/v1/publications/user/${profileUser.userId}` : '',
    {
      enabled: !!profileUser // SOLO se ejecuta cuando profileUser ya existe
    }
  );

  if (isLoadingUser) {
    return <p>Cargando perfil...</p>;
  }

  if (isErrorUser) {
    return (
      <p className="error-message">
        {userError?.body?.message || userError?.message || 'Error al cargar el perfil'}
      </p>
    );
  }

  if (!profileUser) {
    return <p className="error-message">Usuario no encontrado.</p>;
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
      />

      {isLoadingPubs && <p>Cargando publicaciones...</p>}
      {isErrorPubs && (
        <p className="error-message">
          {pubsError?.body?.message || pubsError?.message || 'Error al cargar las publicaciones'}
        </p>
      )}

      {!isLoadingPubs && !isErrorPubs && (
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