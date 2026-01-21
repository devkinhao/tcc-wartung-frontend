// src/components/Pagination.tsx
type Props = {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
};

export function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
}: Props) {
  const totalPages = Math.ceil(total / pageSize);
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div className="flex items-center justify-between text-sm text-text-secondary">
      {/* Quantidade */}
      <span>
        Mostrando <strong>{start}</strong>–<strong>{end}</strong> de{" "}
        <strong>{total}</strong> registros
      </span>

      {/* Controles */}
      <div className="flex items-center gap-4">
        <select
          value={pageSize}
          onChange={(e) => {
            onPageSizeChange(Number(e.target.value));
            onPageChange(1);
          }}
          className="border rounded px-2 py-1 text-sm"
        >
          {[5, 10, 20, 50].map((s) => (
            <option key={s} value={s}>
              {s} / página
            </option>
          ))}
        </select>

        <button
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Anterior
        </button>

        <span>
          Página {page} de {totalPages || 1}
        </span>

        <button
          disabled={page === totalPages}
          onClick={() => onPageChange(page + 1)}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Próxima
        </button>
      </div>
    </div>
  );
}