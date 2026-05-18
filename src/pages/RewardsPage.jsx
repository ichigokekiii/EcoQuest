﻿import { useState, useEffect } from "react";
import Header from "../components/Header";

const categories = [
  "All Categories",
  "Physical Goods",
  "Donations",
  "Digital Cards",
];

function RewardCard({ reward, onUpdateSuccess }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: reward.title || "",
    category: reward.category || "Physical Goods",
    points_required: reward.points_required || 0,
    stock_level: reward.stock_level === null ? "Unlimited" : reward.stock_level,
    status: reward.status || "Active",
    is_featured: reward.is_featured || 0,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    // Format "Unlimited" input text back to a clean MySQL NULL state value
    const finalStock =
      editForm.stock_level?.toString().toLowerCase().trim() === "unlimited" ||
      editForm.stock_level === ""
        ? null
        : Number(editForm.stock_level);

    // Compute status automatically if stock hits 0 units flat
    const finalStatus = finalStock === 0 ? "Inactive" : editForm.status;

    const payload = {
      ...editForm,
      stock_level: finalStock,
      status: finalStatus,
      is_featured: Number(editForm.is_featured),
    };

    fetch(
      `http://localhost/EcoQuest/api/index.php?endpoint=rewards&id=${reward.id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setIsEditing(false);
          onUpdateSuccess();
        } else {
          alert(data.message || "Failed to update reward.");
        }
      })
      .catch((err) => console.error("Error writing to rewards table:", err));
  };

  // Determine dynamic overlay badge states matching design parameters
  const isOutOfStock =
    reward.stock_level !== null && Number(reward.stock_level) === 0;
  const displayStatus = isOutOfStock ? "Inactive" : reward.status;

  return (
    <article
      className="route-card"
      style={{
        display: "flex",
        flexDirection: "column",
        background: "#fff",
        borderRadius: "16px",
        overflow: "hidden",
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
      }}
    >
      {/* Media Window Container Box */}
      <div
        className="route-card-media"
        style={{ position: "relative", height: "180px", background: "#e2e8f0" }}
      >
        {/* Placeholder static graphic engine until asset system uploads path strings */}
        <div
          style={{
            width: "100%",
            height: "100%",
            background: `linear-gradient(135deg, #a3b899 0%, #6e8a6b 100%)`,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            color: "#fff",
            fontWeight: "600",
          }}
        >
          📦 {reward.title}
        </div>

        {/* Dynamic Badge Overlays matching mockup interface criteria */}
        {Number(reward.is_featured) === 1 && !isOutOfStock && (
          <span
            className="route-status"
            style={{
              position: "absolute",
              top: "12px",
              left: "12px",
              backgroundColor: "#e6fffa",
              color: "#234e52",
              border: "1px solid #b2f5ea",
            }}
          >
            Featured
          </span>
        )}
        {isOutOfStock && (
          <span
            className="route-status"
            style={{
              position: "absolute",
              top: "12px",
              left: "12px",
              backgroundColor: "#fff5f5",
              color: "#9b2c2c",
              border: "1px solid #fed7d7",
            }}
          >
            Out of Stock
          </span>
        )}
      </div>

      {/* Primary Context Card Body Content layout */}
      <div
        className="route-card-body"
        style={{
          padding: "16px",
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
        }}
      >
        {isEditing ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              flexGrow: 1,
            }}
          >
            <input
              type="text"
              name="title"
              value={editForm.title}
              onChange={handleChange}
              placeholder="Item Title"
              style={{ width: "100%", padding: "5px", fontSize: "0.9rem" }}
            />
            <select
              name="category"
              value={editForm.category}
              onChange={handleChange}
              style={{ width: "100%", padding: "5px" }}
            >
              <option value="Physical Goods">Physical Goods</option>
              <option value="Donations">Donations</option>
              <option value="Digital Cards">Digital Cards</option>
            </select>
            <input
              type="number"
              name="points_required"
              value={editForm.points_required}
              onChange={handleChange}
              placeholder="Points Required"
              style={{ width: "100%", padding: "5px" }}
            />
            <input
              type="text"
              name="stock_level"
              value={editForm.stock_level}
              onChange={handleChange}
              placeholder="Stock level or 'Unlimited'"
              style={{ width: "100%", padding: "5px" }}
            />
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "0.8rem",
                marginTop: "4px",
              }}
            >
              <input
                type="checkbox"
                name="is_featured"
                checked={Number(editForm.is_featured) === 1}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    is_featured: e.target.checked ? 1 : 0,
                  }))
                }
              />
              Set as Featured catalog item
            </label>
          </div>
        ) : (
          <div style={{ flexGrow: 1 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: "4px",
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: "1.15rem",
                  fontWeight: "700",
                  color: "#1a202c",
                }}
              >
                {reward.title}
              </h3>
              <span
                style={{
                  fontSize: "0.9rem",
                  fontWeight: "700",
                  color: "#2f5d4b",
                  background: "#edf2f7",
                  padding: "4px 8px",
                  borderRadius: "8px",
                }}
              >
                {reward.points_required} pts
              </span>
            </div>
            <p
              style={{
                margin: "0 0 16px 0",
                fontSize: "0.75rem",
                fontWeight: "700",
                color: "#a0aec0",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              {reward.category}
            </p>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderTop: "1px solid #edf2f7",
                paddingTop: "12px",
                marginBottom: "16px",
              }}
            >
              <span
                style={{
                  fontSize: "0.85rem",
                  color: "#718096",
                  fontWeight: "600",
                }}
              >
                Stock Level
              </span>
              <span
                style={{
                  fontSize: "0.9rem",
                  fontWeight: "700",
                  color: "#1a202c",
                }}
              >
                {reward.stock_level === null
                  ? "Unlimited"
                  : `${reward.stock_level} units`}
              </span>
            </div>
          </div>
        )}

        {/* Dynamic Card Action Footer Base */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "auto",
          }}
        >
          <span
            className={`route-status route-status-${displayStatus.toLowerCase()}`}
          >
            {displayStatus}
          </span>

          {isEditing ? (
            <div style={{ display: "flex", gap: "6px" }}>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                style={{
                  padding: "6px 12px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e0",
                  background: "none",
                  fontSize: "0.85rem",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="route-action solid"
                style={{
                  padding: "6px 12px",
                  borderRadius: "8px",
                  fontSize: "0.85rem",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Save
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              style={{
                padding: "6px 16px",
                borderRadius: "8px",
                border: "1px solid #cbd5e0",
                backgroundColor: "#fff",
                color: "#4a5568",
                fontWeight: "600",
                fontSize: "0.85rem",
                cursor: "pointer",
              }}
            >
              Edit
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

function RewardsPage() {
  const [rewards, setRewards] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All Categories");
  const [selectedSort, setSelectedSort] = useState("popular");
  const [loading, setLoading] = useState(true);

  // Quick-Add Creation State Configuration Management
  const [showAddCard, setShowAddCard] = useState(false);
  const [newReward, setNewReward] = useState({
    title: "",
    category: "Physical Goods",
    points_required: "",
    stock_level: "Unlimited",
    is_featured: 0,
  });

  const fetchRewards = () => {
    fetch("http://localhost/EcoQuest/api/index.php?endpoint=rewards")
      .then((res) => res.json())
      .then((data) => {
        setRewards(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error reading system database rewards matrix:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchRewards();
  }, []);

  const handleAddChange = (e) => {
    const { name, value } = e.target;
    setNewReward((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    const formattedStock =
      newReward.stock_level.toLowerCase().trim() === "unlimited" ||
      newReward.stock_level === ""
        ? null
        : Number(newReward.stock_level);

    const payload = {
      ...newReward,
      points_required: Number(newReward.points_required) || 0,
      stock_level: formattedStock,
      status: formattedStock === 0 ? "Inactive" : "Active",
    };

    fetch("http://localhost/EcoQuest/api/index.php?endpoint=rewards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setShowAddCard(false);
          setNewReward({
            title: "",
            category: "Physical Goods",
            points_required: "",
            stock_level: "Unlimited",
            is_featured: 0,
          });
          fetchRewards();
        } else {
          alert(data.message || "Failed to catalog new reward item.");
        }
      })
      .catch((err) => console.error("Error inserting catalog row data:", err));
  };

  // Processing Filter Engine Pipeline Matrix Execution
  const processedRewards = rewards
    .filter((item) => {
      const matchesSearch = item.title
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesCategory =
        activeCategory === "All Categories" || item.category === activeCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (selectedSort === "popular") return b.is_featured - a.is_featured; // Featured items appear first
      if (selectedSort === "cost-high")
        return b.points_required - a.points_required;
      if (selectedSort === "cost-low")
        return a.points_required - b.points_required;
      return 0;
    });

  return (
    <section className="route-page">
      <Header
        title="Rewards Catalog"
        subtitle="Manage available rewards and track inventory."
        searchPlaceholder="Search rewards, users..."
        onSearchChange={(e) => setSearchQuery(e.target.value)}
        searchValue={searchQuery}
        actions={
          <button
            type="button"
            className="filled-action route-create-button"
            onClick={() => setShowAddCard(true)}
          >
            + Add New Reward
          </button>
        }
      />

      {/* Category Selection Filter Line & Sort Panel Grid Row Wrapper */}
      <section
        className="route-toolbar"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <div style={{ display: "flex", gap: "8px", overflowX: "auto" }}>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className="route-select"
              style={{
                borderRadius: "20px",
                padding: "6px 16px",
                fontSize: "0.85rem",
                fontWeight: "600",
                backgroundColor:
                  activeCategory === cat ? "#edf2f7" : "transparent",
                color: activeCategory === cat ? "#2f5d4b" : "#718096",
                border:
                  activeCategory === cat
                    ? "1px solid #cbd5e0"
                    : "1px solid transparent",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        <div
          className="route-sort"
          style={{ display: "flex", alignItems: "center", gap: "6px" }}
        >
          <span>Sort by:</span>
          <div style={{ position: "relative", display: "inline-block" }}>
            <select
              className="route-sort-button"
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value)}
              style={{
                appearance: "none",
                WebkitAppearance: "none",
                cursor: "pointer",
                border: "none",
                background: "transparent",
                fontWeight: "600",
                paddingRight: "15px",
              }}
            >
              <option value="popular">Most Popular</option>
              <option value="cost-high">Cost: High to Low</option>
              <option value="cost-low">Cost: Low to High</option>
            </select>
            <span
              style={{
                position: "absolute",
                right: 0,
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
                fontSize: "0.7rem",
              }}
            >
              ▼
            </span>
          </div>
        </div>
      </section>

      {/* Main Rewards Dynamic Display Catalog Grid Container */}
      <section
        className="route-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "24px",
        }}
      >
        {/* Inline Creation Card matching dashboard aesthetic styling grids */}
        {showAddCard && (
          <article
            className="route-card"
            style={{
              border: "2px dashed #cbd5e0",
              borderRadius: "16px",
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              background: "#f7fafc",
            }}
          >
            <h4
              style={{
                margin: "0 0 12px 0",
                color: "#2f5d4b",
                fontWeight: "700",
              }}
            >
              New Catalog Item
            </h4>
            <form
              onSubmit={handleAddSubmit}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                flexGrow: 1,
              }}
            >
              <input
                type="text"
                name="title"
                required
                placeholder="Reward Title (e.g., Canvas Bag)"
                value={newReward.title}
                onChange={handleAddChange}
                style={{
                  padding: "6px",
                  borderRadius: "6px",
                  border: "1px solid #cbd5e0",
                  fontSize: "0.85rem",
                }}
              />

              <select
                name="category"
                value={newReward.category}
                onChange={handleAddChange}
                style={{
                  padding: "6px",
                  borderRadius: "6px",
                  border: "1px solid #cbd5e0",
                }}
              >
                <option value="Physical Goods">Physical Goods</option>
                <option value="Donations">Donations</option>
                <option value="Digital Cards">Digital Cards</option>
              </select>

              <input
                type="number"
                name="points_required"
                required
                placeholder="Points Needed (e.g., 250)"
                value={newReward.points_required}
                onChange={handleAddChange}
                style={{
                  padding: "6px",
                  borderRadius: "6px",
                  border: "1px solid #cbd5e0",
                }}
              />
              <input
                type="text"
                name="stock_level"
                placeholder="Initial Units Count or 'Unlimited'"
                value={newReward.stock_level}
                onChange={handleAddChange}
                style={{
                  padding: "6px",
                  borderRadius: "6px",
                  border: "1px solid #cbd5e0",
                }}
              />

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "8px",
                  marginTop: "auto",
                  paddingTop: "10px",
                }}
              >
                <button
                  type="button"
                  onClick={() => setShowAddCard(false)}
                  style={{
                    padding: "6px 12px",
                    background: "none",
                    border: "1px solid #cbd5e0",
                    borderRadius: "6px",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="route-action solid"
                  style={{
                    padding: "6px 12px",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                  }}
                >
                  Catalog Item
                </button>
              </div>
            </form>
          </article>
        )}

        {loading && (
          <p style={{ gridColumn: "1/-1", padding: "10px" }}>
            Loading inventory data rows...
          </p>
        )}

        {!loading && processedRewards.length === 0 && !showAddCard && (
          <p style={{ gridColumn: "1/-1", padding: "10px", color: "#718096" }}>
            No available rewards match the filtering layout constraints.
          </p>
        )}

        {!loading &&
          processedRewards.map((reward) => (
            <RewardCard
              key={reward.id}
              reward={reward}
              onUpdateSuccess={fetchRewards}
            />
          ))}
      </section>
    </section>
  );
}

export default RewardsPage;
