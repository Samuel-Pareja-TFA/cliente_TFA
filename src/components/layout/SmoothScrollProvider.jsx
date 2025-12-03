import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import Lenis from '@studio-freight/lenis';

/**
 * Proveedor de scroll suave usando Lenis.
 *
 * Envuelve a la aplicación y configura un bucle de animación
 * que delega el scroll en Lenis para que sea más fluido.
 *
 * @param {{ children: React.ReactNode }} props Componentes hijos a renderizar
 * @returns {JSX.Element}
 */
function SmoothScrollProvider({ children }) {
  useEffect(() => {
    const lenis = new Lenis({
      smooth: true,
      lerp: 0.1
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}

SmoothScrollProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export default SmoothScrollProvider;