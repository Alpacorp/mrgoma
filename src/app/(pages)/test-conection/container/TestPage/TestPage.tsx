'use client';

import { useCallback, useEffect, useState } from 'react';
import type { DocumentRecord } from '@/app/api/tires/route';
import { TiresData } from '@/app/interfaces/tires';

import { useGenerateFixedPagination } from '@/app/hooks/useGeneratePagination';
import CardTest from '@/app/ui/components/CardTest/CardTest';

export default function TestPage() {
  const [records, setRecords] = useState<DocumentRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const totalRecords = 200; // Asumimos que tienes este valor disponible
  const totalPages = Math.ceil(totalRecords / pageSize);
  const maxVisiblePages = 10;

  const getTires = useCallback(
    async (page: number) => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/tires?page=${page}&pageSize=${pageSize}`
        );
        const data = await response.json();
        setRecords(data);
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false); // Desactivar el loading después de la solicitud
      }
    },
    [pageSize]
  );

  useEffect(() => {
    getTires(page);
  }, [getTires, page]);

  const handleNextPage = () => {
    setPage((prevPage) => prevPage + 1);
  };

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage((prevPage) => prevPage - 1);
    }
  };

  const handlePageSizeChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newPageSize = parseInt(event.target.value, 10);

    // Calcular la nueva página basada en la posición actual
    const currentRecordIndex = (page - 1) * pageSize; // Índice del primer registro en la página actual
    const newPage = Math.floor(currentRecordIndex / newPageSize) + 1;

    setPageSize(newPageSize);
    setPage(newPage); // Establecer la nueva página calculada
  };

  const handlePageClick = (pageNumber: number) => {
    setPage(pageNumber);
  };

  const handleFirstPage = () => {
    setPage(1);
  };

  const handleLastPage = () => {
    setPage(totalPages);
  };

  const pagination = useGenerateFixedPagination(
    page,
    totalPages,
    maxVisiblePages
  );

  const availablePageSizes = [10, 20, 50].filter(
    (size) => size <= totalRecords
  );

  return (
    <main className="flex min-h-screen flex-col items-center xl:p-24 lg:p-24 md:p-2 sm:p-2 bg-black">
      <h1 className="text-4xl">Tires</h1>
      {error ? (
        <div className="text-red-500">Error: {error}</div>
      ) : (
        <div className="mt-6 overflow-auto w-full">
          <h3 className="text-2xl mb-3">Tires Register:</h3>
          <div className="relative">
            <ul className="text-white flex flex-wrap">
              {records.map((record: TiresData) => (
                <li key={record.TireId} className="list-none">
                  <CardTest {...record} />
                </li>
              ))}
            </ul>
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black">
                <div className="loader">Loading...</div>
              </div>
            )}
          </div>
          <div className="mt-4 flex justify-center gap-1">
            <div className="flex gap-1">
              <button
                onClick={handleFirstPage}
                disabled={page === 1} // Deshabilitar si ya estás en la primera página
                className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 disabled:bg-gray-400"
              >
                &lt;&lt;
              </button>
              <button
                onClick={handlePreviousPage}
                disabled={page === 1} // Deshabilitar el botón si estás en la primera página
                className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 disabled:bg-gray-400"
              >
                &lt;
              </button>
            </div>
            {pagination.map((pageNumber, index) =>
              typeof pageNumber === 'number' ? (
                <button
                  key={index}
                  onClick={() => handlePageClick(pageNumber)}
                  className={`px-3 py-1 mx-1 rounded ${
                    pageNumber === page
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-white hover:bg-gray-600'
                  }`}
                >
                  {pageNumber}
                </button>
              ) : (
                <span key={index} className="px-3 py-1 mx-1 text-gray-500">
                  {pageNumber}
                </span>
              )
            )}
            <div className="flex gap-1">
              <button
                onClick={handleNextPage}
                className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 disabled:bg-gray-400"
                disabled={page === totalPages} // Deshabilitar si ya estás en la última página
              >
                &gt;
              </button>
              <button
                onClick={handleLastPage}
                disabled={page === totalPages} // Deshabilitarsiyaestásenlaúltimapágina"
                className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 disabled:bg-gray-400"
              >
                &gt;&gt;
              </button>
            </div>
          </div>
          {totalRecords >= 10 && (
            <div className="mt-4">
              <label htmlFor="pageSize" className="mr-2">
                Page Size:
              </label>
              <select
                id="pageSize"
                value={pageSize}
                onChange={handlePageSizeChange}
                className="px-4 py-2 bg-gray-700 rounded"
              >
                {availablePageSizes.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
