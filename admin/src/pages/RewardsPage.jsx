import { useEffect, useMemo, useState } from 'react';

import Header from '../components/Header';
import api from '../services/api';

const emptyRewardForm = {
  name: '',
  description: '',
  pointsCost: '500',
  stock: '10',
  status: 'active',
  category: 'Eco Gear',
  imageUrl: '',
};

export default function RewardsPage() {
  const [rewards, setRewards] = useState([]);
  const [rewardForm, setRewardForm] = useState(emptyRewardForm);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  async function loadRewards() {
    try {
      setLoading(true);
      setErrorMessage('');
      const response = await api.get('/admin/rewards?limit=100');
      setRewards(response.data.rewards || []);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Unable to load rewards.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRewards();
  }, []);

  const filteredRewards = useMemo(() => {
    return rewards.filter((reward) =>
      `${reward.name || ''} ${reward.description || ''} ${reward.category || ''}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );
  }, [rewards, searchQuery]);

  function handleFormChange(event) {
    const { name, value } = event.target;
    setRewardForm((currentForm) => ({ ...currentForm, [name]: value }));
  }

  async function handleSubmitReward(event) {
    event.preventDefault();
    setSaving(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await api.post('/admin/rewards', rewardForm);
      setRewards((currentRewards) => [response.data.reward, ...currentRewards]);
      setRewardForm(emptyRewardForm);
      setSuccessMessage('Reward saved through the admin API.');
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Unable to save reward.');
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleReward(reward) {
    try {
      const nextStatus = reward.status === 'archived' ? 'active' : 'archived';
      const response = await api.patch(`/admin/rewards/${reward.id}`, { status: nextStatus });

      setRewards((currentRewards) =>
        currentRewards.map((item) => (item.id === reward.id ? response.data.reward : item))
      );
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Unable to update reward.');
    }
  }

  return (
    <section className="rewards-page">
      <Header
        title="Rewards Store"
        subtitle={`${rewards.length} reward items`}
        searchPlaceholder="Search rewards..."
        searchValue={searchQuery}
        onSearchChange={(event) => setSearchQuery(event.target.value)}
        actions={<button className="filled-action" type="button">+ Add Reward</button>}
      />

      {errorMessage ? <p className="error">{errorMessage}</p> : null}
      {successMessage ? <p className="success">{successMessage}</p> : null}

      <section className="data-card">
        <div className="section-head">
          <div>
            <h2>Add Reward</h2>
            <p>New rewards become available to the shared store data model.</p>
          </div>
        </div>
        <form className="form-grid" onSubmit={handleSubmitReward}>
          <label className="field">
            <span>Name</span>
            <input name="name" onChange={handleFormChange} required value={rewardForm.name} />
          </label>
          <label className="field">
            <span>Category</span>
            <input name="category" onChange={handleFormChange} value={rewardForm.category} />
          </label>
          <label className="field">
            <span>Points Cost</span>
            <input name="pointsCost" onChange={handleFormChange} value={rewardForm.pointsCost} />
          </label>
          <label className="field">
            <span>Stock</span>
            <input name="stock" onChange={handleFormChange} value={rewardForm.stock} />
          </label>
          <label className="field">
            <span>Status</span>
            <select name="status" onChange={handleFormChange} value={rewardForm.status}>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </label>
          <label className="field">
            <span>Image URL</span>
            <input name="imageUrl" onChange={handleFormChange} value={rewardForm.imageUrl} />
          </label>
          <label className="field wide">
            <span>Description</span>
            <textarea name="description" onChange={handleFormChange} value={rewardForm.description} />
          </label>
          <div className="form-actions">
            <button className="filled-action" disabled={saving} type="submit">
              {saving ? 'Saving...' : 'Add Reward'}
            </button>
          </div>
        </form>
      </section>

      {loading ? (
        <p className="loading-state">Loading rewards...</p>
      ) : (
        <section className="rewards-grid">
          <article className="reward-create-card">
            <button className="create-reward-button" type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <span>+</span>
              Create new reward
            </button>
          </article>

          {filteredRewards.map((reward) => (
            <article className="reward-card" key={reward.id}>
              <div
                className="reward-card-media"
                style={reward.imageUrl ? { backgroundImage: `url(${reward.imageUrl})` } : undefined}
              >
                <div className="reward-card-chip-row">
                  <span className="reward-chip">{reward.status || 'active'}</span>
                  <button className="reward-card-menu" type="button" aria-label="Reward actions">...</button>
                </div>
              </div>
              <div className="reward-card-body">
                <div className="reward-card-title-row">
                  <div>
                    <p className="reward-card-category">{reward.category || 'Eco Gear'}</p>
                    <h3>{reward.name}</h3>
                  </div>
                  <span className="reward-value">{reward.pointsCost || 0} pts</span>
                </div>
                <p className="muted">{reward.description || 'No description yet.'}</p>
                <div className="reward-card-footer">
                  <div className="reward-card-stock">
                    <span>Stock</span>
                    <strong>{reward.stock ?? 0}</strong>
                  </div>
                  <button className="reward-edit" onClick={() => handleToggleReward(reward)} type="button">
                    {reward.status === 'archived' ? 'Restore' : 'Archive'}
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
