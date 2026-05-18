import { useEffect, useMemo, useState } from 'react';

import Header from '../components/Header';
import IconActionButton from '../components/IconActionButton';
import PageStatRow from '../components/PageStatRow';
import PointsValue from '../components/PointsValue';
import StatCard from '../components/StatCard';
import api from '../services/api';

const emptyMissionForm = {
  title: '',
  routeIds: [],
  requiredTrashCount: '5',
  trashCategoryId: '',
  trashCategoryName: '',
  pointsReward: '20',
  status: 'active',
};

function normalizeMissionRouteIds(mission) {
  if (Array.isArray(mission.routeIds) && mission.routeIds.length > 0) {
    return mission.routeIds;
  }

  return mission.routeId ? [mission.routeId] : [];
}

function buildMissionForm(mission) {
  return {
    title: mission.title || '',
    routeIds: normalizeMissionRouteIds(mission),
    requiredTrashCount: String(mission.requiredTrashCount ?? '5'),
    trashCategoryId: mission.trashCategoryId || '',
    trashCategoryName: mission.trashCategoryName || '',
    pointsReward: String(mission.pointsReward ?? '20'),
    status: mission.status || 'active',
  };
}

function MissionForm({ editingMissionId, onCancel, form, routes, categories, saving, onChange, onRouteToggle, onSubmit }) {
  return (
    <section className="data-card page-form-card collapsible-form">
      <div className="section-head">
        <div>
          <h2>{editingMissionId ? 'Edit Mission' : 'Create Mission'}</h2>
          <p>Attach cleanup goals to one or more admin-created routes.</p>
        </div>
        <button className="outline-action" onClick={onCancel} type="button">
          Close
        </button>
      </div>

      <form className="form-grid" onSubmit={onSubmit}>
        <label className="field">
          <span>Title</span>
          <input name="title" onChange={onChange} required value={form.title} />
        </label>

        <fieldset className="field wide mission-route-fieldset">
          <legend>Routes</legend>
          {routes.length === 0 ? (
            <p className="muted">Create a route before attaching missions.</p>
          ) : (
            <div className="mission-route-checklist">
              {routes.map((route) => {
                const isChecked = form.routeIds.includes(route.id);

                return (
                  <label className="mission-route-option" key={route.id}>
                    <input
                      checked={isChecked}
                      onChange={() => onRouteToggle(route.id)}
                      type="checkbox"
                    />
                    <span>{route.name || route.title}</span>
                  </label>
                );
              })}
            </div>
          )}
        </fieldset>

        <label className="field">
          <span>Trash Category</span>
          <select
            name="trashCategoryId"
            onChange={(event) => {
              const category = categories.find((item) => item.id === event.target.value);
              onChange({
                target: { name: 'trashCategoryId', value: event.target.value },
              });
              onChange({
                target: { name: 'trashCategoryName', value: category?.name || '' },
              });
            }}
            required
            value={form.trashCategoryId}
          >
            <option value="">Choose category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
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
          <button className="filled-action" disabled={saving || form.routeIds.length === 0} type="submit">
            {saving ? 'Saving...' : editingMissionId ? 'Update Mission' : 'Create Mission'}
          </button>
        </div>
      </form>
    </section>
  );
}

export default function MissionPage() {
  const [missions, setMissions] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [missionForm, setMissionForm] = useState(emptyMissionForm);
  const [editingMissionId, setEditingMissionId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  async function loadMissions() {
    try {
      setLoading(true);
      setErrorMessage('');
      const [missionsResponse, routesResponse, categoriesResponse] = await Promise.all([
        api.get('/admin/missions?limit=50'),
        api.get('/admin/routes?limit=50'),
        api.get('/admin/trash-categories?limit=50'),
      ]);
      const nextRoutes = routesResponse.data.routes || [];
      const nextCategories = (categoriesResponse.data.categories || []).filter(
        (category) => category.status === 'active'
      );

      setMissions(missionsResponse.data.missions || []);
      setRoutes(nextRoutes);
      setCategories(nextCategories);
      setMissionForm((currentForm) => ({
        ...currentForm,
        routeIds:
          currentForm.routeIds.length > 0
            ? currentForm.routeIds
            : nextRoutes[0]?.id
              ? [nextRoutes[0].id]
              : [],
        trashCategoryId: currentForm.trashCategoryId || nextCategories[0]?.id || '',
        trashCategoryName: currentForm.trashCategoryName || nextCategories[0]?.name || '',
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
    return missions.filter((mission) => {
      const routeLabels = normalizeMissionRouteIds(mission)
        .map((routeId) => routeNamesById[routeId] || '')
        .join(' ');

      return `${mission.title || ''} ${routeLabels}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
    });
  }, [missions, routeNamesById, searchQuery]);

  const activeMissions = missions.filter((mission) => (mission.status || 'active') === 'active');
  const inactiveMissions = missions.filter((mission) => mission.status === 'archived' || mission.status === 'inactive');

  function handleFormChange(event) {
    const { name, value } = event.target;
    setMissionForm((currentForm) => ({ ...currentForm, [name]: value }));
  }

  function handleRouteToggle(routeId) {
    setMissionForm((currentForm) => {
      const routeIds = currentForm.routeIds.includes(routeId)
        ? currentForm.routeIds.filter((id) => id !== routeId)
        : [...currentForm.routeIds, routeId];

      return { ...currentForm, routeIds };
    });
  }

  async function handleSubmitMission(event) {
    event.preventDefault();
    setSaving(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const payload = {
        ...missionForm,
        routeIds: missionForm.routeIds,
        routeId: missionForm.routeIds[0] || '',
      };

      const response = editingMissionId
        ? await api.patch(`/admin/missions/${editingMissionId}`, payload)
        : await api.post('/admin/missions', payload);

      setMissions((currentMissions) => [
        response.data.mission,
        ...currentMissions.filter((mission) => mission.id !== response.data.mission.id),
      ]);
      setMissionForm((currentForm) => ({
        ...emptyMissionForm,
        routeIds: currentForm.routeIds,
        trashCategoryId: currentForm.trashCategoryId,
        trashCategoryName: currentForm.trashCategoryName,
      }));
      setEditingMissionId(null);
      setShowForm(false);
      setSuccessMessage(
        editingMissionId ? 'Mission updated successfully.' : 'Mission created and saved through the admin API.'
      );
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Unable to save mission.');
    } finally {
      setSaving(false);
    }
  }

  function handleEditMission(mission) {
    setEditingMissionId(mission.id);
    setMissionForm(buildMissionForm(mission));
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleToggleMission(mission) {
    const nextStatus = (mission.status || 'active') === 'active' ? 'archived' : 'active';

    try {
      const response = await api.patch(`/admin/missions/${mission.id}`, { status: nextStatus });
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
        actions={
          <button
            className="filled-action"
            onClick={() => {
              setEditingMissionId(null);
              setMissionForm({
                ...emptyMissionForm,
                routeIds: routes[0]?.id ? [routes[0].id] : [],
                trashCategoryId: categories[0]?.id || '',
                trashCategoryName: categories[0]?.name || '',
              });
              setShowForm(true);
            }}
            type="button"
          >
            + New Mission
          </button>
        }
        searchPlaceholder="Search missions..."
        searchValue={searchQuery}
        onSearchChange={(event) => setSearchQuery(event.target.value)}
        subtitle={`${activeMissions.length} active missions across all routes`}
        title="Mission Management"
      />

      {errorMessage ? <p className="error">{errorMessage}</p> : null}
      {successMessage ? <p className="success">{successMessage}</p> : null}

      {showForm ? (
        <MissionForm
          categories={categories}
          editingMissionId={editingMissionId}
          form={missionForm}
          onCancel={() => {
            setShowForm(false);
            setEditingMissionId(null);
          }}
          onChange={handleFormChange}
          onRouteToggle={handleRouteToggle}
          onSubmit={handleSubmitMission}
          routes={routes}
          saving={saving}
        />
      ) : null}

      <PageStatRow>
        <StatCard label="Active Missions" tone="green" value={activeMissions.length} />
        <StatCard
          label="Completions"
          tone="blue"
          value={missions.reduce((sum, mission) => sum + Number(mission.completedCount || 0), 0) || '—'}
        />
        <StatCard
          label="Points Awarded"
          tone="yellow"
          value={missions.reduce((sum, mission) => sum + Number(mission.pointsReward || 0), 0)}
        />
        <StatCard label="Inactive" tone="red" value={inactiveMissions.length} />
      </PageStatRow>

      {loading ? (
        <p className="loading-state">Loading missions...</p>
      ) : (
        <section className="mission-grid">
          {filteredMissions.map((mission) => {
            const isActive = (mission.status || 'active') === 'active';
            const linkedRouteIds = normalizeMissionRouteIds(mission);
            const routeLabel =
              linkedRouteIds.length === 0
                ? 'Any'
                : linkedRouteIds.length === 1
                  ? routeNamesById[linkedRouteIds[0]] || 'Route'
                  : `${linkedRouteIds.length} routes`;

            return (
              <article className="mission-card mission-card-mockup" key={mission.id}>
                <div className="mission-card-top">
                  <div className="mission-card-title-block">
                    <span className="mission-icon-tile">
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2Zm-8 13-4-4 1.4-1.4 2.6 2.6 5.6-5.6L18 9l-7 7Z" />
                      </svg>
                    </span>
                    <div>
                      <h3>{mission.title}</h3>
                      <span className="category-tag">
                        {mission.trashCategoryName || 'Collection'}
                      </span>
                    </div>
                  </div>
                  <button
                    aria-label={isActive ? 'Disable mission' : 'Enable mission'}
                    className={`mission-toggle${isActive ? ' on' : ''}`}
                    onClick={() => handleToggleMission(mission)}
                    type="button"
                  />
                </div>

                <p className="mission-card-desc">
                  Collect {mission.requiredTrashCount || 0}{' '}
                  {mission.trashCategoryName || 'trash items'} on {routeLabel}.
                </p>

                <div className="mission-card-footer-mockup">
                  <div className="mission-card-footer-meta">
                    <PointsValue value={mission.pointsReward} />
                    <span>{routeLabel}</span>
                    <span>{mission.completedCount ?? 0} completed</span>
                  </div>
                  <div className="table-actions">
                    <IconActionButton
                      label="Edit mission"
                      onClick={() => handleEditMission(mission)}
                      variant="edit"
                    />
                    <IconActionButton
                      label="Archive mission"
                      onClick={() => handleToggleMission(mission)}
                      variant="delete"
                    />
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </section>
  );
}
