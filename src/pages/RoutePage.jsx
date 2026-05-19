import { useState, useEffect } from "react";
import Header from "../components/Header";

const regionOptions = ["Manila, NCR", "Taguig, NCR", "Quezon City, NCR"];
const difficultyOptions = ["Easy", "Medium", "Hard"];

// Helper map to assign background layout tones derived from card identity metrics
const getToneAssignment = (id, difficulty) => {
  if (difficulty?.toLowerCase() === "easy") return "forest";
  if (id % 2 === 0) return "ink";
  return "sky";
};

function RoutePreview({ tone }) {
  return (
    <div className={`route-preview route-preview-${tone}`}>
      <div className="route-preview-map" />
      <div className="route-preview-panel">
        <div className="route-preview-line one" />
        <div className="route-preview-line two" />
        <div className="route-preview-dot one" />
        <div className="route-preview-dot two" />
      </div>
    </div>
  );
}

function RouteCard({ route, onUpdateSuccess, onDeleteSuccess }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: route.name || "",
    description: route.description || "",
    region: route.region || "Manila, NCR",
    difficulty: route.difficulty || "Easy",
    distance: route.distance || "",
    est_time: route.est_time || "",
    trash_spots: route.trash_spots || "",
    status: route.status || "Draft",
  });

  // Dynamic Completeness Matrix Rule
  const isIncomplete =
    !editForm.name?.trim() ||
    !editForm.distance?.trim() ||
    !editForm.est_time?.trim() ||
    !editForm.trash_spots?.trim() ||
    editForm.trash_spots?.toUpperCase() === "TBD";

  const displayStatus = isIncomplete ? "Draft" : "Active";
  const statusTone = displayStatus.toLowerCase();
  const actionText = isIncomplete ? "Continue Editing" : "Manage Route";
  const previewTone = getToneAssignment(route.id, editForm.difficulty);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    const finalPayload = { ...editForm, status: displayStatus };

    fetch(
      `http://localhost/EcoQuest/api/index.php?endpoint=routes&id=${route.id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalPayload),
      },
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setIsEditing(false);
          onUpdateSuccess();
        } else {
          alert(data.message || "Failed to update database record.");
        }
      })
      .catch((err) => console.error("Error updating route record:", err));
  };

  // Handle Delete Fetch Execution Sequence Method
  const handleDelete = () => {
    if (
      window.confirm(
        `Are you absolutely sure you want to drop "${route.name || "this route"}" from EcoQuest metrics cleanly?`,
      )
    ) {
      fetch(
        `http://localhost/EcoQuest/api/index.php?endpoint=routes&id=${route.id}`,
        {
          method: "DELETE",
        },
      )
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            onDeleteSuccess();
          } else {
            alert(data.message || "Failed to clear selected entry index.");
          }
        })
        .catch((err) =>
          console.error("Error invoking deletion pipeline:", err),
        );
    }
  };

  const badgeValue = route.id ? Number(route.id) * 8 + 16 : "0";

  return (
    <article className="route-card">
      <div className="route-card-media">
        <RoutePreview tone={previewTone} />
        <span className={`route-status route-status-${statusTone}`}>
          {displayStatus}
        </span>
      </div>

      <div className="route-card-body">
        {isEditing ? (
          <div
            className="route-edit-fields"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              margin: "10px 0",
            }}
          >
            <label>
              <small style={{ color: "#718096", fontWeight: "600" }}>
                Route Title
              </small>
              <input
                type="text"
                name="name"
                className="edit-input"
                value={editForm.name}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "6px",
                  borderRadius: "6px",
                  border: "1px solid #cbd5e0",
                }}
              />
            </label>

            <label>
              <small style={{ color: "#718096", fontWeight: "600" }}>
                Region / City Location
              </small>
              <select
                name="region"
                value={editForm.region}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "6px",
                  borderRadius: "6px",
                  border: "1px solid #cbd5e0",
                }}
              >
                {regionOptions.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <small style={{ color: "#718096", fontWeight: "600" }}>
                Difficulty Tier
              </small>
              <select
                name="difficulty"
                value={editForm.difficulty}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "6px",
                  borderRadius: "6px",
                  border: "1px solid #cbd5e0",
                }}
              >
                {difficultyOptions.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </label>

            <div style={{ display: "flex", gap: "10px" }}>
              <label style={{ flex: 1 }}>
                <small style={{ color: "#718096", fontWeight: "600" }}>
                  Distance
                </small>
                <input
                  type="text"
                  name="distance"
                  placeholder="1.2 km"
                  value={editForm.distance}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "6px",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e0",
                  }}
                />
              </label>
              <label style={{ flex: 1 }}>
                <small style={{ color: "#718096", fontWeight: "600" }}>
                  Est. Time
                </small>
                <input
                  type="text"
                  name="est_time"
                  placeholder="18 min"
                  value={editForm.est_time}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "6px",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e0",
                  }}
                />
              </label>
            </div>

            <label>
              <small style={{ color: "#718096", fontWeight: "600" }}>
                Trash Spots
              </small>
              <input
                type="text"
                name="trash_spots"
                placeholder="3 or TBD"
                value={editForm.trash_spots}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "6px",
                  borderRadius: "6px",
                  border: "1px solid #cbd5e0",
                }}
              />
            </label>
          </div>
        ) : (
          <>
            <div className="route-title-row">
              <h3>{route.name || "Untitled Route"}</h3>
              <span className="route-difficulty">
                {route.difficulty || "Easy"}
              </span>
            </div>
            <p className="route-location">{route.region || "Manila, NCR"}</p>

            <dl className="route-stats">
              <div>
                <dt>Distance</dt>
                <dd>{route.distance || "N/A"}</dd>
              </div>
              <div>
                <dt>Est. Time</dt>
                <dd>{route.est_time || "N/A"}</dd>
              </div>
              <div>
                <dt>Trash Spots</dt>
                <dd>{route.trash_spots || "TBD"}</dd>
              </div>
            </dl>
          </>
        )}

        <div
          className="route-card-footer"
          style={{
            marginTop: "15px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div className="route-badge">
            <span>{badgeValue}</span>
          </div>

          {/* Cleaned layout: Delete action only renders when isEditing === true */}
          {isEditing ? (
            <div
              style={{
                display: "flex",
                gap: "8px",
                width: "100%",
                justifyContent: "flex-end",
              }}
            >
              <button
                type="button"
                onClick={handleDelete}
                className="route-action"
                style={{
                  padding: "6px 12px",
                  background: "#fed7d7",
                  color: "#c53030",
                  border: "1px solid #feb2b2",
                  marginRight: "auto", // Pushes Delete to the left edge of action block
                }}
              >
                Delete
              </button>
              <button
                type="button"
                className="route-action"
                onClick={() => setIsEditing(false)}
                style={{
                  padding: "6px 12px",
                  background: "#cbd5e0",
                  color: "#2d3748",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="route-action solid"
                onClick={handleSave}
                style={{ padding: "6px 12px" }}
              >
                Save
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className={`route-action${actionText === "Continue Editing" ? " solid" : ""}`}
              >
                {actionText}
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

function RoutePage() {
  const [routes, setRoutes] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Filter and Sorting Configuration State
  const [selectedRegion, setSelectedRegion] = useState("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  const [selectedSort, setSelectedSort] = useState("recent");

  // New Creation Form Entity Initialization State
  const [createForm, setCreateForm] = useState({
    name: "",
    description: "",
    region: "Manila, NCR",
    difficulty: "Easy",
    distance: "",
    est_time: "",
    trash_spots: "TBD",
  });

  const fetchRoutes = () => {
    fetch("http://localhost/EcoQuest/api/index.php?endpoint=routes")
      .then((res) => res.json())
      .then((data) => {
        setRoutes(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error connecting to backend API routes:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  const handleCreateChange = (e) => {
    const { name, value } = e.target;
    setCreateForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();

    const formIsIncomplete =
      !createForm.name?.trim() ||
      !createForm.distance?.trim() ||
      !createForm.est_time?.trim() ||
      !createForm.trash_spots?.trim() ||
      createForm.trash_spots?.toUpperCase() === "TBD";

    const computedStatus = formIsIncomplete ? "Draft" : "Active";

    const payload = {
      ...createForm,
      status: computedStatus,
    };

    fetch("http://localhost/EcoQuest/api/index.php?endpoint=routes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setShowCreateModal(false);
          setCreateForm({
            name: "",
            description: "",
            region: "Manila, NCR",
            difficulty: "Easy",
            distance: "",
            est_time: "",
            trash_spots: "TBD",
          });
          fetchRoutes();
        } else {
          alert(data.message || "Failed to create new route entry record.");
        }
      })
      .catch((err) => console.error("Error creating database record:", err));
  };

  // Search, Filter, and Sort Master Matrix Processing Engine
  const processedRoutes = routes
    .filter((route) => {
      const name = route.name || "";
      const region = route.region || "";
      const difficulty = route.difficulty || "";
      const status = route.status || "";

      const matchesSearch =
        name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        region.toLowerCase().includes(searchQuery.toLowerCase()) ||
        difficulty.toLowerCase().includes(searchQuery.toLowerCase()) ||
        status.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRegion =
        selectedRegion === "All" || region === selectedRegion;
      const matchesDifficulty =
        selectedDifficulty === "All" || difficulty === selectedDifficulty;

      return matchesSearch && matchesRegion && matchesDifficulty;
    })
    .sort((a, b) => {
      if (selectedSort === "recent") return b.id - a.id;
      if (selectedSort === "oldest") return a.id - b.id;
      if (selectedSort === "title")
        return (a.name || "").localeCompare(b.name || "");
      return 0;
    });

  return (
    <section className="route-page">
      <Header
        title="Route Management"
        subtitle="Manage and monitor active walking routes for eco-missions."
        searchPlaceholder="Search routes, locations, or status..."
        onSearchChange={(e) => setSearchQuery(e.target.value)}
        searchValue={searchQuery}
        actions={
          <button
            type="button"
            className="filled-action route-create-button"
            onClick={() => setShowCreateModal(true)}
          >
            Create New Route
          </button>
        }
      />

      <section className="route-toolbar" aria-label="Route filters">
        <div className="route-selects" style={{ display: "flex", gap: "12px" }}>
          <div
            className="route-select-wrapper"
            style={{ position: "relative", display: "inline-block" }}
          >
            <select
              className="route-select"
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              style={{
                appearance: "none",
                WebkitAppearance: "none",
                MozAppearance: "none",
                cursor: "pointer",
                paddingRight: "30px",
              }}
            >
              <option value="All">All Regions</option>
              {regionOptions.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <span
              style={{
                position: "absolute",
                right: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
                fontSize: "0.75rem",
                color: "#4a5568",
              }}
            >
              ▼
            </span>
          </div>

          <div
            className="route-select-wrapper"
            style={{ position: "relative", display: "inline-block" }}
          >
            <select
              className="route-select"
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              style={{
                appearance: "none",
                WebkitAppearance: "none",
                MozAppearance: "none",
                cursor: "pointer",
                paddingRight: "30px",
              }}
            >
              <option value="All">All Difficulties</option>
              {difficultyOptions.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <span
              style={{
                position: "absolute",
                right: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
                fontSize: "0.75rem",
                color: "#4a5568",
              }}
            >
              ▼
            </span>
          </div>
        </div>

        <div
          className="route-sort"
          style={{ display: "flex", alignItems: "center", gap: "6px" }}
        >
          <span className="route-sort-icon">☰</span>
          <span>Sort by:</span>
          <div style={{ position: "relative", display: "inline-block" }}>
            <select
              className="route-sort-button"
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value)}
              style={{
                appearance: "none",
                WebkitAppearance: "none",
                MozAppearance: "none",
                cursor: "pointer",
                border: "none",
                background: "transparent",
                fontWeight: "600",
                paddingRight: "15px",
                paddingLeft: "4px",
              }}
            >
              <option value="recent">Recently Added</option>
              <option value="oldest">Oldest Entries</option>
              <option value="title">Alphabetical (A-Z)</option>
            </select>
            <span
              style={{
                position: "absolute",
                right: "0px",
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
                fontSize: "0.7rem",
                color: "#2d3748",
              }}
            >
              ▼
            </span>
          </div>
        </div>
      </section>

      {showCreateModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              padding: "30px",
              borderRadius: "14px",
              width: "420px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
            }}
          >
            <h3
              style={{
                margin: "0 0 15px 0",
                fontSize: "1.4rem",
                color: "#2f5d4b",
              }}
            >
              Create New Eco Route
            </h3>

            <form
              onSubmit={handleCreateSubmit}
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              <label>
                <small style={{ fontWeight: "600" }}>Route Name *</small>
                <input
                  type="text"
                  name="name"
                  placeholder="e.g., Luneta Walkway"
                  required
                  value={createForm.name}
                  onChange={handleCreateChange}
                  style={{
                    width: "100%",
                    padding: "8px",
                    marginTop: "4px",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e0",
                  }}
                />
              </label>

              <label>
                <small style={{ fontWeight: "600" }}>Description</small>
                <textarea
                  name="description"
                  placeholder="Provide environmental objectives..."
                  value={createForm.description}
                  onChange={handleCreateChange}
                  style={{
                    width: "100%",
                    padding: "8px",
                    marginTop: "4px",
                    height: "50px",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e0",
                    resize: "none",
                  }}
                />
              </label>

              <div style={{ display: "flex", gap: "10px" }}>
                <label style={{ flex: 1 }}>
                  <small style={{ fontWeight: "600" }}>Region</small>
                  <select
                    name="region"
                    value={createForm.region}
                    onChange={handleCreateChange}
                    style={{
                      width: "100%",
                      padding: "8px",
                      marginTop: "4px",
                      borderRadius: "6px",
                      border: "1px solid #cbd5e0",
                    }}
                  >
                    {regionOptions.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </label>

                <label style={{ flex: 1 }}>
                  <small style={{ fontWeight: "600" }}>Difficulty</small>
                  <select
                    name="difficulty"
                    value={createForm.difficulty}
                    onChange={handleCreateChange}
                    style={{
                      width: "100%",
                      padding: "8px",
                      marginTop: "4px",
                      borderRadius: "6px",
                      border: "1px solid #cbd5e0",
                    }}
                  >
                    {difficultyOptions.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <label style={{ flex: 1 }}>
                  <small style={{ fontWeight: "600" }}>
                    Distance (e.g., 2.5 km)
                  </small>
                  <input
                    type="text"
                    name="distance"
                    placeholder="Leave blank for Draft"
                    value={createForm.distance}
                    onChange={handleCreateChange}
                    style={{
                      width: "100%",
                      padding: "8px",
                      marginTop: "4px",
                      borderRadius: "6px",
                      border: "1px solid #cbd5e0",
                    }}
                  />
                </label>

                <label style={{ flex: 1 }}>
                  <small style={{ fontWeight: "600" }}>
                    Est. Time (e.g., 25 min)
                  </small>
                  <input
                    type="text"
                    name="est_time"
                    placeholder="Leave blank for Draft"
                    value={createForm.est_time}
                    onChange={handleCreateChange}
                    style={{
                      width: "100%",
                      padding: "8px",
                      marginTop: "4px",
                      borderRadius: "6px",
                      border: "1px solid #cbd5e0",
                    }}
                  />
                </label>
              </div>

              <label>
                <small style={{ fontWeight: "600" }}>Trash Spots Count</small>
                <input
                  type="text"
                  name="trash_spots"
                  value={createForm.trash_spots}
                  onChange={handleCreateChange}
                  style={{
                    width: "100%",
                    padding: "8px",
                    marginTop: "4px",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e0",
                  }}
                />
              </label>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "10px",
                  marginTop: "10px",
                }}
              >
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e0",
                    background: "none",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "8px 16px",
                    borderRadius: "6px",
                    backgroundColor: "#2f5d4b",
                    color: "#fff",
                    border: "none",
                    cursor: "pointer",
                    fontWeight: "600",
                  }}
                >
                  Create Route
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <section className="route-grid" aria-label="Routes overview">
        {loading && (
          <p style={{ padding: "20px" }}>Loading routes from database...</p>
        )}

        {!loading && processedRoutes.length === 0 && (
          <p
            style={{ padding: "20px", color: "#718096", gridColumn: "1 / -1" }}
          >
            No route paths match your current filtering criteria.
          </p>
        )}

        {!loading &&
          processedRoutes.map((route) => (
            <RouteCard
              key={route.id}
              route={route}
              onUpdateSuccess={fetchRoutes}
              onDeleteSuccess={fetchRoutes}
            />
          ))}
      </section>
    </section>
  );
}

export default RoutePage;
