export default function EmptyState({ icon, title, message, actionLabel, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-4">
      {icon && <div className="text-6xl mb-4">{icon}</div>}
      <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
      {message && <p className="text-gray-500 text-sm mb-6 max-w-sm">{message}</p>}
      {actionLabel && onAction && (
        <button onClick={onAction} className="btn-primary">
          {actionLabel}
        </button>
      )}
    </div>
  );
}
