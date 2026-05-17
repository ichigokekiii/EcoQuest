import Header from '../components/Header'

const routeCards = [
  {
    status: 'Active',
    statusTone: 'active',
    title: 'Rizal Park Loop',
    difficulty: 'Easy',
    location: 'Manila, NCR',
    stats: [
      { label: 'Distance', value: '1.2 km' },
      { label: 'Est. Time', value: '18 min' },
      { label: 'Trash Spots', value: '3' },
    ],
    badge: '24',
    action: 'Manage Route',
    previewTone: 'forest',
  },
  {
    status: 'Active',
    statusTone: 'active',
    title: 'BGC High Street',
    difficulty: 'Medium',
    location: 'Taguig, NCR',
    stats: [
      { label: 'Distance', value: '3.5 km' },
      { label: 'Est. Time', value: '45 min' },
      { label: 'Trash Spots', value: '8' },
    ],
    badge: '156',
    action: 'Manage Route',
    previewTone: 'ink',
  },
  {
    status: 'Draft',
    statusTone: 'draft',
    title: 'UP Diliman Oval',
    difficulty: 'Medium',
    location: 'Quezon City, NCR',
    stats: [
      { label: 'Distance', value: '2.2 km' },
      { label: 'Est. Time', value: '30 min' },
      { label: 'Trash Spots', value: 'TBD' },
    ],
    badge: '0',
    action: 'Continue Editing',
    previewTone: 'sky',
  },
]

function RoutePreview({ tone }) {
  return (
    <div className={`route-preview route-preview-${tone}`}>
      <div className="route-preview-map" />
      <div className="route-preview-panel">
        <div className="route-preview-line one" />
        <div className="route-preview-line two" />
        <div className="route-preview-dot one" />
        <div className="route-preview-dot two" />
      </div>
    </div>
  )
}

function RouteCard({ card }) {
  return (
    <article className="route-card">
      <div className="route-card-media">
        <RoutePreview tone={card.previewTone} />
        <span className={`route-status route-status-${card.statusTone}`}>{card.status}</span>
      </div>

      <div className="route-card-body">
        <div className="route-title-row">
          <h3>{card.title}</h3>
          <span className="route-difficulty">{card.difficulty}</span>
        </div>
        <p className="route-location">{card.location}</p>

        <dl className="route-stats">
          {card.stats.map((item) => (
            <div key={item.label}>
              <dt>{item.label}</dt>
              <dd>{item.value}</dd>
            </div>
          ))}
        </dl>

        <div className="route-card-footer">
          <div className="route-badge">
            <span>{card.badge}</span>
          </div>
          <button type="button" className={`route-action${card.action === 'Continue Editing' ? ' solid' : ''}`}>
            {card.action}
          </button>
        </div>
      </div>
    </article>
  )
}

function RoutePage() {
  return (
    <section className="route-page">
      <Header
        title="Route Management"
        subtitle="Manage and monitor active walking routes for eco-missions."
        searchPlaceholder="Search routes, locations, or status..."
        actions={(
          <button type="button" className="filled-action route-create-button">
            Create New Route
          </button>
        )}
      />

      <section className="route-toolbar" aria-label="Route filters">
        <div className="route-selects">
          <button type="button" className="route-select">
            All Regions <span>▾</span>
          </button>
          <button type="button" className="route-select">
            All Difficulties <span>▾</span>
          </button>
        </div>

        <div className="route-sort">
          <span className="route-sort-icon">☰</span>
          <span>Sort by:</span>
          <button type="button" className="route-sort-button">
            Recently Added <span>▾</span>
          </button>
        </div>
      </section>

      <section className="route-grid" aria-label="Routes overview">
        {routeCards.map((card) => (
          <RouteCard key={card.title} card={card} />
        ))}
      </section>
    </section>
  )
}

export default RoutePage