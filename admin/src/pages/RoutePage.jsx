import { useEffect, useMemo, useState } from 'react';

import Header from '../components/Header';
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
};

const routeFilters = ['All', 'Active', 'Draft', 'Archived'];

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
  };
}

function RouteForm({ editingRouteId, form, onCancel, onChange, onSubmit, saving }) {
  return (
    <section className="data-card">
      <div className="section-head">
        <div>
          <h2>{editingRouteId ? 'Edit Cleanup Route' : 'Create Cleanup Route'}</h2>
          <p>Active routes are written through Express and appear in mobile discovery.</p>
        </div>
      </div>

      <form className="form-grid" onSubmit={onSubmit}>
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
          <span>Start Latitude</span>
          <input name="startLat" onChange={onChange} value={form.startLat} />
        </label>

        <label className="field">
          <span>Start Longitude</span>
          <input name="startLng" onChange={onChange} value={form.startLng} />
        </label>

        <label className="field">
          <span>End Latitude</span>
          <input name="endLat" onChange={onChange} value={form.endLat} />
        </label>

        <label className="field">
          <span>End Longitude</span>
          <input name="endLng" onChange={onChange} value={form.endLng} />
        </label>

        <label className="field">
          <span>Distance (km)</span>
          <input name="distanceKm" onChange={onChange} value={form.distanceKm} />
        </label>

        <label className="field">
          <span>Estimated Time</span>
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

        <div className="form-actions">
          {editingRouteId ? (
            <button className="outline-action" onClick={onCancel} type="button">
              Cancel edit
            </button>
          ) : null}
          <button className="filled-action" disabled={saving} type="submit">
            {saving ? 'Saving...' : editingRouteId ? 'Update Route' : 'Create Route'}
          </button>
        </div>
      </form>
    </section>
  );
}

export default function RoutePage() {
  const [routes, setRoutes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [routeForm, setRouteForm] = useState(emptyRouteForm);
  const [editingRouteId, setEditingRouteId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  async function loadRoutes() {
    try {
      setLoading(true);
      setErrorMessage('');
      const response = await api.get('/admin/routes?limit=100');
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
      const matchesSearch = `${route.name || route.title || ''} ${route.description || ''}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesStatus =
        activeFilter === 'All' || (route.status || 'active').toLowerCase() === activeFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [activeFilter, routes, searchQuery]);

  function handleFormChange(event) {
    const { name, value } = event.target;
    setRouteForm((currentForm) => ({ ...currentForm, [name]: value }));
  }

  async function handleSubmitRoute(event) {
    event.preventDefault();
    setSaving(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = editingRouteId
        ? await api.patch(`/admin/routes/${editingRouteId}`, routeForm)
        : await api.post('/admin/routes', routeForm);

      setSuccessMessage(
        editingRouteId
          ? 'Route updated. Mobile route discovery will reflect the latest data.'
          : 'Route created. Active routes can now appear in mobile discovery.'
      );
      setEditingRouteId(null);
      setRouteForm(emptyRouteForm);

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

  function handleEditRoute(route) {
    setEditingRouteId(route.id);
    setRouteForm(buildRouteFormFromRoute(route));
    setSuccessMessage('');
    setErrorMessage('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleCancelEdit() {
    setEditingRouteId(null);
    setRouteForm(emptyRouteForm);
  }

  return (
    <section className="routes-page">
      <Header
        title="Route Management"
        subtitle={`${routes.length} cleanup routes`}
        searchPlaceholder="Search routes..."
        searchValue={searchQuery}
        onSearchChange={(event) => setSearchQuery(event.target.value)}
        actions={<button className="filled-action" type="button">+ New Route</button>}
      />

      {errorMessage ? <p className="error">{errorMessage}</p> : null}
      {successMessage ? <p className="success">{successMessage}</p> : null}

      <RouteForm
        editingRouteId={editingRouteId}
        form={routeForm}
        onCancel={handleCancelEdit}
        onChange={handleFormChange}
        onSubmit={handleSubmitRoute}
        saving={saving}
      />

      <section className="toolbar-row">
        <div className="filter-pills">
          {routeFilters.map((filter) => (
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
        <button className="dropdown-button" onClick={loadRoutes} type="button">
          Refresh
        </button>
      </section>

      {loading ? (
        <p className="loading-state">Loading routes...</p>
      ) : (
        <section className="route-grid">
          {filteredRoutes.map((route) => (
            <article className="route-card" key={route.id}>
              <div className="route-card-media">
                <span className={`route-status route-status-${route.status || 'active'}`}>
                  {route.status || 'active'}
                </span>
              </div>
              <div className="route-card-body">
                <div className="route-title-row">
                  <div>
                    <h3>{route.name || route.title}</h3>
                    <p className="route-location">
                      {route.locationName || route.startLocation?.name || 'Route Start'}
                    </p>
                  </div>
                  <span className="route-badge">{String(route.difficulty || 'E')[0].toUpperCase()}</span>
                </div>
                <dl className="route-stats">
                  <div>
                    <dt>Distance</dt>
                    <dd>{route.distanceKm || route.distance || 0} km</dd>
                  </div>
                  <div>
                    <dt>Goal</dt>
                    <dd>{route.minimumTrashRequired || route.targetTrash || 0}</dd>
                  </div>
                  <div>
                    <dt>Points</dt>
                    <dd>{route.basePoints || route.points || 0}</dd>
                  </div>
                </dl>
                <div className="route-card-footer">
                  <span className="route-difficulty">{route.difficulty || 'easy'}</span>
                  <button className="route-action solid" onClick={() => handleEditRoute(route)} type="button">
                    Edit Route
                  </button>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}
    </section>
  );
}
