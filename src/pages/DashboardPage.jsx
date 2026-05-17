import Header from '../components/Header'

const dashboardStats = [
  { label: 'Total Active Users', value: '12,450', delta: '+5.2% vs last month', tone: 'success', icon: 'users' },
  { label: 'Total Trash (kg)', value: '45,230', delta: '+12.8% vs last month', tone: 'info', icon: 'trash' },
  { label: 'Active Routes', value: '342', delta: '0.0% vs last month', tone: 'neutral', icon: 'route' },
  { label: 'Pending Verifications', value: '87', delta: 'Requires attention', tone: 'warning', icon: 'check' },
]

const dashboardTrends = {
  title: 'System Overview',
  subtitle: 'Monitor key metrics and recent activity.',
  chartTitle: 'Collection Trends (30 Days)',
  chartLink: 'View Report',
  chartSummary: 'A steady climb in collected waste across the last month, with a mid-cycle recovery in the core districts.',
  chartData: [18, 22, 16, 14, 19, 31, 44, 52, 58, 51, 44, 40, 42, 47, 59, 66, 61, 54, 49, 45, 47, 52, 58, 63, 70, 77],
  recentTitle: 'Recent Submissions',
  recentItems: [
    { name: 'Sarah J.', route: 'Rizal Park Loop', status: 'Verify' },
    { name: 'Mike T.', route: 'Coastal Clean', status: 'Verify' },
    { name: 'Elena R.', route: 'Downtown Walk', status: 'Approved', approved: true },
    { name: 'David L.', route: 'River Path', status: 'Verify' },
  ],
  cta: 'View All Submissions',
}

function SectionIcon({ name }) {
  switch (name) {
    case 'users':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M8 11a4 4 0 1 0-0.001-8.001A4 4 0 0 0 8 11Zm8 1a3 3 0 1 0-.001-6.001A3 3 0 0 0 16 12Zm-8 2c-3.866 0-7 2.239-7 5v1h14v-1c0-2.761-3.134-5-7-5Zm8 0c-.53 0-1.035.07-1.51.19A6.97 6.97 0 0 1 19 18v1h5v-1c0-2.209-1.79-4-4-4Z" />
        </svg>
      )
    case 'trash':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M10 2h4l1 2h5v2H4V4h5l1-2Zm-4 6h12l-1 11a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L6 8Zm4 2v7h2v-7h-2Zm4 0v7h2v-7h-2Z" />
        </svg>
      )
    case 'route':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6 18a3 3 0 1 1 0-6c1.1 0 2.07.6 2.58 1.5h3.84A5.98 5.98 0 0 0 18 7a3 3 0 1 1 0-3 5.98 5.98 0 0 0-5.58 4.5H8.58A3.01 3.01 0 0 0 6 6a3 3 0 1 0 0 6h12a3 3 0 1 1 0 6H6Z" />
        </svg>
      )
    case 'check':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2Zm-8 13-4-4 1.4-1.4L11 13.2l5.6-5.6L18 9l-7 7Z" />
        </svg>
      )
    default:
      return null
  }
}

function StatCard({ label, value, delta, tone, icon }) {
  return (
    <article className={`stat-card tone-${tone}`}>
      <div className="stat-card-head">
        <p>{label}</p>
        <span className="stat-icon">
          <SectionIcon name={icon} />
        </span>
      </div>
      <strong>{value}</strong>
      <div className="stat-footnote">
        <span className="trend-mark">↗</span>
        <span>{delta}</span>
      </div>
    </article>
  )
}

function Chart({ data }) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const width = 100
  const height = 100
  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * width
      const normalized = (value - min) / (max - min || 1)
      const y = height - normalized * 80 - 10
      return `${x},${y}`
    })
    .join(' ')

  return (
    <svg className="trend-chart" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(77, 133, 88, 0.36)" />
          <stop offset="100%" stopColor="rgba(77, 133, 88, 0.04)" />
        </linearGradient>
      </defs>
      <path d={`M0,100 L0,${points.split(' ')[0].split(',')[1]} ${points} L100,100 Z`} fill="url(#trendFill)" />
      <polyline points={points} fill="none" stroke="#4d8558" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function DashboardPage() {
  return (
    <section className="dashboard-page">
      <Header title={dashboardTrends.title} subtitle={dashboardTrends.subtitle} />

      <section className="stats-grid" aria-label="Summary metrics">
        {dashboardStats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </section>

      <section className="content-grid">
        <article className="chart-card">
          <div className="section-head">
            <div>
              <h2>{dashboardTrends.chartTitle}</h2>
              <p>{dashboardTrends.chartSummary}</p>
            </div>
            <button type="button" className="ghost-link">
              {dashboardTrends.chartLink} →
            </button>
          </div>
          <div className="chart-panel">
            <Chart data={dashboardTrends.chartData} />
            <div className="chart-axis chart-axis-top" />
            <div className="chart-axis chart-axis-mid" />
            <div className="chart-axis chart-axis-bottom" />
            <div className="chart-label left">Day 1</div>
            <div className="chart-label center">Day 15</div>
            <div className="chart-label right">Day 30</div>
          </div>
        </article>

        <aside className="submissions-card">
          <h2>{dashboardTrends.recentTitle}</h2>
          <div className="submission-list">
            {dashboardTrends.recentItems.map((item) => (
              <div key={`${item.name}-${item.route}`} className="submission-item">
                <div>
                  <p className="submission-name">{item.name}</p>
                  <p className="submission-route">{item.route}</p>
                </div>
                <span className={`status-pill${item.approved ? ' approved' : ''}`}>{item.status}</span>
              </div>
            ))}
          </div>
          <button type="button" className="primary-outline">
            {dashboardTrends.cta}
          </button>
        </aside>
      </section>
    </section>
  )
}

export default DashboardPage