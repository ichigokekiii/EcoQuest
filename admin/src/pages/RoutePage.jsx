import { useEffect, useMemo, useState } from 'react';

import Header from '../components/Header';
import IconActionButton from '../components/IconActionButton';
import Modal from '../components/Modal';
import PageStatRow from '../components/PageStatRow';
import RouteFormModal from '../components/RouteFormModal';
import RouteMapPicker from '../components/RouteMapPicker';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import TableToolbar from '../components/TableToolbar';
import api from '../services/api';
import {
  buildRouteFormFromRoute,
  emptyRouteForm,
} from '../utils/routeForm';

const difficultyFilters = ['All', 'Easy', 'Medium', 'Hard'];

function RouteViewModal({ route, onClose }) {
  if (!route) {
    return null;
  }

  return (
    <Modal onClose={onClose}>
      <div className="modal-backdrop" onClick={onClose} role="presentation">
        <section
          aria-modal="true"
          className="modal-card route-view-modal"
          onClick={(event) => event.stopPropagation()}
          role="dialog"
        >
          <div className="section-head">
            <div>
              <h2>{route.name || route.title}</h2>
              <p>{route.description || 'No description provided.'}</p>
            </div>
            <button className="outline-action" onClick={onClose} type="button">
              Close
            </button>
          </div>
          <RouteMapPicker readOnly layout="overlay" value={buildRouteFormFromRoute(route)} />
          <div className="route-view-meta">
            <StatusBadge status={route.status || 'active'} />
            <span>{route.distanceKm || 0} km</span>
            <span>{route.estimatedTimeMinutes || 0} min</span>
            <span>{String(route.difficulty || 'easy')}</span>
          </div>
        </section>
      </div>
    </Modal>
  );
}

function RouteDeleteModal({ route, onClose, onConfirm, deleting }) {
  if (!route) {
    return null;
  }

  return (
    <Modal onClose={onClose}>
      <div className="modal-backdrop" onClick={onClose} role="presentation">
        <section
          aria-modal="true"
          className="modal-card route-delete-modal"
          onClick={(event) => event.stopPropagation()}
          role="dialog"
        >
          <div className="section-head">
            <div>
              <h2>Delete Route</h2>
              <p>
                Permanently remove <strong>{route.name || route.title}</strong> from Firestore? This
                cannot be undone.
              </p>
            </div>
          </div>
          <div className="route-form-modal-footer">
            <button className="outline-action" disabled={deleting} onClick={onClose} type="button">
              Cancel
            </button>
            <button className="filled-action danger-action" disabled={deleting} onClick={onConfirm} type="button">
              {deleting ? 'Deleting...' : 'Delete Route'}
            </button>
          </div>
        </section>
      </div>
    </Modal>
  );
}

export default function RoutePage() {
  const [routes, setRoutes] = useState([]);
  const [tableSearch, setTableSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [formModal, setFormModal] = useState(null);
  const [viewRoute, setViewRoute] = useState(null);
  const [deleteRoute, setDeleteRoute] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [loading, setLoading] = useState(true);
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

  function handleRouteSaved(route) {
    setRoutes((currentRoutes) => [
      route,
      ...currentRoutes.filter((item) => item.id !== route.id),
    ]);
    setSuccessMessage(
      formModal?.mode === 'edit'
        ? 'Route updated. Mobile route discovery will reflect the latest data.'
        : 'Route created. Active routes can now appear in mobile discovery.'
    );
    setFormModal(null);
  }

  async function handleConfirmDelete() {
    if (!deleteRoute) {
      return;
    }

    setDeleting(true);
    setErrorMessage('');

    try {
      await api.delete(`/admin/routes/${deleteRoute.id}`);
      setRoutes((currentRoutes) => currentRoutes.filter((item) => item.id !== deleteRoute.id));
      setSuccessMessage(`${deleteRoute.name || deleteRoute.title} deleted.`);
      setDeleteRoute(null);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Unable to delete route.');
    } finally {
      setDeleting(false);
    }
  }

  function handleEditRoute(route) {
    setFormModal({
      mode: 'edit',
      routeId: route.id,
      initialForm: buildRouteFormFromRoute(route),
    });
    setSuccessMessage('');
    setErrorMessage('');
  }

  function handleOpenCreateForm() {
    setFormModal({
      mode: 'create',
      routeId: null,
      initialForm: emptyRouteForm,
    });
    setSuccessMessage('');
    setErrorMessage('');
  }

  return (
    <section className="routes-page">
      <Header
        actions={
          <button className="filled-action" onClick={handleOpenCreateForm} type="button">
            Create Route
          </button>
        }
        subtitle={`${activeCount} active cleanup routes`}
        title="Route Management"
      />

      {errorMessage ? <p className="error">{errorMessage}</p> : null}
      {successMessage ? <p className="success">{successMessage}</p> : null}

      {formModal ? (
        <RouteFormModal
          initialForm={formModal.initialForm}
          mode={formModal.mode}
          onClose={() => setFormModal(null)}
          onSaved={handleRouteSaved}
          routeId={formModal.routeId}
        />
      ) : null}

      {viewRoute ? <RouteViewModal onClose={() => setViewRoute(null)} route={viewRoute} /> : null}

      {deleteRoute ? (
        <RouteDeleteModal
          deleting={deleting}
          onClose={() => setDeleteRoute(null)}
          onConfirm={handleConfirmDelete}
          route={deleteRoute}
        />
      ) : null}

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
                          label="Delete route"
                          onClick={() => setDeleteRoute(route)}
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
