import { useEffect, useState } from 'react';
import { signOut } from 'firebase/auth';

import api from '../services/api';
import { auth } from '../services/firebase';

const summaryCards = [
  { key: 'users', label: 'Users' },
  { key: 'activeUsers', label: 'Active Users' },
  { key: 'routes', label: 'Routes' },
  { key: 'activeRoutes', label: 'Active Routes' },
  { key: 'missions', label: 'Missions' },
  { key: 'activeMissions', label: 'Active Missions' },
];

const initialRouteForm = {
  name: '',
  description: '',
  difficulty: 'easy',
  status: 'active',
  startLocationName: '',
  endLocationName: '',
  distanceKm: '1',
  estimatedTimeMinutes: '20',
  minimumTrashRequired: '3',
  visualMaxGoal: '5',
  basePoints: '100',
  pointsPerTrash: '5',
  bonusPointsPerExtraTrash: '3',
};

export default function DashboardPage({ currentUser }) {
  const [dashboard, setDashboard] = useState(null);
  const [users, setUsers] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [routeForm, setRouteForm] = useState(initialRouteForm);
  const [loading, setLoading] = useState(true);
  const [savingRoute, setSavingRoute] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  async function loadAdminData() {
    setLoading(true);
    setErrorMessage('');

    const [dashboardResponse, usersResponse, routesResponse] = await Promise.all([
      api.get('/admin/dashboard'),
      api.get('/admin/users?limit=5'),
      api.get('/admin/routes?limit=5'),
    ]);

    setDashboard(dashboardResponse.data);
    setUsers(usersResponse.data.users || []);
    setRoutes(routesResponse.data.routes || []);
  }

  useEffect(() => {
    let isMounted = true;

    async function loadInitialAdminData() {
      try {
        await loadAdminData();

        if (!isMounted) {
          return;
        }
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setErrorMessage(
          error.response?.data?.message ||
            'Unable to load admin data. Make sure your account has the admin role.'
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadInitialAdminData();

    return () => {
      isMounted = false;
    };
  }, []);

  function handleRouteFormChange(event) {
    const { name, value } = event.target;

    setRouteForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  }

  async function handleCreateRoute(event) {
    event.preventDefault();
    setSavingRoute(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await api.post('/admin/routes', routeForm);

      setRoutes((currentRoutes) => [response.data.route, ...currentRoutes].slice(0, 5));
      setRouteForm(initialRouteForm);
      setSuccessMessage('Route saved to Firestore. Active routes will also appear in the mobile app.');
      await loadAdminData();
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Unable to create route.');
    } finally {
      setSavingRoute(false);
      setLoading(false);
    }
  }

  async function handleSignOut() {
    await signOut(auth);
  }

  const summary = dashboard?.summary || {};

  return (
    <main className="shell">
      <header className="hero">
        <div>
          <p className="eyebrow">Shared Backend Admin</p>
          <h1>Eco Quest Operations</h1>
          <p className="muted">
            Signed in as {dashboard?.admin?.fullName || currentUser.email}. This desktop app uses
            the same backend as the mobile client, with stricter admin route protection.
          </p>
        </div>

        <button className="button button--ghost" onClick={handleSignOut} type="button">
          Sign out
        </button>
      </header>

      {errorMessage ? <p className="error">{errorMessage}</p> : null}
      {successMessage ? <p className="success">{successMessage}</p> : null}

      <section className="grid">
        {summaryCards.map((card) => (
          <article className="panel" key={card.key}>
            <p className="muted">{card.label}</p>
            <h2>{loading ? '...' : summary[card.key] ?? 0}</h2>
          </article>
        ))}
      </section>

      <section className="panel route-form-panel">
        <div className="panel__header">
          <p className="eyebrow">Firestore Input Test</p>
          <h2>Create cleanup route</h2>
          <p className="muted">
            This simple admin form writes through Express into the live Firestore `routes`
            collection. Validation is intentionally light for now.
          </p>
        </div>

        <form className="route-form" onSubmit={handleCreateRoute}>
          <label className="field">
            <span>Route name</span>
            <input
              name="name"
              onChange={handleRouteFormChange}
              placeholder="Community Park Cleanup"
              value={routeForm.name}
            />
          </label>

          <label className="field field--wide">
            <span>Description</span>
            <input
              name="description"
              onChange={handleRouteFormChange}
              placeholder="Short route description"
              value={routeForm.description}
            />
          </label>

          <label className="field">
            <span>Difficulty</span>
            <select name="difficulty" onChange={handleRouteFormChange} value={routeForm.difficulty}>
              <option value="easy">easy</option>
              <option value="medium">medium</option>
              <option value="hard">hard</option>
            </select>
          </label>

          <label className="field">
            <span>Status</span>
            <select name="status" onChange={handleRouteFormChange} value={routeForm.status}>
              <option value="active">active</option>
              <option value="draft">draft</option>
              <option value="archived">archived</option>
            </select>
          </label>

          <label className="field">
            <span>Start location</span>
            <input
              name="startLocationName"
              onChange={handleRouteFormChange}
              placeholder="Main Gate"
              value={routeForm.startLocationName}
            />
          </label>

          <label className="field">
            <span>End location</span>
            <input
              name="endLocationName"
              onChange={handleRouteFormChange}
              placeholder="Garden Area"
              value={routeForm.endLocationName}
            />
          </label>

          <label className="field">
            <span>Distance km</span>
            <input name="distanceKm" onChange={handleRouteFormChange} value={routeForm.distanceKm} />
          </label>

          <label className="field">
            <span>Estimated minutes</span>
            <input
              name="estimatedTimeMinutes"
              onChange={handleRouteFormChange}
              value={routeForm.estimatedTimeMinutes}
            />
          </label>

          <label className="field">
            <span>Minimum trash</span>
            <input
              name="minimumTrashRequired"
              onChange={handleRouteFormChange}
              value={routeForm.minimumTrashRequired}
            />
          </label>

          <label className="field">
            <span>Visual max goal</span>
            <input
              name="visualMaxGoal"
              onChange={handleRouteFormChange}
              value={routeForm.visualMaxGoal}
            />
          </label>

          <label className="field">
            <span>Base points</span>
            <input name="basePoints" onChange={handleRouteFormChange} value={routeForm.basePoints} />
          </label>

          <label className="field">
            <span>Points per trash</span>
            <input
              name="pointsPerTrash"
              onChange={handleRouteFormChange}
              value={routeForm.pointsPerTrash}
            />
          </label>

          <label className="field">
            <span>Bonus points</span>
            <input
              name="bonusPointsPerExtraTrash"
              onChange={handleRouteFormChange}
              value={routeForm.bonusPointsPerExtraTrash}
            />
          </label>

          <button className="button" disabled={savingRoute} type="submit">
            {savingRoute ? 'Saving route...' : 'Save route to Firestore'}
          </button>
        </form>
      </section>

      <section className="content-grid">
        <article className="panel">
          <div className="panel__header">
            <div>
              <p className="eyebrow">Users</p>
              <h2>Recent accounts</h2>
            </div>
          </div>

          <div className="table">
            <div className="table__head">
              <span>Name</span>
              <span>Role</span>
              <span>Status</span>
            </div>

            {loading ? <p className="muted">Loading users...</p> : null}

            {!loading &&
              users.map((user) => (
                <div className="table__row" key={user.id}>
                  <span>{user.fullName || user.email || user.id}</span>
                  <span>{user.role || 'user'}</span>
                  <span>{user.status || 'unknown'}</span>
                </div>
              ))}
          </div>
        </article>

        <article className="panel">
          <div className="panel__header">
            <div>
              <p className="eyebrow">Routes</p>
              <h2>Current cleanup routes</h2>
            </div>
          </div>

          <div className="table">
            <div className="table__head">
              <span>Route</span>
              <span>Difficulty</span>
              <span>Status</span>
            </div>

            {loading ? <p className="muted">Loading routes...</p> : null}

            {!loading &&
              routes.map((route) => (
                <div className="table__row" key={route.id}>
                  <span>{route.title || route.name || route.id}</span>
                  <span>{route.difficulty || 'Unknown'}</span>
                  <span>{route.status || 'unknown'}</span>
                </div>
              ))}
          </div>
        </article>
      </section>
    </main>
  );
}
