// src/components/Pagination.tsx
type Props = {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
};

// src/components/Pagination.tsx
export function Pagination({ page, pageSize, total, onPageChange, onPageSizeChange }: Props) {
  const safeTotal = total || 0;
  const totalPages = Math.ceil(safeTotal / pageSize) || 1;

  // Se 'page' é 1, 'start' será 1. Se 'total' é 0, 'start' será 0.
  const start = safeTotal === 0 ? 0 : (page - 1) * pageSize + 1;
  
  // O 'end' não pode ultrapassar o 'total'
  const end = Math.min(page * pageSize, safeTotal);

  return (
    <div className="flex items-center justify-center gap-8 py-4 text-sm text-gray-600 w-full border-t border-gray-100">
      <div className="flex items-center gap-2">
        <span className="text-gray-500">Registros por página:</span>
        <select
          value={pageSize}
          onChange={(e) => {
            onPageSizeChange(Number(e.target.value));
            onPageChange(1);
          }}
          className="bg-transparent font-medium cursor-pointer outline-none border-none p-0"
        >
          {[5, 10, 20, 50].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="font-medium min-w-[100px] text-center">
        {start}–{end} de {safeTotal}
      </div>

      <div className="flex items-center gap-6">
        <button
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="p-1 hover:bg-gray-100 rounded-full disabled:opacity-20 transition"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="p-1 hover:bg-gray-100 rounded-full disabled:opacity-20 transition"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}