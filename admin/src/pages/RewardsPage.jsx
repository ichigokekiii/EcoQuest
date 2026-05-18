import { useEffect, useMemo, useState } from 'react';

import Header from '../components/Header';
import IconActionButton from '../components/IconActionButton';
import PageStatRow from '../components/PageStatRow';
import PointsValue from '../components/PointsValue';
import StatCard from '../components/StatCard';
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

const pastelTones = ['mint', 'blue', 'yellow', 'purple', 'pink', 'red'];
const rewardIcons = ['🎁', '💧', '🎟️', '🌿', '👕', '🧢'];

export default function RewardsPage() {
  const [rewards, setRewards] = useState([]);
  const [rewardForm, setRewardForm] = useState(emptyRewardForm);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  async function loadRewards() {
    try {
      setLoading(true);
      setErrorMessage('');
      const response = await api.get('/admin/rewards?limit=50');
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

  const totalRedemptions = rewards.reduce((sum, reward) => sum + Number(reward.redeemedCount || 0), 0);
  const totalPointsSpent = rewards.reduce(
    (sum, reward) => sum + Number(reward.redeemedCount || 0) * Number(reward.pointsCost || 0),
    0
  );
  const outOfStockCount = rewards.filter((reward) => Number(reward.stock || 0) <= 0).length;

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
      setShowForm(false);
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
        actions={
          <button className="filled-action" onClick={() => setShowForm(true)} type="button">
            + Add Reward
          </button>
        }
        searchPlaceholder="Search rewards..."
        searchValue={searchQuery}
        onSearchChange={(event) => setSearchQuery(event.target.value)}
        subtitle={`${rewards.length} reward items · ${totalRedemptions.toLocaleString()} total redemptions`}
        title="Rewards Store"
      />

      {errorMessage ? <p className="error">{errorMessage}</p> : null}
      {successMessage ? <p className="success">{successMessage}</p> : null}

      {showForm ? (
        <section className="data-card page-form-card collapsible-form">
          <div className="section-head">
            <div>
              <h2>Add Reward</h2>
              <p>New rewards become available to the shared store data model.</p>
            </div>
            <button className="outline-action" onClick={() => setShowForm(false)} type="button">
              Close
            </button>
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
      ) : null}

      <PageStatRow>
        <StatCard
          icon={<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 12v8H4v-8H2l10-7 10 7h-2Z" fill="currentColor" /></svg>}
          label="Total Items"
          tone="green"
          value={rewards.length}
        />
        <StatCard
          icon={<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7h10l1 3H6l1-3Zm-1 5h12l-1 7H7l-1-7Z" fill="currentColor" /></svg>}
          label="Redemptions"
          tone="blue"
          value={totalRedemptions.toLocaleString()}
        />
        <StatCard
          icon={<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13 2 3 14h7l-1 8 10-12h-7l1-8Z" fill="currentColor" /></svg>}
          label="Points Spent"
          tone="yellow"
          value={totalPointsSpent.toLocaleString()}
        />
        <StatCard
          icon={<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a5 5 0 0 0-5 5v1H5v2h14V8h-2V7a5 5 0 0 0-5-5Z" fill="currentColor" /></svg>}
          label="Out of Stock"
          tone="red"
          value={outOfStockCount}
        />
      </PageStatRow>

      {loading ? (
        <p className="loading-state">Loading rewards...</p>
      ) : (
        <section className="rewards-grid">
          {filteredRewards.map((reward, index) => {
            const tone = pastelTones[index % pastelTones.length];
            const icon = rewardIcons[index % rewardIcons.length];
            const stock = Number(reward.stock ?? 0);

            return (
              <article className="reward-card" key={reward.id}>
                <div className={`reward-pastel-header ${tone}`}>
                  <span className="reward-category-pill">{reward.category || 'Merchandise'}</span>
                  <span className="reward-pastel-icon">{icon}</span>
                </div>
                <div className="reward-card-body">
                  <div className="reward-card-title-row">
                    <h3>{reward.name}</h3>
                    <PointsValue value={reward.pointsCost} />
                  </div>
                  <p className="muted">{reward.description || 'No description yet.'}</p>
                  <div className="reward-card-footer">
                    <div className="reward-card-stock">
                      <span>{stock <= 0 ? 'Out of stock' : `${stock} left`}</span>
                      <strong>{reward.redeemedCount ?? 0} redeemed</strong>
                    </div>
                    <div className="table-actions">
                      <IconActionButton label="Edit reward" variant="edit" />
                      <IconActionButton
                        label="Archive reward"
                        onClick={() => handleToggleReward(reward)}
                        variant="delete"
                      />
                    </div>
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
