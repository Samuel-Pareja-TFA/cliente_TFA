import React from 'react';
import PropTypes from 'prop-types';
import GetPublication from '../publication/GetPublication.jsx';
import './GetProfile.css';

/**
 * Card de perfil de usuario con sus publicaciones.
 *
 * @param {{
 *  username: string,
 *  email: string,
 *  description?: string,
 *  createDate: string,
 *  publications: any[]
 * }} props Datos del usuario y sus publicaciones
 * @returns {JSX.Element}
 */
function GetProfile({
  username,
  email,
  description,
  createDate,
  publications
}) {
  // Normalizamos las publicaciones para que funcionen tanto si vienen con
  // pub.user.id / pub.user.username como con pub.userId / pub.username / pub.authorName
  const normalizedPublications = (publications || []).map((pub) => {
    const authorId =
      pub.user?.id ?? pub.userId ?? pub.authorId ?? null;
    const authorName =
      pub.user?.username ??
      pub.username ??
      pub.authorName ??
      username; // como último recurso, el username del perfil

    return {
      id: pub.id,
      authorId,
      authorName,
      text: pub.text,
      createDate: pub.createDate
    };
  });

  // Ordenamos de más reciente a más antiguo, como pide el profe
  const sortedPublications = [...normalizedPublications].sort(
    (a, b) => new Date(b.createDate) - new Date(a.createDate)
  );

  return (
    <div className="profile-card">
      <header className="profile-header">
        <h2>@{username}</h2>
        <p className="profile-email">{email}</p>
        {description && <p className="profile-description">{description}</p>}
        <p className="profile-date">
          Miembro desde:{' '}
          {new Date(createDate).toLocaleDateString()}
        </p>
      </header>

      <section className="profile-publications">
        <h3>Publicaciones</h3>
        {sortedPublications.length === 0 && (
          <p className="profile-no-publications">
            Este usuario todavía no ha publicado nada.
          </p>
        )}

        {sortedPublications.map((pub) => (
          <GetPublication
            key={pub.id}
            id={pub.id}
            authorId={pub.authorId ?? 0}
            authorName={pub.authorName ?? 'desconocido'}
            text={pub.text}
            createDate={pub.createDate}
          />
        ))}
      </section>
    </div>
  );
}

GetProfile.propTypes = {
  username: PropTypes.string.isRequired,
  email: PropTypes.string.isRequired,
  description: PropTypes.string,
  createDate: PropTypes.string.isRequired,
  publications: PropTypes.arrayOf(PropTypes.any).isRequired
};

GetProfile.defaultProps = {
  description: ''
};

export default GetProfile;
