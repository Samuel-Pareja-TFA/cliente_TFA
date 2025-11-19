import React from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { usePagination } from '../hooks/usePagination.js';
import GetPublication from '../components/publication/GetPublication.jsx';
import PaginationControls from '../components/ui/PaginationControls.jsx';

/**
 * Página que muestra todas las publicaciones de la red social.
 *
 * Ruta: "/all"
 *
 * @returns {JSX.Element}
 */
function AllPublicationsPage() {
  // Ahora también obtenemos ensureValidAccessToken del contexto
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
  } = usePagination('/api/v1/publications/', {
    enabled: !!user,
    // Enviamos siempre un access token válido (se refresca si hace falta)
    getToken: ensureValidAccessToken
  });

  if (!user) {
    return <p>Debes iniciar sesión para ver todas las publicaciones.</p>;
  }

  return (
    <div className="page-container">
      <h1>Todas las publicaciones</h1>

      {isLoading && <p>Cargando publicaciones...</p>}
      {isError && (
        <p className="error-message">
          {error?.body?.message || error?.message || 'Error al cargar publicaciones'}
        </p>
      )}

      {!isLoading && !isError && (
        <>
          {publications.length === 0 && <p>No hay publicaciones.</p>}
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

export default AllPublicationsPage;

