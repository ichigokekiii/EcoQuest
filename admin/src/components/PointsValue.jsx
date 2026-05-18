export default function PointsValue({ value }) {
  return (
    <span className="inline-flex items-center gap-1 font-semibold text-mint">
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-mint">
        <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8Z" />
      </svg>
      {Number(value || 0).toLocaleString()}
    </span>
  );
}
