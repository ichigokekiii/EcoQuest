export default function TableToolbar({
  searchPlaceholder = 'Filter...',
  searchValue = '',
  onSearchChange,
  actions,
}) {
  return (
    <div className="table-toolbar">
      <label className="table-toolbar-search">
        <svg viewBox="0 0 24 24" className="search-icon" aria-hidden="true">
          <path d="M10.5 4a6.5 6.5 0 1 0 4 11.6l4.4 4.5 1.4-1.4-4.4-4.5A6.5 6.5 0 0 0 10.5 4Zm0 2a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9Z" />
        </svg>
        <input
          onChange={onSearchChange}
          placeholder={searchPlaceholder}
          type="text"
          value={searchValue}
        />
      </label>
      {actions ? <div className="table-toolbar-actions">{actions}</div> : null}
    </div>
  );
}
