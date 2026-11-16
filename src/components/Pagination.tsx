interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  onChange(page: number): void;
}

export function Pagination({ page, totalPages, total, onChange }: PaginationProps) {
  if (totalPages <= 1) {
    return <p className="pagination__total">{total === 1 ? '1 registro' : `${total} registros`}</p>;
  }

  return (
    <nav className="pagination" aria-label="Paginação">
      <button type="button" className="button button--secondary" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        Anterior
      </button>
      <span>
        Página {page} de {totalPages} · {total} registros
      </span>
      <button
        type="button"
        className="button button--secondary"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
      >
        Próxima
      </button>
    </nav>
  );
}
