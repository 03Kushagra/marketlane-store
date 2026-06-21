import { ChevronLeft, ChevronRight } from "lucide-react";

type PaginationControlsProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

type PaginationItem = number | "ellipsis";

function getVisiblePages(currentPage: number, totalPages: number) {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage >= totalPages - 2) {
    const trailingPages = Array.from(
      { length: Math.min(3, currentPage - 1) },
      (_, index) => currentPage - Math.min(2, currentPage - 2) + index,
    );

    return [1, "ellipsis", ...trailingPages] satisfies PaginationItem[];
  }

  const forwardPages = Array.from(
    { length: Math.min(3, totalPages - currentPage + 1) },
    (_, index) => currentPage + index,
  );

  return [...forwardPages, "ellipsis", totalPages] satisfies PaginationItem[];
}

export function PaginationControls({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationControlsProps) {
  if (totalPages <= 1) {
    return null;
  }

  const pages = getVisiblePages(currentPage, totalPages);

  return (
    <nav className="pagination" aria-label="Product pagination">
      <button
        className="pagination__arrow"
        type="button"
        aria-label="Previous page"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <ChevronLeft aria-hidden="true" size={18} strokeWidth={2.4} />
      </button>
      <div className="pagination__pages">
        {pages.map((page, index) =>
          page === "ellipsis" ? (
            <span
              className="pagination__ellipsis"
              key={`ellipsis-${index}`}
              aria-hidden="true"
            >
              ...
            </span>
          ) : (
            <button
              className={page === currentPage ? "is-active" : ""}
              type="button"
              key={page}
              aria-current={page === currentPage ? "page" : undefined}
              onClick={() => onPageChange(page)}
            >
              {page}
            </button>
          ),
        )}
      </div>
      <button
        className="pagination__arrow"
        type="button"
        aria-label="Next page"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <ChevronRight aria-hidden="true" size={18} strokeWidth={2.4} />
      </button>
    </nav>
  );
}
