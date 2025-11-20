import React from 'react';
import PropTypes from 'prop-types';
import GetPublication from '../publication/GetPublication.jsx';
import './GetProfile.css';

/**
 * Normaliza y ordena las publicaciones de un usuario.
 *
 * @param {Array<any>} publications Lista de publicaciones en diversos formatos
 * @returns {Array<{
 *  id: number,
 *  userId: number,
 *  username: string,
 *  text: string,
 *  createDate: string
 * }>}
 */
function normalizePublications(publications) {
  if (!Array.isArray(publications)) return [];

  return publications
    .map((pub) => {
      const id = pub.id ?? pub.publicationId ?? 0;
      const userId =
        pub.user?.id ?? pub.userId ?? pub.authorId ?? 0;
      const username =
        pub.user?.username ?? pub.username ?? pub.authorName ?? 'desconocido';
      const text = pub.text ?? pub.content ?? '';
      const createDate = pub.createDate ?? pub.createdAt ?? '';

      return { id, userId, username, text, createDate };
    })
    .filter((p) => p.id !== 0)
    .sort((a, b) => {
      const da = new Date(a.createDate).getTime();
      const db = new Date(b.createDate).getTime();
      return db - da;
    });
}

/**
 * Card de perfil de usuario con sus publicaciones.
 *
 * @param {{
 *  username: string,
 *  email: string,
 *  description?: string,
 *  createDate: string,
 *  publications: any[],
 *  followersCount?: number,
 *  followingCount?: number
 * }} props
 * @returns {JSX.Element}
 */
function GetProfile({
  username,
  email,
  description,
  createDate,
  publications,
  followersCount,
  followingCount
}) {
  const normalizedPublications = normalizePublications(publications);

    return (
    <article className="profile-card">
      <header className="profile-card__header">
        <h2>@{username}</h2>
        <p className="profile-card__email">{email}</p>

        {/* Bloque de seguidores/seguidos en columnas:
             número arriba, texto abajo */}
        {typeof followersCount === 'number' &&
          typeof followingCount === 'number' && (
            <div className="profile-card__stats">
              <div className="profile-card__stat">
                <span className="profile-card__stat-number">
                  {followersCount}
                </span>
                <span className="profile-card__stat-label">
                  seguidores
                </span>
              </div>
              <div className="profile-card__stat">
                <span className="profile-card__stat-number">
                  {followingCount}
                </span>
                <span className="profile-card__stat-label">
                  seguidos
                </span>
              </div>
            </div>
          )}
      </header>

      {description && (
        <p className="profile-card__description">{description}</p>
      )}

      {createDate && (
        <p className="profile-card__date">
          Miembro desde: {new Date(createDate).toLocaleDateString()}
        </p>
      )}

      <section className="profile-card__publications">
        <h3>Publicaciones</h3>
        {normalizedPublications.length === 0 ? (
          <p>Este usuario todavía no tiene publicaciones.</p>
        ) : (
          <div className="publications-list">
            {normalizedPublications.map((pub) => (
              <GetPublication
                key={pub.id}
                id={pub.id}
                authorId={pub.userId}
                authorName={pub.username}
                text={pub.text}
                createDate={pub.createDate}
              />
            ))}
          </div>
        )}
      </section>
    </article>
  );
}

GetProfile.propTypes = {
  username: PropTypes.string.isRequired,
  email: PropTypes.string.isRequired,
  description: PropTypes.string,
  createDate: PropTypes.string.isRequired,
  publications: PropTypes.arrayOf(PropTypes.any).isRequired,
  followersCount: PropTypes.number,
  followingCount: PropTypes.number
};

export default GetProfile;
