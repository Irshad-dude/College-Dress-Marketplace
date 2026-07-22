import clsx from 'clsx';

export default function Pagination({ page, pages, onPageChange }) {
  if (pages <= 1) return null;

  const range = [];
  for (let i = 1; i <= pages; i++) range.push(i);

  return (
    <div className="flex items-center justify-center gap-1.5">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        ← Prev
      </button>
      {range.map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={clsx(
            'w-9 h-9 rounded-lg text-sm font-medium transition-all',
            p === page
              ? 'bg-amber-700 text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-100'
          )}
        >
          {p}
        </button>
      ))}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === pages}
        className="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
        Next →
      </button>
    </div>
  );
}
