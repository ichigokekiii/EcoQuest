const variantClass = {
  active: 'active-status',
  approved: 'approved',
  inactive: 'inactive',
  draft: 'verify',
  pending: 'pending',
  rejected: 'rejected',
  suspended: 'rejected',
  archived: 'inactive',
  completed: 'approved',
  easy: 'active-status',
  medium: 'verify',
  hard: 'rejected',
};

export default function StatusBadge({ status, label }) {
  const normalized = String(status || 'active').toLowerCase();
  const className = variantClass[normalized] || 'inactive';

  return (
    <span className={`status-pill ${className}`}>
      {label || status || 'active'}
    </span>
  );
}
