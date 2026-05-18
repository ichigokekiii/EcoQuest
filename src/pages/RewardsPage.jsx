﻿import Header from "../components/Header";

const rewardFilters = [
  "All Categories",
  "Physical Goods",
  "Donations",
  "Digital Cards",
];

const rewardItems = [
  {
    title: "Eco Bottle",
    points: "500 pts",
    category: "PHYSICAL GOODS",
    stock: "142 units",
    status: "Active",
    tag: "Featured",
    image:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Plant 5 Trees",
    points: "1200 pts",
    category: "DONATIONS",
    stock: "Unlimited",
    status: "Active",
    tag: null,
    image:
      "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Organic Tote",
    points: "350 pts",
    category: "PHYSICAL GOODS",
    stock: "0 units",
    status: "Inactive",
    tag: "Out of Stock",
    image:
      "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=80",
  },
];

function RewardCard({ item }) {
  return (
    <article className="reward-card">
      <div
        className="reward-card-media"
        style={{ backgroundImage: `url(${item.image})` }}
      >
        <div className="reward-card-chip-row">
          {item.tag ? <span className="reward-chip">{item.tag}</span> : null}
          <button
            type="button"
            className="reward-card-menu"
            aria-label="More options"
          >
            ⋮
          </button>
        </div>
      </div>

      <div className="reward-card-body">
        <div className="reward-card-title-row">
          <div>
            <h3>{item.title}</h3>
            <p className="reward-card-category">{item.category}</p>
          </div>
          <span className="reward-value">{item.points}</span>
        </div>

        <div className="reward-card-stock">
          <span>Stock Level</span>
          <strong>{item.stock}</strong>
        </div>

        <div className="reward-card-footer">
          <button
            type="button"
            className={`status-toggle${item.status === "Active" ? " active" : ""}`}
          >
            {item.status}
          </button>
          <button type="button" className="reward-edit">
            Edit
          </button>
        </div>
      </div>
    </article>
  );
}

function RewardsPage() {
  return (
    <section className="rewards-page">
      <Header
        title="Rewards Catalog"
        subtitle="Manage available rewards and track inventory."
        searchPlaceholder="Search rewards, users..."
        actions={
          <button type="button" className="filled-action">
            + Add New Reward
          </button>
        }
      />

      <section
        className="rewards-toolbar"
        aria-label="Rewards filters and sort"
      >
        <div className="rewards-filter-list">
          {rewardFilters.map((filter, index) => (
            <button
              key={filter}
              type="button"
              className={`filter-pill${index === 0 ? " active" : ""}`}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className="rewards-sort">
          <label htmlFor="sort-select">Sort by:</label>
          <select id="sort-select">
            <option>Most Popular</option>
            <option>Highest Points</option>
            <option>Lowest Points</option>
          </select>
        </div>
      </section>

      <section className="rewards-grid" aria-label="Rewards catalog">
        {rewardItems.map((item) => (
          <RewardCard key={item.title} item={item} />
        ))}

        <article className="reward-create-card">
          <button type="button" className="create-reward-button">
            <span>+</span>
            <strong>Create Reward</strong>
            <p>Add a new item or donation option to the catalog.</p>
          </button>
        </article>
      </section>
    </section>
  );
}

export default RewardsPage;
