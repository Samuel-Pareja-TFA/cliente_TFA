import React from 'react';
import PropTypes from 'prop-types';
import './PaginationControls.css';

/**
 * Controles de paginación (anterior / siguiente).
 *
 * @param {{page:number,totalPages:number,onPrev:()=>void,onNext:()=>void}} props
 */
function PaginationControls({ page, totalPages, onPrev, onNext }) {
  return (
    <div className="pagination-controls">
      <button
        type="button"
        onClick={onPrev}
        disabled={page === 0}
        className="pagination-button"
      >
        Anterior
      </button>
      <span className="pagination-info">
        Página {page + 1} de {totalPages || 1}
      </span>
      <button
        type="button"
        onClick={onNext}
        disabled={totalPages !== 0 && page >= totalPages - 1}
        className="pagination-button"
      >
        Siguiente
      </button>
    </div>
  );
}

PaginationControls.propTypes = {
  page: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  onPrev: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired
};

export default PaginationControls;