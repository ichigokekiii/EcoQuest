﻿import React, { useState, useEffect } from "react";
import Header from "../components/Header";

const rewardFilters = [
  "All Categories",
  "Physical Goods",
  "Donations",
  "Digital Cards",
];

// Unified Form Modal for Managing Addition & Modification configurations
function RewardFormModal({ isOpen, onClose, onSave, editItem }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Physical Goods");
  const [points, setPoints] = useState("");
  const [stock, setStock] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [status, setStatus] = useState("Active");

  // Sync state settings to match chosen baseline entry contexts
  useEffect(() => {
    if (editItem) {
      setTitle(editItem.title || "");
      setCategory(editItem.category || "Physical Goods");
      setPoints(editItem.pointsRaw !== undefined ? editItem.pointsRaw : "");

      const parsedStock =
        editItem.stock === "Unlimited" ? "" : parseInt(editItem.stock, 10);
      setStock(isNaN(parsedStock) ? "" : parsedStock);
      setImageUrl(editItem.image || "");
      setIsFeatured(editItem.isFeatured === 1);
      setStatus(editItem.status || "Active");
      setImageFile(null);
    } else {
      setTitle("");
      setCategory("Physical Goods");
      setPoints("");
      setStock("");
      setImageFile(null);
      setImageUrl("");
      setIsFeatured(false);
      setStatus("Active");
    }
  }, [editItem, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    // Construct FormData interface profile to facilitate native file binary parsing streams
    const formData = new FormData();
    formData.append("title", title);
    formData.append("category", category);
    formData.append("points_required", points);
    formData.append("stock_level", stock);
    formData.append("is_featured", isFeatured ? 1 : 0);
    formData.append("status", status);

    if (imageFile) {
      formData.append("image_file", imageFile);
    } else {
      formData.append("image_url", imageUrl);
    }

    onSave(formData, editItem?.id);
  };

  return (
    <div className="modal-overlay" style={modalStyles.overlay}>
      <div className="modal-container" style={modalStyles.container}>
        <div style={modalStyles.header}>
          <h2>{editItem ? "Edit Existing Reward" : "Add New Reward"}</h2>
          <button type="button" onClick={onClose} style={modalStyles.closeX}>
            &times;
          </button>
        </div>
        <form onSubmit={handleSubmit} style={modalStyles.form}>
          <label style={modalStyles.label}>
            Reward Title *
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              style={modalStyles.input}
            />
          </label>

          <label style={modalStyles.label}>
            Category *
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={modalStyles.input}
            >
              <option value="Physical Goods">Physical Goods</option>
              <option value="Donations">Donations</option>
              <option value="Digital Cards">Digital Cards</option>
            </select>
          </label>

          <label style={modalStyles.label}>
            Points Required *
            <input
              type="number"
              min="0"
              value={points}
              onChange={(e) => setPoints(e.target.value)}
              required
              style={modalStyles.input}
            />
          </label>

          <label style={modalStyles.label}>
            Stock Level (Leave blank for Unlimited)
            <input
              type="number"
              min="0"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              style={modalStyles.input}
            />
          </label>

          <label style={modalStyles.label}>
            Upload Image File (Saves to rewards/ folder)
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files[0])}
              style={modalStyles.input}
            />
          </label>

          {!imageFile && (
            <label style={modalStyles.label}>
              Or Image URL Fallback
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                style={modalStyles.input}
              />
            </label>
          )}

          {editItem && (
            <label style={modalStyles.label}>
              Status
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                style={modalStyles.input}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </label>
          )}

          <label
            style={{
              ...modalStyles.label,
              flexDirection: "row",
              gap: "0.5rem",
              alignItems: "center",
            }}
          >
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
            />
            <span>Mark as Featured Item</span>
          </label>

          <div style={modalStyles.actions}>
            <button
              type="button"
              onClick={onClose}
              style={modalStyles.cancelBtn}
            >
              Cancel
            </button>
            <button type="submit" style={modalStyles.saveBtn}>
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function RewardCard({ item, onDelete, onEdit }) {
  const [showMenu, setShowMenu] = useState(false);

  // Parse accurate display urls depending on whether path values point to absolute addresses or local filenames
  const resolvedImage =
    item.image &&
    (item.image.startsWith("http://") || item.image.startsWith("https://"))
      ? item.image
      : `http://localhost/EcoQuest/public/rewards/${item.image || "default-reward.png"}`;

  return (
    <article className="reward-card">
      <div
        className="reward-card-media"
        style={{ backgroundImage: `url(${resolvedImage})` }}
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
          <button
            type="button"
            className="reward-edit"
            onClick={() => onEdit(item)}
          >
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEditItem, setSelectedEditItem] = useState(null);

  const fetchRewards = () => {
    setLoading(true);
    fetch("http://localhost/EcoQuest/api/index.php?endpoint=rewards")
      .then((res) => res.json())
      .then((data) => {
        if (!Array.isArray(data)) {
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
            category: row.category || "Physical Goods",
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
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchRewards();
  }, []);

  // Combined Form processing delivery router pipeline
  const handleFormSubmissionSave = (formDataPayload, id) => {
    const isEdit = !!id;
    const url = isEdit
      ? `http://localhost/EcoQuest/api/index.php?endpoint=rewards&id=${id}`
      : "http://localhost/EcoQuest/api/index.php?endpoint=rewards";

    fetch(url, {
      method: "POST", // POST handles multipart file uploads securely on both routes
      body: formDataPayload,
    })
      .then((res) => res.json())
      .then((result) => {
        if (result.success) {
          setIsModalOpen(false);
          setSelectedEditItem(null);
          fetchRewards();
        } else {
          alert("Error Processing Operation: " + result.message);
        }
      })
      .catch((err) => console.error(err));
  };

  const handleTriggerEditState = (item) => {
    setSelectedEditItem(item);
    setIsModalOpen(true);
  };

  const handleDeleteReward = (id) => {
    fetch(`http://localhost/EcoQuest/api/index.php?endpoint=rewards&id=${id}`, {
      method: "DELETE",
    })
      .then((res) => res.json())
      .then(() => {
        setRewards((prev) => prev.filter((item) => item.id !== id));
      })
      .catch((err) => console.error(err));
  };

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
          <button
            type="button"
            className="filled-action"
            onClick={() => {
              setSelectedEditItem(null);
              setIsModalOpen(true);
            }}
          >
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
              onEdit={handleTriggerEditState}
            />
          ))
        ) : (
          <div style={{ padding: "2rem", color: "var(--text-muted)" }}>
            No available rewards match the filtering layout constraints.
          </div>
        )}

        <article className="reward-create-card">
          <button
            type="button"
            className="create-reward-button"
            onClick={() => {
              setSelectedEditItem(null);
              setIsModalOpen(true);
            }}
          >
            <span>+</span>
            <strong>Create Reward</strong>
            <p>Add a new item or donation option to the catalog.</p>
          </button>
        </article>
      </section>

      <RewardFormModal
        isOpen={isModalOpen}
        editItem={selectedEditItem}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedEditItem(null);
        }}
        onSave={handleFormSubmissionSave}
      />
    </section>
  );
}

const modalStyles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  container: {
    background: "#fff",
    padding: "1.5rem",
    borderRadius: "12px",
    width: "100%",
    maxWidth: "450px",
    maxHeight: "90vh",
    overflowY: "auto",
    boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid #eee",
    paddingBottom: "0.5rem",
    marginBottom: "1rem",
  },
  closeX: {
    background: "none",
    border: "none",
    fontSize: "1.5rem",
    cursor: "pointer",
  },
  form: { display: "flex", flexDirection: "column", gap: "1rem" },
  label: {
    display: "flex",
    flexDirection: "column",
    gap: "0.25rem",
    fontWeight: "500",
    fontSize: "14px",
    color: "#333",
  },
  input: {
    padding: "0.5rem",
    borderRadius: "6px",
    border: "1px solid #ccc",
    fontSize: "14px",
  },
  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "0.5rem",
    marginTop: "0.5rem",
  },
  cancelBtn: {
    padding: "0.5rem 1rem",
    background: "#f5f5f5",
    border: "1px solid #ccc",
    borderRadius: "6px",
    cursor: "pointer",
  },
  saveBtn: {
    padding: "0.5rem 1rem",
    background: "#2d5a27",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
};

export default RewardsPage;
