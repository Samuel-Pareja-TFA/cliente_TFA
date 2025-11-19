import React from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { usePagination } from '../hooks/usePagination.js';
import CreatePublication from '../components/publication/CreatePublication.jsx';
import GetPublication from '../components/publication/GetPublication.jsx';
import PaginationControls from '../components/ui/PaginationControls.jsx';

/**
 * Página principal: timeline de los usuarios a los que sigues.
 *
 * Ruta: "/"
 *
 * @returns {JSX.Element}
 */
function HomePage() {
  const { user, ensureValidAccessToken } = useAuth();

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
    user ? `/api/v1/publications/timeline/${user.userId}` : '',
    {
      enabled: !!user,
      getToken: ensureValidAccessToken
    }
  );

  if (!user) {
    return <p>Debes iniciar sesión para ver el timeline.</p>;
  }

  return (
    <div className="page-container">
      <h1>Timeline</h1>
      <CreatePublication />

      {isLoading && <p>Cargando publicaciones...</p>}
      {isError && (
        <p className="error-message">
          {error.body?.message || error.message || 'Error al cargar publicaciones'}
        </p>
      )}

      {!isLoading && !isError && (
        <>
          {publications.length === 0 && <p>No hay publicaciones todavía.</p>}
          {publications.map((pub) => {
            const authorId =
              pub.user?.id ?? pub.userId ?? pub.authorId ?? null;
            const authorName =
              pub.user?.username ?? pub.username ?? pub.authorName ?? 'desconocido';

            return (
              <GetPublication
                key={pub.id}
                id={pub.id}
                authorId={authorId ?? 0}
                authorName={authorName}
                text={pub.text}
                createDate={pub.createDate}
              />
            );
          })}
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

export default HomePage;
