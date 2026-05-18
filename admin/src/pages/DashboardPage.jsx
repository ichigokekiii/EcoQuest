import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import Header from '../components/Header';
import PageStatRow from '../components/PageStatRow';
import PointsValue from '../components/PointsValue';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import api from '../services/api';

function formatTimestamp(value) {
  if (!value) {
    return 'Recent';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Recent';
  }

  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function isToday(value) {
  if (!value) {
    return false;
  }

  const date = new Date(value);
  const now = new Date();

  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

function buildWeeklyBars(submissions) {
  const bars = Array.from({ length: 7 }, () => 0);
  const now = new Date();

  submissions.forEach((submission) => {
    const createdAt = new Date(submission.createdAt || submission.updatedAt);
    if (Number.isNaN(createdAt.getTime())) {
      return;
    }

    const dayDiff = Math.floor((now - createdAt) / (1000 * 60 * 60 * 24));
    if (dayDiff >= 0 && dayDiff < 7) {
      bars[6 - dayDiff] += 1;
    }
  });

  const maxValue = Math.max(...bars, 1);
  return bars.map((count) => Math.round((count / maxValue) * 100));
}

export default function DashboardPage({ adminProfile }) {
  const [dashboard, setDashboard] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [redemptions, setRedemptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadAdminData() {
      try {
        setLoading(true);
        setErrorMessage('');

        const [dashboardResponse, sessionsResponse, submissionsResponse, redemptionsResponse] = await Promise.all([
          api.get('/admin/dashboard'),
          api.get('/admin/route-sessions?limit=50'),
          api.get('/admin/trash-submissions?limit=50'),
          api.get('/admin/redemptions?limit=20'),
        ]);

        if (!isMounted) {
          return;
        }

        setDashboard(dashboardResponse.data);
        setSessions(sessionsResponse.data.sessions || []);
        setSubmissions(submissionsResponse.data.submissions || []);
        setRedemptions(redemptionsResponse.data.redemptions || []);
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
  const weeklyBars = useMemo(() => buildWeeklyBars(submissions), [submissions]);
  const weeklyTotal = submissions.filter((submission) => {
    const createdAt = new Date(submission.createdAt || submission.updatedAt);
    const now = new Date();
    const dayDiff = Math.floor((now - createdAt) / (1000 * 60 * 60 * 24));
    return dayDiff >= 0 && dayDiff < 7;
  }).length;

  const activityRows = useMemo(() => {
    const sessionRows = sessions.map((session) => ({
      id: session.id,
      sortValue: session.updatedAt || session.createdAt || '',
      user: session.userName || session.userId || 'EcoQuest User',
      handle: `@${String(session.userId || 'user').slice(0, 8)}`,
      route: session.routeName || session.routeId || 'Cleanup Route',
      trash: session.trashCollected ?? session.itemsCollected ?? 0,
      points: session.pointsEarned ?? session.totalPointsEarned ?? 0,
      status: session.status || 'active',
      time: formatTimestamp(session.updatedAt || session.createdAt),
    }));

    const submissionRows = submissions.map((item) => ({
      id: item.id,
      sortValue: item.createdAt || item.updatedAt || '',
      user: item.userName || item.userId || 'EcoQuest User',
      handle: `@${String(item.userId || 'user').slice(0, 8)}`,
      route: item.routeName || item.routeId || 'Cleanup Route',
      trash: item.quantity || 1,
      points: item.pointsAwarded ?? 0,
      status: item.status === 'pending' ? 'pending' : item.status || 'completed',
      time: formatTimestamp(item.createdAt),
    }));

    const redemptionRows = redemptions.map((item) => ({
      id: item.id,
      sortValue: item.redeemedAt || item.createdAt || item.updatedAt || '',
      user: item.userName || item.userId || 'EcoQuest User',
      handle: `@${String(item.userId || 'user').slice(0, 8)}`,
      route: item.rewardName || item.rewardId || 'Reward redemption',
      trash: '—',
      points: item.pointsCost ? -Number(item.pointsCost) : 0,
      status: item.status || 'pending',
      time: formatTimestamp(item.redeemedAt || item.createdAt),
    }));

    return [...sessionRows, ...submissionRows, ...redemptionRows]
      .sort((first, second) => new Date(second.sortValue || 0) - new Date(first.sortValue || 0))
      .slice(0, 8);
  }, [redemptions, sessions, submissions]);

  const cardValues = {
    users: summary.users ?? 0,
    activeRoutes: summary.activeRoutes ?? summary.routes ?? 0,
    trashSubmissions: summary.trashSubmissions ?? submissions.length,
    pendingSubmissions: summary.pendingSubmissions ??
      submissions.filter((item) => (item.status || 'pending') === 'pending').length,
  };

  const summaryCards = [
    {
      key: 'users',
      label: 'Total Users',
      tone: 'blue',
      footnote: `${summary.activeUsers ?? 0} active users`,
    },
    {
      key: 'activeRoutes',
      label: 'Active Routes',
      tone: 'green',
      footnote: `${summary.routes ?? 0} total routes`,
    },
    {
      key: 'trashSubmissions',
      label: 'Trash Submissions',
      tone: 'yellow',
      footnote: `${weeklyTotal} this week · ${summary.redemptions ?? redemptions.length} redemptions`,
    },
    {
      key: 'pendingSubmissions',
      label: 'Pending Reviews',
      tone: 'red',
      footnote: 'Needs admin review',
    },
  ];

  if (loading) {
    return <p className="loading-state">Synchronizing admin dashboard metrics...</p>;
  }

  return (
    <section className="dashboard-page">
      <Header
        subtitle={
          adminProfile?.fullName
            ? `Welcome back, ${adminProfile.fullName} · ${new Date().toLocaleDateString(undefined, {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}`
            : new Date().toLocaleDateString(undefined, {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })
        }
        title="Dashboard"
      />

      {errorMessage ? <p className="error">{errorMessage}</p> : null}

      <PageStatRow>
        {summaryCards.map((card) => (
          <StatCard
            footnote={card.footnote}
            key={card.key}
            label={card.label}
            tone={card.tone}
            value={cardValues[card.key] ?? 0}
          />
        ))}
      </PageStatRow>

      <section className="content-grid">
        <article className="data-card">
          <div className="section-head">
            <div>
              <h2>Recent Activity</h2>
              <p>Latest route sessions and trash submissions.</p>
            </div>
            <Link className="link-action" to="/verification">
              View reviews →
            </Link>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Route</th>
                <th>Trash</th>
                <th>Points</th>
                <th>Status</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {activityRows.map((row) => (
                <tr key={row.id}>
                  <td>
                    <div className="user-identity">
                      <strong>{row.user}</strong>
                      <span className="user-handle">{row.handle}</span>
                    </div>
                  </td>
                  <td>{row.route}</td>
                  <td>{row.trash}</td>
                  <td>
                    <PointsValue value={row.points} />
                  </td>
                  <td>
                    <StatusBadge status={row.status} />
                  </td>
                  <td>{row.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {activityRows.length === 0 ? <p className="empty-state">No recent activity yet.</p> : null}
        </article>

        <aside className="chart-card">
          <div className="section-head">
            <div>
              <h2>Weekly Submissions</h2>
              <p>Trash photos in the last 7 days</p>
            </div>
          </div>
          <div className="bar-chart" aria-hidden="true">
            {weeklyBars.map((height, index) => (
              <div className="bar-chart-bar" key={index}>
                <span style={{ height: `${height}%` }} />
                <label>{['M', 'T', 'W', 'T', 'F', 'S', 'S'][index]}</label>
              </div>
            ))}
          </div>
          <div className="weekly-summary">
            <div>
              <strong>{weeklyTotal}</strong>
              <span>Total</span>
            </div>
            <div>
              <strong>{Math.max(1, Math.round(weeklyTotal / 7))}</strong>
              <span>Avg/day</span>
            </div>
            <div>
              <strong>{summary.pointsRedeemed ?? 0}</strong>
              <span>Pts redeemed</span>
            </div>
          </div>

          <div className="section-head">
            <div>
              <h2>Recent Redemptions</h2>
              <p>Latest reward claims from Firebase.</p>
            </div>
          </div>
          {redemptions.length === 0 ? (
            <p className="empty-state">No reward redemptions yet.</p>
          ) : (
            <div className="stack-list">
              {redemptions.slice(0, 4).map((item) => (
                <div className="stack-list-row" key={item.id}>
                  <div>
                    <strong>{item.rewardName || 'Reward redemption'}</strong>
                    <p className="muted">{item.userName || item.userId || 'EcoQuest User'}</p>
                  </div>
                  <div className="stack-list-meta">
                    <PointsValue value={-Number(item.pointsCost || 0)} />
                    <StatusBadge status={item.status || 'pending'} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </aside>
      </section>
    </section>
  );
}
