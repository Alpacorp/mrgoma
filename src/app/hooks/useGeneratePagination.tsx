export const useGenerateFixedPagination = (
  currentPage: number,
  totalPages: number,
  maxVisiblePages: number
) => {
  let pages: (number | string)[] = [];

  if (totalPages <= maxVisiblePages) {
    // Mostrar todas las páginas si el total es menor o igual al máximo visible
    pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  } else {
    pages = generatePages(currentPage, totalPages, maxVisiblePages);
  }

  // Asegurarse de que no hay puntos suspensivos innecesarios
  if (pages[1] === '...' && pages[0] === 1 && pages[2] === 2) {
    pages.splice(1, 1); // Elimina el punto suspensivo innecesario
  }

  return pages;
};

function generatePages(
  currentPage: number,
  totalPages: number,
  maxVisiblePages: number
): (number | string)[] {
  const half = Math.floor(maxVisiblePages / 2);
  let start = Math.max(currentPage - half, 1);
  let end = start + maxVisiblePages - 1;

  // Ajustar si el final supera el total de páginas
  if (end > totalPages) {
    end = totalPages;
    start = end - maxVisiblePages + 1;
    if (start < 1) start = 1;
  }

  const pages: (number | string)[] = [];

  // Añadir las páginas al inicio
  if (start > 1) {
    pages.push(1);
    if (start > 2) {
      pages.push('...');
    }
  }

  // Añadir las páginas visibles
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  // Añadir las páginas al final
  if (end < totalPages) {
    if (end < totalPages - 1) {
      pages.push('...');
    }
    pages.push(totalPages);
  }

  return pages;
}
