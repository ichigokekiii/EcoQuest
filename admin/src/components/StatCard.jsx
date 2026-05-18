function MiniSparkline({ tone = 'green' }) {
  const stroke =
    tone === 'blue'
      ? '#3B82F6'
      : tone === 'yellow'
        ? '#F59E0B'
        : tone === 'red'
          ? '#EF4444'
          : '#22C55E';

  return (
    <svg className="stat-sparkline" viewBox="0 0 60 24" aria-hidden="true">
      <polyline
        fill="none"
        points="0,18 10,14 20,16 30,10 40,12 50,6 60,8"
        stroke={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

export default function StatCard({
  icon,
  tone = 'green',
  value,
  label,
  trend,
  footnote,
}) {
  return (
    <article className="stat-card">
      <div className="stat-card-top">
        <span className={`stat-icon ${tone}`}>{icon}</span>
        <div className="stat-card-trend">
          {trend ? <span className="trend-badge">{trend}</span> : null}
          <MiniSparkline tone={tone} />
        </div>
      </div>
      <div className="stat-card-content">
        <strong>{value}</strong>
        <p>{label}</p>
      </div>
      {footnote ? <p className="stat-footnote">{footnote}</p> : null}
    </article>
  );
}
