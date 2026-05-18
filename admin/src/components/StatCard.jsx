import { chartStrokeColors } from '../constants/theme';

function MiniSparkline({ tone = 'green' }) {
  const stroke = chartStrokeColors[tone] || chartStrokeColors.green;

  return (
    <svg className="h-6 w-[60px]" viewBox="0 0 60 24" aria-hidden="true">
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

const iconToneClasses = {
  green: 'bg-mint-soft text-mint',
  blue: 'bg-blue-50 text-blue-500',
  yellow: 'bg-amber-50 text-amber-500',
  red: 'bg-red-50 text-red-500',
};

export default function StatCard({
  icon,
  tone = 'green',
  value,
  label,
  trend,
  footnote,
}) {
  return (
    <article className="card-surface flex flex-col gap-0 p-5">
      <div className="mb-2.5 flex items-start justify-between gap-2">
        <span
          className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg ${iconToneClasses[tone] || iconToneClasses.green}`}
        >
          {icon}
        </span>
        <div className="grid justify-items-end gap-1">
          {trend ? (
            <span className="rounded-full bg-mint-soft px-2 py-0.5 text-xs font-semibold text-mint">
              {trend}
            </span>
          ) : null}
          <MiniSparkline tone={tone} />
        </div>
      </div>
      <div>
        <strong className="block text-[1.75rem] font-bold leading-tight tracking-tight text-gray-900">
          {value}
        </strong>
        <p className="mt-0.5 text-sm font-medium text-gray-500">{label}</p>
      </div>
      {footnote ? <p className="mt-2 text-xs text-gray-400">{footnote}</p> : null}
    </article>
  );
}
