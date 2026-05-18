const variantClasses = {
  active: 'bg-emerald-50 text-mint',
  approved: 'bg-emerald-50 text-mint',
  inactive: 'bg-gray-50 text-gray-500',
  draft: 'bg-amber-50 text-amber-600',
  pending: 'bg-amber-50 text-amber-600',
  rejected: 'bg-red-50 text-red-500',
  suspended: 'bg-red-50 text-red-500',
  archived: 'bg-gray-50 text-gray-500',
  completed: 'bg-emerald-50 text-mint',
  easy: 'bg-emerald-50 text-mint',
  medium: 'bg-amber-50 text-amber-600',
  hard: 'bg-red-50 text-red-500',
};

export default function StatusBadge({ status, label }) {
  const normalized = String(status || 'active').toLowerCase();
  const variant = variantClasses[normalized] || variantClasses.inactive;

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${variant}`}
    >
      {label || status || 'active'}
    </span>
  );
}
