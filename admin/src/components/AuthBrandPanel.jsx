const brandFeatures = [
  'Plan cleanup routes on the map',
  'Review trash photo submissions',
  'Manage users, missions, and rewards',
];

export default function AuthBrandPanel() {
  return (
    <aside aria-label="Eco Quest branding" className="auth-brand-panel">
      <div aria-hidden="true" className="auth-brand-glow auth-brand-glow-one" />
      <div aria-hidden="true" className="auth-brand-glow auth-brand-glow-two" />

      <div className="auth-brand-content">
        <span className="auth-brand-badge">Admin Console</span>

        <div className="auth-brand-logo-frame">
          <img alt="" className="auth-brand-logo" src="/eco-logo-mint.svg" />
        </div>

        <div className="auth-brand-copy">
          <h1 className="auth-brand-name">Eco Quest</h1>
          <p className="auth-brand-tagline">
            Clean the world. Manage missions, routes, and rewards from one desktop workspace.
          </p>
        </div>

        <ul className="auth-brand-features">
          {brandFeatures.map((feature) => (
            <li key={feature}>
              <span aria-hidden="true" className="auth-brand-feature-icon">
                <svg viewBox="0 0 24 24">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" fill="none" stroke="currentColor" strokeWidth="2" />
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
