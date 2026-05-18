import { useEffect, useState } from 'react';

import Header from '../components/Header';
import api from '../services/api';

const summaryCards = [
  { key: 'users', label: 'Total Users', icon: 'users', tone: 'blue', delta: 'Community accounts' },
  { key: 'activeRoutes', label: 'Active Routes', icon: 'route', tone: 'green', delta: 'Visible on mobile' },
  { key: 'activeMissions', label: 'Active Missions', icon: 'mission', tone: 'yellow', delta: 'Cleanup goals' },
  { key: 'trashSubmissions', label: 'Trash Submissions', icon: 'trash', tone: 'red', delta: 'Proof records' },
];

function formatTimestamp(value) {
  if (!value) {
    return 'Recent';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Recent';
  }

  return date.toLocaleString();
}

function SectionIcon({ name }) {
  switch (name) {
    case 'users':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M8 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm8 1a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-8 2c-3.9 0-7 2.2-7 5v1h14v-1c0-2.8-3.1-5-7-5Z" />
        </svg>
      );
    case 'route':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6 18a3 3 0 1 1 0-6h12a3 3 0 1 1 0 6H6Zm0-8a3 3 0 1 1 2.6-4.5h6.8A3 3 0 1 1 18 10H6Z" />
        </svg>
      );
    case 'mission':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2Zm-8 13-4-4 1.4-1.4 2.6 2.6 5.6-5.6L18 9l-7 7Z" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M10 2h4l1 2h5v2H4V4h5l1-2Zm-4 6h12l-1 11a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L6 8Z" />
        </svg>
      );
  }
}

export default function DashboardPage({ currentUser }) {
  const [dashboard, setDashboard] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadAdminData() {
      try {
        setLoading(true);
        setErrorMessage('');

        const [
          dashboardResponse,
          routesResponse,
          sessionsResponse,
          submissionsResponse,
        ] = await Promise.all([
          api.get('/admin/dashboard'),
          api.get('/admin/routes?limit=6'),
          api.get('/admin/route-sessions?limit=6'),
          api.get('/admin/trash-submissions?limit=6'),
        ]);

        if (!isMounted) {
          return;
        }

        setDashboard(dashboardResponse.data);
        setRoutes(routesResponse.data.routes || []);
        setSessions(sessionsResponse.data.sessions || []);
        setSubmissions(submissionsResponse.data.submissions || []);
      } catch (error) {
        if (isMounted) {
          setErrorMessage(
            error.response?.data?.message ||
              'Unable to load admin data. Make sure this Firebase user has the admin role.'
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadAdminData();

    return () => {
      isMounted = false;
    };
  }, []);

  const summary = dashboard?.summary || {};

  if (loading) {
    return <p className="loading-state">Synchronizing admin dashboard metrics...</p>;
  }

  return (
    <section className="dashboard-page">
      <Header
        title="Dashboard"
        subtitle={new Date().toLocaleDateString(undefined, {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        })}
      />

      {errorMessage ? <p className="error">{errorMessage}</p> : null}

      <section className="stats-grid" aria-label="Summary metrics">
        {summaryCards.map((card) => (
          <article className="stat-card" key={card.key}>
            <div className="stat-card-body">
              <span className={`stat-icon ${card.tone}`}>
                <SectionIcon name={card.icon} />
              </span>
              <div className="stat-card-content">
                <strong>{summary[card.key] ?? 0}</strong>
                <p>{card.label}</p>
              </div>
            </div>
            <p className="stat-footnote">{card.delta}</p>
          </article>
        ))}
      </section>

      <section className="content-grid">
        <article className="chart-card">
          <div className="section-head">
            <div>
              <h2>Collection Trends</h2>
              <p>Simple activity curve based on route sessions and trash submissions.</p>
            </div>
            <button className="ghost-link" type="button">
              Generate Report
            </button>
          </div>
          <div className="chart-panel">
            <svg className="trend-chart" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(77, 133, 88, 0.36)" />
                  <stop offset="100%" stopColor="rgba(77, 133, 88, 0.04)" />
                </linearGradient>
              </defs>
              <path
                d="M0,100 L0,82 12,76 24,70 36,72 48,54 60,48 72,42 84,36 100,28 L100,100 Z"
                fill="url(#trendFill)"
              />
              <polyline
                points="0,82 12,76 24,70 36,72 48,54 60,48 72,42 84,36 100,28"
                fill="none"
                stroke="#15803d"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="3.5"
              />
            </svg>
          </div>
        </article>

        <aside className="submissions-card">
          <h2>Recent Submissions</h2>
          <div className="submission-list">
            {submissions.slice(0, 5).map((item) => (
              <div className="submission-item" key={item.id}>
                <div>
                  <p className="submission-name">{item.userName || item.userId || 'EcoQuest User'}</p>
                  <p className="submission-route">{item.routeName || item.routeId || 'Cleanup Route'}</p>
                  <p className="submission-route">
                    Final: {item.finalCategoryName || item.trashCategoryName || 'Uncategorized'}
                    {' · '}
                    AI: {item.aiSuggestedCategoryName || 'Not analyzed'}
                    {item.categoryChangedByUser ? ' · user changed' : ''}
                  </p>
                </div>
                <span className={`status-pill ${item.status === 'pending' ? 'verify' : 'approved'}`}>
                  {item.status || 'auto_approved'}
                </span>
              </div>
            ))}
            {submissions.length === 0 ? <p className="muted">No trash submissions yet.</p> : null}
          </div>
        </aside>
      </section>

      <section className="content-grid">
        <article className="data-card">
          <div className="section-head">
            <div>
              <h2>Active Routes</h2>
              <p>Routes managed by admin and consumed by mobile discovery.</p>
            </div>
          </div>
          <div className="card-list">
            {routes.slice(0, 5).map((route) => (
              <div className="list-item" key={route.id}>
                <div>
                  <strong>{route.name || route.title}</strong>
                  <p className="muted">{route.locationName || route.startLocation?.name || 'Route Start'}</p>
                </div>
                <span className={`status-chip ${route.status === 'draft' ? 'warning' : ''}`}>
                  {route.status || 'active'}
                </span>
              </div>
            ))}
          </div>
        </article>

        <article className="data-card">
          <div className="section-head">
            <div>
              <h2>Recent Sessions</h2>
              <p>Mobile cleanup attempts flowing through the shared backend.</p>
            </div>
          </div>
          <div className="card-list">
            {sessions.slice(0, 5).map((session) => (
              <div className="list-item" key={session.id}>
                <div>
                  <strong>{session.routeName || session.routeId}</strong>
                  <p className="muted">{formatTimestamp(session.updatedAt || session.createdAt)}</p>
                </div>
                <span className="status-chip">{session.status}</span>
              </div>
            ))}
          </div>
        </article>
      </section>
    </section>
  );
}
