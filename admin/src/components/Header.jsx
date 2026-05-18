import { Search, Bell } from "lucide-react";

export default function Header({
  title,
  subtitle,
  searchPlaceholder,
  searchValue = '',
  onSearchChange,
  actions,
}) {
  const searchInput = onSearchChange ? (
    <label className="relative flex min-w-[240px] items-center">
      <Search className="pointer-events-none absolute left-3 h-4 w-4 text-gray-400" />
      <input
        className="w-full rounded-full border border-gray-200 bg-gray-50 py-2 pl-9 pr-4 text-sm outline-none transition-colors focus:border-[#22c55e] focus:bg-white"
        onChange={onSearchChange}
        placeholder={searchPlaceholder || 'Search anything...'}
        type="text"
        value={searchValue}
      />
    </label>
  ) : null;

  return (
    <header className="mb-8 flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-[1.75rem] font-bold tracking-tight text-gray-900">{title}</h1>
          {subtitle ? <p className="mt-1 text-sm text-gray-500 font-medium">{subtitle}</p> : null}
        </div>

        <div className="flex flex-wrap items-center justify-end gap-4">
          {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
          {searchInput}
          <div className="flex items-center gap-3 pl-2 border-l border-gray-200">
            <button
              type="button"
              className="relative flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition hover:bg-gray-50 hover:text-gray-900"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute right-1 top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow-sm">
                5
              </span>
            </button>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#dcfce7] text-sm font-bold text-[#15803d] shadow-sm ring-2 ring-white">
              A
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
