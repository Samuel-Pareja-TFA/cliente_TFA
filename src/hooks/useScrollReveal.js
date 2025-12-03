import { useEffect, useRef } from 'react';

/**
 * Hook para animar un elemento cuando entra en el viewport al hacer scroll.
 *
 * Usa IntersectionObserver para añadir la clase "is-visible"
 * a un elemento cuando aparece en pantalla, permitiendo
 * aplicar animaciones con CSS.
 *
 * @returns {React.RefObject<HTMLElement>} ref para asignar al elemento a animar
 */
export function useScrollReveal() {
  const ref = useRef(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            element.classList.add('is-visible');
            // Si solo queremos que se anime una vez, podemos dejar de observar
            observer.unobserve(element);
          }
        });
      },
      {
        threshold: 0.1
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  return ref;
}