import { useEffect, useMemo, useState } from 'react';

import Header from '../components/Header';
import IconActionButton from '../components/IconActionButton';
import PageStatRow from '../components/PageStatRow';
import RouteMapPicker from '../components/RouteMapPicker';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import TableToolbar from '../components/TableToolbar';
import api from '../services/api';

const emptyRouteForm = {
  name: '',
  description: '',
  difficulty: 'easy',
  status: 'active',
  startLocationName: '',
  startLat: '14.6096',
  startLng: '120.9904',
  endLocationName: '',
  endLat: '14.6115',
  endLng: '120.993',
  distanceKm: '1',
  estimatedTimeMinutes: '20',
  minimumTrashRequired: '3',
  visualMaxGoal: '5',
  basePoints: '100',
  pointsPerTrash: '5',
  bonusPointsPerExtraTrash: '3',
  path: [],
};

const difficultyFilters = ['All', 'Easy', 'Medium', 'Hard'];

function buildRouteFormFromRoute(route) {
  return {
    name: route.name || route.title || '',
    description: route.description || '',
    difficulty: route.difficulty || 'easy',
    status: route.status || 'draft',
    startLocationName: route.startLocation?.name || route.locationName || '',
    startLat: String(route.startLocation?.lat ?? ''),
    startLng: String(route.startLocation?.lng ?? ''),
    endLocationName: route.endLocation?.name || '',
    endLat: String(route.endLocation?.lat ?? ''),
    endLng: String(route.endLocation?.lng ?? ''),
    distanceKm: String(route.distanceKm ?? ''),
    estimatedTimeMinutes: String(route.estimatedTimeMinutes ?? ''),
    minimumTrashRequired: String(route.minimumTrashRequired ?? route.targetTrash ?? ''),
    visualMaxGoal: String(route.visualMaxGoal ?? route.minimumTrashRequired ?? ''),
    basePoints: String(route.basePoints ?? 0),
    pointsPerTrash: String(route.pointsPerTrash ?? 5),
    bonusPointsPerExtraTrash: String(route.bonusPointsPerExtraTrash ?? 2),
    path: Array.isArray(route.path) ? route.path : route.coordinates || [],
  };
}

function buildRoutePayload(form) {
  return {
    ...form,
    path: Array.isArray(form.path) ? form.path : [],
  };
}

function RouteForm({ editingRouteId, form, onCancel, onChange, onMapChange, onSubmit, saving }) {
  return (
    <section className="data-card page-form-card collapsible-form">
      <div className="section-head">
        <div>
          <h2>{editingRouteId ? 'Edit Cleanup Route' : 'Create Cleanup Route'}</h2>
          <p>Pin start and destination on the map like a navigation app, then save through Express.</p>
        </div>
        <button className="outline-action" onClick={onCancel} type="button">
          Close
        </button>
      </div>

      <RouteMapPicker onChange={onMapChange} value={form} />

      <form className="form-grid route-form-grid" onSubmit={onSubmit}>
        <label className="field">
          <span>Name</span>
          <input name="name" onChange={onChange} required value={form.name} />
        </label>

        <label className="field">
          <span>Difficulty</span>
          <select name="difficulty" onChange={onChange} value={form.difficulty}>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </label>

        <label className="field">
          <span>Status</span>
          <select name="status" onChange={onChange} value={form.status}>
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
        </label>

        <label className="field wide">
          <span>Description</span>
          <textarea name="description" onChange={onChange} value={form.description} />
        </label>

        <label className="field">
          <span>Start Location</span>
          <input name="startLocationName" onChange={onChange} value={form.startLocationName} />
        </label>

        <label className="field">
          <span>End Location</span>
          <input name="endLocationName" onChange={onChange} value={form.endLocationName} />
        </label>

        <label className="field">
          <span>Distance (km)</span>
          <input name="distanceKm" onChange={onChange} value={form.distanceKm} />
        </label>

        <label className="field">
          <span>Estimated Time (min)</span>
          <input name="estimatedTimeMinutes" onChange={onChange} value={form.estimatedTimeMinutes} />
        </label>

        <label className="field">
          <span>Minimum Trash</span>
          <input name="minimumTrashRequired" onChange={onChange} value={form.minimumTrashRequired} />
        </label>

        <label className="field">
          <span>Visual Goal</span>
          <input name="visualMaxGoal" onChange={onChange} value={form.visualMaxGoal} />
        </label>

        <label className="field">
          <span>Base Points</span>
          <input name="basePoints" onChange={onChange} value={form.basePoints} />
        </label>

        <label className="field">
          <span>Points Per Trash</span>
          <input name="pointsPerTrash" onChange={onChange} value={form.pointsPerTrash} />
        </label>

        <label className="field">
          <span>Bonus Points</span>
          <input
            name="bonusPointsPerExtraTrash"
            onChange={onChange}
            value={form.bonusPointsPerExtraTrash}
          />
        </label>

        <p className="field wide muted">
          Path points saved: {Array.isArray(form.path) ? form.path.length : 0}
          {form.status === 'active' && (!form.path || form.path.length === 0)
            ? ' · Active routes should include a calculated path when possible.'
            : ''}
        </p>

        <div className="form-actions">
          <button className="filled-action" disabled={saving} type="submit">
            {saving ? 'Saving...' : editingRouteId ? 'Update Route' : 'Create Route'}
          </button>
        </div>
      </form>
    </section>
  );
}

function RouteViewModal({ route, onClose }) {
  if (!route) {
    return null;
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <section aria-modal="true" className="modal-card route-view-modal" role="dialog">
        <div className="section-head">
          <div>
            <h2>{route.name || route.title}</h2>
            <p>{route.description || 'No description provided.'}</p>
          </div>
          <button className="outline-action" onClick={onClose} type="button">
            Close
          </button>
        </div>
        <RouteMapPicker value={buildRouteFormFromRoute(route)} />
        <div className="route-view-meta">
          <StatusBadge status={route.status || 'active'} />
          <span>{route.distanceKm || 0} km</span>
          <span>{route.estimatedTimeMinutes || 0} min</span>
          <span>{String(route.difficulty || 'easy')}</span>
        </div>
      </section>
    </div>
  );
}

export default function RoutePage() {
  const [routes, setRoutes] = useState([]);
  const [tableSearch, setTableSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [routeForm, setRouteForm] = useState(emptyRouteForm);
  const [editingRouteId, setEditingRouteId] = useState(null);
  const [viewRoute, setViewRoute] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  async function loadRoutes() {
    try {
      setLoading(true);
      setErrorMessage('');
      const response = await api.get('/admin/routes?limit=50');
      setRoutes(response.data.routes || []);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Unable to load routes.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRoutes();
  }, []);

  const filteredRoutes = useMemo(() => {
    return routes.filter((route) => {
      const matchesSearch = `${route.name || route.title || ''} ${route.description || ''} ${
        route.locationName || route.startLocation?.name || ''
      }`
        .toLowerCase()
        .includes(tableSearch.toLowerCase());
      const difficulty = String(route.difficulty || 'easy').toLowerCase();
      const matchesDifficulty =
        activeFilter === 'All' || difficulty === activeFilter.toLowerCase();

      return matchesSearch && matchesDifficulty;
    });
  }, [activeFilter, routes, tableSearch]);

  const activeCount = routes.filter((route) => (route.status || 'active') === 'active').length;
  const draftCount = routes.filter((route) => route.status === 'draft').length;

  function handleFormChange(event) {
    const { name, value } = event.target;
    setRouteForm((currentForm) => ({ ...currentForm, [name]: value }));
  }

  function handleMapChange(nextValues) {
    setRouteForm((currentForm) => ({
      ...currentForm,
      ...nextValues,
      startLat: String(nextValues.startLat ?? currentForm.startLat),
      startLng: String(nextValues.startLng ?? currentForm.startLng),
      endLat: String(nextValues.endLat ?? currentForm.endLat),
      endLng: String(nextValues.endLng ?? currentForm.endLng),
      distanceKm: String(nextValues.distanceKm ?? currentForm.distanceKm),
      estimatedTimeMinutes: String(nextValues.estimatedTimeMinutes ?? currentForm.estimatedTimeMinutes),
    }));
  }

  async function handleSubmitRoute(event) {
    event.preventDefault();
    setSaving(true);
    setErrorMessage('');
    setSuccessMessage('');

    if (!routeForm.startLat || !routeForm.startLng || !routeForm.endLat || !routeForm.endLng) {
      setErrorMessage('Start and destination coordinates are required.');
      setSaving(false);
      return;
    }

    try {
      const payload = buildRoutePayload(routeForm);
      const response = editingRouteId
        ? await api.patch(`/admin/routes/${editingRouteId}`, payload)
        : await api.post('/admin/routes', payload);

      setSuccessMessage(
        editingRouteId
          ? 'Route updated. Mobile route discovery will reflect the latest data.'
          : 'Route created. Active routes can now appear in mobile discovery.'
      );
      setEditingRouteId(null);
      setRouteForm(emptyRouteForm);
      setShowForm(false);

      if (response.data.route) {
        setRoutes((currentRoutes) => [
          response.data.route,
          ...currentRoutes.filter((route) => route.id !== response.data.route.id),
        ]);
      } else {
        await loadRoutes();
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Unable to save route.');
    } finally {
      setSaving(false);
    }
  }

  async function handleArchiveRoute(route) {
    try {
      const response = await api.patch(`/admin/routes/${route.id}`, { status: 'archived' });
      setRoutes((currentRoutes) =>
        currentRoutes.map((item) => (item.id === route.id ? response.data.route : item))
      );
      setSuccessMessage(`${route.name || route.title} archived.`);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Unable to archive route.');
    }
  }

  function handleEditRoute(route) {
    setEditingRouteId(route.id);
    setRouteForm(buildRouteFormFromRoute(route));
    setShowForm(true);
    setSuccessMessage('');
    setErrorMessage('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleOpenCreateForm() {
    setEditingRouteId(null);
    setRouteForm(emptyRouteForm);
    setShowForm(true);
  }

  function handleCloseForm() {
    setEditingRouteId(null);
    setRouteForm(emptyRouteForm);
    setShowForm(false);
  }

  return (
    <section className="routes-page">
      <Header
        actions={
          <button className="filled-action" onClick={handleOpenCreateForm} type="button">
            + New Route
          </button>
        }
        subtitle={`${activeCount} active cleanup routes`}
        title="Route Management"
      />

      {errorMessage ? <p className="error">{errorMessage}</p> : null}
      {successMessage ? <p className="success">{successMessage}</p> : null}

      {showForm ? (
        <RouteForm
          editingRouteId={editingRouteId}
          form={routeForm}
          onCancel={handleCloseForm}
          onChange={handleFormChange}
          onMapChange={handleMapChange}
          onSubmit={handleSubmitRoute}
          saving={saving}
        />
      ) : null}

      {viewRoute ? <RouteViewModal onClose={() => setViewRoute(null)} route={viewRoute} /> : null}

      <PageStatRow>
        <StatCard
          icon={<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 18a3 3 0 1 1 0-6h12a3 3 0 1 1 0 6H6Z" fill="currentColor" /></svg>}
          label="Active Routes"
          tone="green"
          value={activeCount}
        />
        <StatCard
          icon={<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 2h4l1 2h5v2H4V4h5l1-2Zm-4 6h12l-1 11a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L6 8Z" fill="currentColor" /></svg>}
          label="Total Trash"
          tone="yellow"
          value={routes.reduce((sum, route) => sum + Number(route.trashTotal || 0), 0).toLocaleString() || '—'}
        />
        <StatCard
          icon={<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm8 1a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" fill="currentColor" /></svg>}
          label="Participants"
          tone="blue"
          value={routes.reduce((sum, route) => sum + Number(route.activeUsers || 0), 0) || '—'}
        />
        <StatCard
          icon={<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4h12v16H6zM8 8h8v2H8z" fill="currentColor" /></svg>}
          label="Drafts"
          tone="red"
          value={draftCount}
        />
      </PageStatRow>

      <section className="data-card">
        <TableToolbar
          onSearchChange={(event) => setTableSearch(event.target.value)}
          searchPlaceholder="Search routes..."
          searchValue={tableSearch}
        />

        <div className="filter-pills">
          {difficultyFilters.map((filter) => (
            <button
              className={`filter-pill${activeFilter === filter ? ' active' : ''}`}
              key={filter}
              onClick={() => setActiveFilter(filter)}
              type="button"
            >
              {filter}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="loading-state">Loading routes...</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Route</th>
                <th>Area</th>
                <th>Distance</th>
                <th>Difficulty</th>
                <th>Active Users</th>
                <th>Trash Total</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRoutes.map((route) => {
                const difficulty = String(route.difficulty || 'easy').toLowerCase();

                return (
                  <tr key={route.id}>
                    <td>
                      <div className="route-cell">
                        <span className="route-cell-icon">
                          {String(route.name || route.title || 'R')[0].toUpperCase()}
                        </span>
                        <strong>{route.name || route.title}</strong>
                      </div>
                    </td>
                    <td>{route.locationName || route.startLocation?.name || 'Route Start'}</td>
                    <td>{route.distanceKm || route.distance || 0} km</td>
                    <td>
                      <span className={`status-pill difficulty-pill ${difficulty}`}>
                        {difficulty}
                      </span>
                    </td>
                    <td>{route.activeUsers ?? '—'}</td>
                    <td>{route.trashTotal ?? route.minimumTrashRequired ?? '—'}</td>
                    <td>
                      <StatusBadge status={route.status || 'active'} />
                    </td>
                    <td>
                      <div className="table-actions">
                        <IconActionButton
                          label="View route"
                          onClick={() => setViewRoute(route)}
                          variant="view"
                        />
                        <IconActionButton label="Edit route" onClick={() => handleEditRoute(route)} variant="edit" />
                        <IconActionButton
                          label="Archive route"
                          onClick={() => handleArchiveRoute(route)}
                          variant="delete"
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>
    </section>
  );
}
