import { useState, useEffect } from "react";
import Header from "../components/Header";

const regionOptions = ["Manila, NCR", "Taguig, NCR", "Quezon City, NCR"];
const difficultyOptions = ["Easy", "Medium", "Hard"];

// Helper map helper to assign your layout styles safely based on row IDs or data properties
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

function RouteCard({ route, onUpdateSuccess }) {
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

  // 🛠️ Dynamic Incomplete Rule Check
  const isIncomplete =
    !editForm.name?.trim() ||
    !editForm.distance?.trim() ||
    !editForm.est_time?.trim() ||
    !editForm.trash_spots?.trim() ||
    editForm.trash_spots?.toUpperCase() === "TBD";

  const displayStatus = isIncomplete ? "Draft" : editForm.status;
  const statusTone = displayStatus.toLowerCase();
  const actionText = isIncomplete ? "Continue Editing" : "Manage Route";
  const previewTone = getToneAssignment(route.id, editForm.difficulty);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    // Automatically set fallback status according to field completeness metrics
    const finalPayload = {
      ...editForm,
      status: isIncomplete ? "Draft" : "Active",
    };

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
          onUpdateSuccess(); // Trigger database re-fetch on parent layout container
        } else {
          alert(data.message || "Failed to update database record.");
        }
      })
      .catch((err) => console.error("Error updating route record:", err));
  };

  // Pre-fill placeholder badge value mapping metric
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
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            <label>
              <small>Route Name</small>
              <input
                type="text"
                name="name"
                className="edit-input"
                value={editForm.name}
                onChange={handleChange}
                style={{ width: "100%", padding: "5px" }}
              />
            </label>

            <label>
              <small>Region</small>
              <select
                name="region"
                className="edit-input"
                value={editForm.region}
                onChange={handleChange}
                style={{ width: "100%", padding: "5px" }}
              >
                {regionOptions.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <small>Difficulty</small>
              <select
                name="difficulty"
                className="edit-input"
                value={editForm.difficulty}
                onChange={handleChange}
                style={{ width: "100%", padding: "5px" }}
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
                <small>Distance</small>
                <input
                  type="text"
                  name="distance"
                  placeholder="1.2 km"
                  value={editForm.distance}
                  onChange={handleChange}
                  style={{ width: "100%", padding: "5px" }}
                />
              </label>
              <label style={{ flex: 1 }}>
                <small>Est. Time</small>
                <input
                  type="text"
                  name="est_time"
                  placeholder="18 min"
                  value={editForm.est_time}
                  onChange={handleChange}
                  style={{ width: "100%", padding: "5px" }}
                />
              </label>
            </div>

            <label>
              <small>Trash Spots</small>
              <input
                type="text"
                name="trash_spots"
                placeholder="3 or TBD"
                value={editForm.trash_spots}
                onChange={handleChange}
                style={{ width: "100%", padding: "5px" }}
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

        <div className="route-card-footer" style={{ marginTop: "15px" }}>
          <div className="route-badge">
            <span>{badgeValue}</span>
          </div>

          {isEditing ? (
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                type="button"
                className="route-action"
                onClick={() => setIsEditing(false)}
                style={{
                  padding: "6px 12px",
                  background: "#ccc",
                  color: "#333",
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
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className={`route-action${actionText === "Continue Editing" ? " solid" : ""}`}
            >
              {actionText}
            </button>
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

  // 🔍 Fully functional client-side Omni-Search filtering engine
  const filteredRoutes = routes.filter((route) => {
    const name = route.name || "";
    const region = route.region || "";
    const difficulty = route.difficulty || "";
    const status = route.status || "";

    return (
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      region.toLowerCase().includes(searchQuery.toLowerCase()) ||
      difficulty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      status.toLowerCase().includes(searchQuery.toLowerCase())
    );
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
          <button type="button" className="filled-action route-create-button">
            Create New Route
          </button>
        }
      />

      <section className="route-toolbar" aria-label="Route filters">
        <div className="route-selects">
          <button type="button" className="route-select">
            All Regions <span>▾</span>
          </button>
          <button type="button" className="route-select">
            All Difficulties <span>▾</span>
          </button>
        </div>

        <div className="route-sort">
          <span className="route-sort-icon">☰</span>
          <span>Sort by:</span>
          <button type="button" className="route-sort-button">
            Recently Added <span>▾</span>
          </button>
        </div>
      </section>

      <section className="route-grid" aria-label="Routes overview">
        {loading && (
          <p style={{ padding: "20px" }}>
            Loading routes from system database...
          </p>
        )}

        {!loading && filteredRoutes.length === 0 && (
          <p style={{ padding: "20px", color: "#718096" }}>
            No matching route paths found.
          </p>
        )}

        {!loading &&
          filteredRoutes.map((route) => (
            <RouteCard
              key={route.id}
              route={route}
              onUpdateSuccess={fetchRoutes}
            />
          ))}
      </section>
    </section>
  );
}

export default RoutePage;
