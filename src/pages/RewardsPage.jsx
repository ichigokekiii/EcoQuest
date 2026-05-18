﻿import React, { useState, useEffect } from "react";
import Header from "../components/Header";

const rewardFilters = [
  "All Categories",
  "Physical Goods",
  "Donations",
  "Digital Cards",
];

function RewardCard({ item, onDelete }) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <article className="reward-card">
      <div
        className="reward-card-media"
        style={{
          backgroundImage: `url(${item.image || "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=80"})`,
        }}
      >
        <div className="reward-card-chip-row" style={{ position: "relative" }}>
          {item.tag ? <span className="reward-chip">{item.tag}</span> : null}

          <button
            type="button"
            className="reward-card-menu"
            aria-label="More options"
            onClick={() => setShowMenu(!showMenu)}
          >
            ⋮
          </button>

          {showMenu && (
            <div
              className="reward-dropdown-menu"
              style={{
                position: "absolute",
                right: 0,
                top: "100%",
                background: "#fff",
                border: "1px solid #ddd",
                borderRadius: "4px",
                zIndex: 10,
                boxShadow: "0 2px 5px rgba(0,0,0,0.15)",
              }}
            >
              <button
                type="button"
                onClick={() => {
                  if (
                    window.confirm(
                      `Are you sure you want to delete "${item.title}"?`,
                    )
                  ) {
                    onDelete(item.id);
                  }
                  setShowMenu(false);
                }}
                style={{
                  color: "#dc3545",
                  padding: "0.5rem 1rem",
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                  width: "100%",
                  textAlign: "left",
                }}
              >
                Delete Reward
              </button>
            </div>
          )}
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
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All Categories");
  const [sortOption, setSortOption] = useState("Most Popular");

  useEffect(() => {
    setLoading(true);
    fetch("http://localhost/EcoQuest/api/index.php?endpoint=rewards")
      .then((res) => res.json())
      .then((data) => {
        if (!Array.isArray(data)) {
          console.error("API did not return a valid data matrix array:", data);
          setRewards([]);
          setLoading(false);
          return;
        }

        const mappedData = data.map((row) => {
          const stockNum =
            row.stock_level === null
              ? "Unlimited"
              : parseInt(row.stock_level, 10);
          let inferredTag = null;
          if (parseInt(row.is_featured, 10) === 1) inferredTag = "Featured";
          if (stockNum === 0) inferredTag = "Out of Stock";

          return {
            id: parseInt(row.id, 10),
            title: row.title,
            category: row.category || "PHYSICAL GOODS",
            points: `${row.points_required} pts`,
            stock: stockNum === "Unlimited" ? "Unlimited" : `${stockNum} units`,
            status: row.status || "Active",
            tag: inferredTag,
            image: row.image_url,
            isFeatured: parseInt(row.is_featured, 10) || 0,
            pointsRaw: parseInt(row.points_required, 10) || 0,
          };
        });
        setRewards(mappedData);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Database structural stream matrix sync exception:", err);
        setLoading(false);
      });
  }, []);

  const handleDeleteReward = (id) => {
    fetch(`http://localhost/EcoQuest/api/index.php?endpoint=rewards&id=${id}`, {
      method: "DELETE",
    })
      .then((res) => res.json())
      .then(() => {
        setRewards((prev) => prev.filter((item) => item.id !== id));
      })
      .catch((err) =>
        console.error("Error executing tracking sequence elimination:", err),
      );
  };

  // Normalization logic mapping string variations tightly
  const processedRewards = rewards
    .filter((item) => {
      const matchesSearch = item.title
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesCategory =
        activeCategory === "All Categories" ||
        item.category?.trim().toLowerCase() ===
          activeCategory?.trim().toLowerCase();
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortOption === "Most Popular") return b.isFeatured - a.isFeatured;
      if (sortOption === "Highest Points") return b.pointsRaw - a.pointsRaw;
      if (sortOption === "Lowest Points") return a.pointsRaw - b.pointsRaw;
      return 0;
    });

  return (
    <section className="rewards-page">
      <Header
        title="Rewards Catalog"
        subtitle="Manage available rewards and track inventory."
        searchPlaceholder="Search rewards..."
        onSearchChange={(e) => setSearchQuery(e.target.value)}
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
          {rewardFilters.map((filter) => (
            <button
              key={filter}
              type="button"
              className={`filter-pill${activeCategory === filter ? " active" : ""}`}
              onClick={() => setActiveCategory(filter)}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className="rewards-sort">
          <label htmlFor="sort-select">Sort by:</label>
          <select
            id="sort-select"
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
          >
            <option>Most Popular</option>
            <option>Highest Points</option>
            <option>Lowest Points</option>
          </select>
        </div>
      </section>

      <section className="rewards-grid" aria-label="Rewards catalog">
        {loading ? (
          <div style={{ padding: "2rem", color: "var(--text-muted)" }}>
            Syncing live database rewards catalog...
          </div>
        ) : processedRewards.length > 0 ? (
          processedRewards.map((item) => (
            <RewardCard
              key={item.id || item.title}
              item={item}
              onDelete={handleDeleteReward}
            />
          ))
        ) : (
          <div style={{ padding: "2rem", color: "var(--text-muted)" }}>
            No available rewards match the filtering layout constraints.
          </div>
        )}

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
