const brandFeatures = [
  'Plan cleanup routes on the map',
  'Review trash photo submissions',
  'Manage users, missions, and rewards',
];

export default function AuthBrandPanel() {
  return (
    <aside aria-label="Eco Quest branding" className="auth-brand-panel">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-14 -top-20 h-[280px] w-[280px] rounded-full bg-mint-logo/15 blur-sm"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-16 -left-10 h-[220px] w-[220px] rounded-full bg-white/5"
      />

      <div className="relative z-10 grid w-full max-w-[360px] gap-6">
        <span className="inline-flex w-fit items-center rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[0.72rem] font-bold uppercase tracking-wider text-emerald-50/90">
          Admin Console
        </span>

        <div className="w-fit rounded-[32px] border border-white/20 bg-white/15 p-3.5 shadow-2xl">
          <img alt="" className="block h-28 w-28 rounded-3xl object-cover" src="/eco-logo-mint.svg" />
        </div>

        <div className="grid gap-2.5">
          <h1 className="m-0 text-[clamp(2rem,4vw,2.6rem)] font-extrabold leading-tight tracking-tight">
            Eco Quest
          </h1>
          <p className="m-0 max-w-[34ch] text-base leading-relaxed text-emerald-50/80">
            Clean the world. Manage missions, routes, and rewards from one desktop workspace.
          </p>
        </div>

        <ul className="m-0 mt-2 grid list-none gap-3 p-0">
          {brandFeatures.map((feature) => (
            <li key={feature} className="flex items-start gap-2.5 text-[0.92rem] leading-snug text-emerald-50/90">
              <span
                aria-hidden="true"
                className="grid h-[22px] w-[22px] shrink-0 place-items-center rounded-full bg-white/10 text-mint-logo"
              >
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5">
                  <path
                    d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
              </span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
