import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../api/client.js';

/**
 * Hook para gestionar la paginación de un endpoint que devuelve un Page de Spring.
 *
 * @template T
 * @param {string} path Ruta base del endpoint (sin query de paginación, por ejemplo "/api/v1/publications")
 * @param {{
 *   enabled?: boolean,
 *   token?: string | null,
 *   getToken?: () => Promise<string | null>
 * }} [options] Opciones de la consulta (habilitada, token, función para obtener token)
 * @returns {{
 *   page: number,
 *   items: T[],
 *   totalPages: number,
 *   isLoading: boolean,
 *   isError: boolean,
 *   error: any,
 *   nextPage: () => void,
 *   prevPage: () => void,
 *   refetch: () => Promise<void>
 * }} Estado y controladores de la paginación
 */
export function usePagination(path, options = {}) {
  const { enabled = true, token = null, getToken } = options;
  const [page, setPage] = useState(0);

  const {
    data,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['pagination', path, page],
    queryFn: async () => {
      let finalToken = token;

      if (getToken) {
        finalToken = await getToken();
      }

      const headers =
        finalToken != null
          ? {
              Authorization: `Bearer ${finalToken}`
            }
          : undefined;

      return apiFetch(`${path}?page=${page}`, {
        headers
      });
    },
    enabled: !!path && enabled,
    keepPreviousData: true
  });

  const items = data?.content ?? [];
  const totalPages = data?.totalPages ?? 1;

  const nextPage = () => {
    setPage((prev) =>
      totalPages && prev < totalPages - 1 ? prev + 1 : prev
    );
  };

  const prevPage = () => {
    setPage((prev) => (prev > 0 ? prev - 1 : prev));
  };

  return {
    page,
    items,
    totalPages,
    isLoading,
    isError,
    error,
    nextPage,
    prevPage,
    refetch
  };
}

export default usePagination;
