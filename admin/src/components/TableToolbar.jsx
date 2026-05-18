export default function TableToolbar({
  searchPlaceholder = 'Filter...',
  searchValue = '',
  onSearchChange,
  actions,
}) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <label className="relative flex min-w-[220px] flex-1 items-center sm:max-w-xs">
        <svg
          viewBox="0 0 24 24"
          className="pointer-events-none absolute left-3 h-4 w-4 fill-gray-400"
          aria-hidden="true"
        >
          <path d="M10.5 4a6.5 6.5 0 1 0 4 11.6l4.4 4.5 1.4-1.4-4.4-4.5A6.5 6.5 0 0 0 10.5 4Zm0 2a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9Z" />
        </svg>
        <input
          className="field-input pl-9"
          onChange={onSearchChange}
          placeholder={searchPlaceholder}
          type="text"
          value={searchValue}
        />
      </label>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}
