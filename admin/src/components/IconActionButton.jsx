const icons = {
  view: (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-current">
      <path d="M12 5C7 5 2.7 8.1 1 12c1.7 3.9 6 7 11 7s9.3-3.1 11-7c-1.7-3.9-6-7-11-7Zm0 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8Z" />
    </svg>
  ),
  edit: (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-current">
      <path d="M4 20h4l10.5-10.5a1.4 1.4 0 0 0 0-2L16.5 5.5a1.4 1.4 0 0 0-2 0L4 16v4ZM14.5 7.5 16.5 9.5 18 8 16 6l-1.5 1.5Z" />
    </svg>
  ),
  delete: (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-current">
      <path d="M12 2a5 5 0 0 0-5 5v1H5v2h14V8h-2V7a5 5 0 0 0-5-5Zm-3 6V7a3 3 0 1 1 6 0v1H9Zm-4 4v10h14V12H5Z" />
    </svg>
  ),
};

const variantClasses = {
  view: 'text-gray-500 hover:bg-gray-50 hover:text-gray-700',
  edit: 'text-blue-500 hover:bg-blue-50',
  delete: 'text-red-500 hover:bg-red-50',
};

export default function IconActionButton({ variant = 'view', label, onClick, type = 'button' }) {
  return (
    <button
      aria-label={label}
      className={`flex h-9 w-9 items-center justify-center rounded-md border border-gray-200 bg-white transition-colors ${variantClasses[variant] || variantClasses.view}`}
      onClick={onClick}
      title={label}
      type={type}
    >
      {icons[variant]}
    </button>
  );
}
