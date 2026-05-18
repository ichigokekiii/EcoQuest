import { useEffect, useMemo, useState } from 'react';

import Header from '../components/Header';
import api from '../services/api';

const emptyMissionForm = {
  title: '',
  routeId: '',
  requiredTrashCount: '5',
  trashCategoryId: 'cat-plastic',
  trashCategoryName: 'Plastic',
  pointsReward: '20',
  status: 'active',
};

function MissionForm({ form, routes, saving, onChange, onSubmit }) {
  return (
    <section className="data-card">
      <div className="section-head">
        <div>
          <h2>Create Mission</h2>
          <p>Attach cleanup goals to admin-created routes.</p>
        </div>
      </div>

      <form className="form-grid" onSubmit={onSubmit}>
        <label className="field">
          <span>Title</span>
          <input name="title" onChange={onChange} required value={form.title} />
        </label>

        <label className="field">
          <span>Route</span>
          <select name="routeId" onChange={onChange} required value={form.routeId}>
            <option value="">Choose route</option>
            {routes.map((route) => (
              <option key={route.id} value={route.id}>
                {route.name || route.title}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Category Name</span>
          <input name="trashCategoryName" onChange={onChange} value={form.trashCategoryName} />
        </label>

        <label className="field">
          <span>Category ID</span>
          <input name="trashCategoryId" onChange={onChange} value={form.trashCategoryId} />
        </label>

        <label className="field">
          <span>Required Trash</span>
          <input name="requiredTrashCount" onChange={onChange} value={form.requiredTrashCount} />
        </label>

        <label className="field">
          <span>Points Reward</span>
          <input name="pointsReward" onChange={onChange} value={form.pointsReward} />
        </label>

        <label className="field">
          <span>Status</span>
          <select name="status" onChange={onChange} value={form.status}>
            <option value="active">Active</option>
            <option value="scheduled">Scheduled</option>
            <option value="archived">Archived</option>
          </select>
        </label>

        <div className="form-actions">
          <button className="filled-action" disabled={saving} type="submit">
            {saving ? 'Saving...' : 'Create Mission'}
          </button>
        </div>
      </form>
    </section>
  );
}

export default function MissionPage() {
  const [missions, setMissions] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [missionForm, setMissionForm] = useState(emptyMissionForm);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  async function loadMissions() {
    try {
      setLoading(true);
      setErrorMessage('');
      const [missionsResponse, routesResponse] = await Promise.all([
        api.get('/admin/missions?limit=100'),
        api.get('/admin/routes?limit=100'),
      ]);
      const nextRoutes = routesResponse.data.routes || [];

      setMissions(missionsResponse.data.missions || []);
      setRoutes(nextRoutes);
      setMissionForm((currentForm) => ({
        ...currentForm,
        routeId: currentForm.routeId || nextRoutes[0]?.id || '',
      }));
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Unable to load missions.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMissions();
  }, []);

  const routeNamesById = useMemo(() => {
    return Object.fromEntries(routes.map((route) => [route.id, route.name || route.title]));
  }, [routes]);

  const filteredMissions = useMemo(() => {
    return missions.filter((mission) =>
      `${mission.title || ''} ${routeNamesById[mission.routeId] || ''}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );
  }, [missions, routeNamesById, searchQuery]);

  function handleFormChange(event) {
    const { name, value } = event.target;
    setMissionForm((currentForm) => ({ ...currentForm, [name]: value }));
  }

  async function handleSubmitMission(event) {
    event.preventDefault();
    setSaving(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await api.post('/admin/missions', missionForm);
      setMissions((currentMissions) => [response.data.mission, ...currentMissions]);
      setMissionForm((currentForm) => ({
        ...emptyMissionForm,
        routeId: currentForm.routeId,
      }));
      setSuccessMessage('Mission created and saved through the admin API.');
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Unable to save mission.');
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(mission, status) {
    try {
      const response = await api.patch(`/admin/missions/${mission.id}`, { status });
      setMissions((currentMissions) =>
        currentMissions.map((item) => (item.id === mission.id ? response.data.mission : item))
      );
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Unable to update mission.');
    }
  }

  return (
    <section className="missions-page">
      <Header
        title="Mission Management"
        subtitle={`${missions.length} active missions`}
        searchPlaceholder="Search missions..."
        searchValue={searchQuery}
        onSearchChange={(event) => setSearchQuery(event.target.value)}
        actions={<button className="filled-action" type="button">+ New Mission</button>}
      />

      {errorMessage ? <p className="error">{errorMessage}</p> : null}
      {successMessage ? <p className="success">{successMessage}</p> : null}

      <MissionForm
        form={missionForm}
        routes={routes}
        saving={saving}
        onChange={handleFormChange}
        onSubmit={handleSubmitMission}
      />

      {loading ? (
        <p className="loading-state">Loading missions...</p>
      ) : (
        <section className="mission-grid">
          {filteredMissions.map((mission) => (
            <article className="mission-card" key={mission.id}>
              <div className="mission-card-header">
                <div>
                  <h3>{mission.title}</h3>
                  <span className="mission-category-pill">
                    {mission.trashCategoryName || 'Collection'}
                  </span>
                </div>
                <span className={`mission-card-badge mission-card-badge-${mission.status || 'active'}`}>
                  {mission.status || 'active'}
                </span>
              </div>

              <div className="mission-card-meta">
                <div className="mission-card-line">
                  <span className="mission-card-label">Route</span>
                  <strong>{routeNamesById[mission.routeId] || mission.routeId || 'Any Route'}</strong>
                </div>
                <div className="mission-card-line">
                  <span className="mission-card-label">Category</span>
                  <strong>{mission.trashCategoryName || mission.trashCategoryId || 'Any Trash'}</strong>
                </div>
                <div className="mission-card-line">
                  <span className="mission-card-label">Goal</span>
                  <strong>{mission.requiredTrashCount || 0} items</strong>
                </div>
                <div className="mission-card-line">
                  <span className="mission-card-label">Reward</span>
                  <strong>{mission.pointsReward || 0} pts</strong>
                </div>
              </div>

              <div className="mission-card-actions">
                <button
                  className="mission-button secondary"
                  onClick={() => handleStatusChange(mission, 'archived')}
                  type="button"
                >
                  Archive
                </button>
                <button
                  className="mission-button primary"
                  onClick={() => handleStatusChange(mission, 'active')}
                  type="button"
                >
                  Activate
                </button>
              </div>
            </article>
          ))}
        </section>
      )}
    </section>
  );
}
