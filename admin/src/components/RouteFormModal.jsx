import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

import Modal from './Modal';
import RouteMapPicker from './RouteMapPicker';
import api from '../services/api';
import { buildRoutePayload, emptyRouteForm } from '../utils/routeForm';

export default function RouteFormModal({ initialForm, mode, onClose, onSaved, routeId }) {
  const [form, setForm] = useState(initialForm || emptyRouteForm);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const isEdit = mode === 'edit';

  useEffect(() => {
    setForm(initialForm || emptyRouteForm);
    setErrorMessage('');
  }, [initialForm, mode, routeId]);

  function handleFormChange(event) {
    const { name, value } = event.target;
    setForm((currentForm) => ({ ...currentForm, [name]: value }));
  }

  function handleMapChange(nextValues) {
    setForm((currentForm) => ({
      ...currentForm,
      ...nextValues,
      startLat: String(nextValues.startLat ?? currentForm.startLat),
      startLng: String(nextValues.startLng ?? currentForm.startLng),
      endLat: String(nextValues.endLat ?? currentForm.endLat),
      endLng: String(nextValues.endLng ?? currentForm.endLng),
      distanceKm: String(nextValues.distanceKm ?? currentForm.distanceKm),
      estimatedTimeMinutes: String(
        nextValues.estimatedTimeMinutes ?? currentForm.estimatedTimeMinutes
      ),
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setErrorMessage('');

    if (!form.startLat || !form.startLng || !form.endLat || !form.endLng) {
      setErrorMessage('Starting and end locations are required. Search both locations on the map.');
      setSaving(false);
      return;
    }

    try {
      const payload = buildRoutePayload(form);
      const response = isEdit
        ? await api.patch(`/admin/routes/${routeId}`, payload)
        : await api.post('/admin/routes', payload);

      onSaved(response.data.route);
      onClose();
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Unable to save route.');
    } finally {
      setSaving(false);
    }
  }

  const canSave =
    Boolean(form.startLat && form.startLng && form.endLat && form.endLng) && !saving;

  return (
    <Modal onClose={onClose}>
      <div className="modal-backdrop" onClick={onClose} role="presentation">
        <section
          aria-labelledby="route-form-modal-title"
          aria-modal="true"
          className="modal-card route-form-modal"
          onClick={(event) => event.stopPropagation()}
          role="dialog"
        >
          <header className="route-form-modal-header">
            <div>
              <h2 id="route-form-modal-title">{isEdit ? 'Edit Route' : 'Create Route'}</h2>
              <p className="muted">
                Search a start and end like a navigation app, then fill in route details.
              </p>
            </div>
            <button
              aria-label="Close"
              className="route-form-modal-close"
              onClick={onClose}
              type="button"
            >
              <X aria-hidden="true" size={20} />
            </button>
          </header>

          <form className="route-form-modal-body" onSubmit={handleSubmit}>
            <div className="route-form-primary-fields">
              <label className="field">
                <span>Name</span>
                <input name="name" onChange={handleFormChange} required value={form.name} />
              </label>

              <label className="field wide">
                <span>Description</span>
                <textarea name="description" onChange={handleFormChange} value={form.description} />
              </label>
            </div>

            <RouteMapPicker
              key={routeId || 'create-route'}
              layout="overlay"
              onChange={handleMapChange}
              value={form}
            />

            <div className="form-grid route-form-grid">
              <label className="field">
                <span>Difficulty</span>
                <select name="difficulty" onChange={handleFormChange} value={form.difficulty}>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </label>

              <label className="field">
                <span>Status</span>
                <select name="status" onChange={handleFormChange} value={form.status}>
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="archived">Archived</option>
                </select>
              </label>

              <label className="field">
                <span>Distance (km)</span>
                <input name="distanceKm" onChange={handleFormChange} value={form.distanceKm} />
              </label>

              <label className="field">
                <span>Estimated Time (min)</span>
                <input
                  name="estimatedTimeMinutes"
                  onChange={handleFormChange}
                  value={form.estimatedTimeMinutes}
                />
              </label>

              <label className="field">
                <span>Minimum Trash</span>
                <input
                  name="minimumTrashRequired"
                  onChange={handleFormChange}
                  value={form.minimumTrashRequired}
                />
              </label>

              <label className="field">
                <span>Visual Goal</span>
                <input name="visualMaxGoal" onChange={handleFormChange} value={form.visualMaxGoal} />
              </label>

              <label className="field">
                <span>Base Points</span>
                <input name="basePoints" onChange={handleFormChange} value={form.basePoints} />
              </label>

              <label className="field">
                <span>Points Per Trash</span>
                <input name="pointsPerTrash" onChange={handleFormChange} value={form.pointsPerTrash} />
              </label>

              <label className="field">
                <span>Bonus Points</span>
                <input
                  name="bonusPointsPerExtraTrash"
                  onChange={handleFormChange}
                  value={form.bonusPointsPerExtraTrash}
                />
              </label>

              <p className="field wide muted">
                Path points saved: {Array.isArray(form.path) ? form.path.length : 0}
                {form.status === 'active' && (!form.path || form.path.length === 0)
                  ? ' · Active routes should include a calculated path when possible.'
                  : ''}
              </p>

              {errorMessage ? <p className="field wide error">{errorMessage}</p> : null}
            </div>

            <footer className="route-form-modal-footer">
              <button className="outline-action" onClick={onClose} type="button">
                Cancel
              </button>
              <button className="filled-action" disabled={!canSave} type="submit">
                {saving ? 'Saving...' : isEdit ? 'Save Route' : 'Add Route'}
              </button>
            </footer>
          </form>
        </section>
      </div>
    </Modal>
  );
}
