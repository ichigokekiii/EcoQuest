import { useState, useEffect } from "react";
import Header from "../components/Header";

const regionOptions = ["Manila, NCR", "Taguig, NCR", "Quezon City, NCR"];
const difficultyOptions = ["Easy", "Medium", "Hard"];

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

  // 🛠️ Dynamic Validation Rule: Detects if fields are missing or left as "TBD"
  const isIncomplete =
    !editForm.name.trim() ||
    !editForm.description.trim() ||
    !editForm.distance.trim() ||
    !editForm.est_time.trim() ||
    !editForm.trash_spots.trim() ||
    editForm.trash_spots.toUpperCase() === "TBD";

  // Force badge status visually to match requirements
  const displayStatus = isIncomplete ? "Draft" : editForm.status;
  const actionButtonText = isIncomplete ? "Continue Editing" : "Manage Route";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    // Automatically set status to Draft if user saves an incomplete layout
    const payload = {
      ...editForm,
      status: isIncomplete ? "Draft" : "Active",
    };

    fetch(
      `http://localhost/EcoQuest/api/index.php?endpoint=routes&id=${route.id}`,
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
          alert(data.message);
        }
      })
      .catch((err) => console.error("Error updating route record:", err));
  };

  return (
    <article
      className="route-card"
      style={{
        border: "1px solid #e2e8f0",
        borderRadius: "16px",
        padding: "20px",
        backgroundColor: "#fff",
        boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
      }}
    >
      <div
        className="route-card-header"
        style={{
          display: "flex",
          justifyContent: "between",
          alignItems: "start",
          marginBottom: "15px",
        }}
      >
        <div style={{ flexGrow: 1 }}>
          {isEditing ? (
            <input
              type="text"
              name="name"
              className="edit-input"
              value={editForm.name}
              onChange={handleChange}
              style={{
                width: "90%",
                padding: "6px",
                fontSize: "1.1rem",
                fontWeight: "bold",
              }}
            />
          ) : (
            <h3 style={{ margin: 0, fontSize: "1.25rem" }}>{route.name}</h3>
          )}
        </div>
        <span
          className={`status-badge status-${displayStatus.toLowerCase()}`}
          style={{
            padding: "4px 10px",
            borderRadius: "20px",
            fontSize: "0.8rem",
            backgroundColor: displayStatus === "Draft" ? "#e2e8f0" : "#d1e7dd",
            color: displayStatus === "Draft" ? "#4a5568" : "#0f5132",
          }}
        >
          {displayStatus}
        </span>
      </div>

      <div
        className="route-card-body"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          fontSize: "0.9rem",
          color: "#4a5568",
          marginBottom: "20px",
        }}
      >
        <div>
          {isEditing ? (
            <select
              name="region"
              value={editForm.region}
              onChange={handleChange}
              style={{ padding: "6px", width: "100%" }}
            >
              {regionOptions.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          ) : (
            <span>{editForm.region}</span>
          )}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            borderTop: "1px solid #edf2f7",
            paddingTop: "8px",
            marginTop: "5px",
          }}
        >
          <span>
            <strong>Difficulty:</strong>
          </span>
          {isEditing ? (
            <select
              name="difficulty"
              value={editForm.difficulty}
              onChange={handleChange}
              style={{ padding: "4px" }}
            >
              {difficultyOptions.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          ) : (
            <span
              style={{
                padding: "2px 8px",
                borderRadius: "4px",
                backgroundColor: "#f7fafc",
              }}
            >
              {editForm.difficulty}
            </span>
          )}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Distance:</span>
          {isEditing ? (
            <input
              type="text"
              name="distance"
              placeholder="e.g., 1.2 km"
              value={editForm.distance}
              onChange={handleChange}
              style={{ width: "100px", textAlign: "right" }}
            />
          ) : (
            <strong>{editForm.distance || "N/A"}</strong>
          )}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Est. Time:</span>
          {isEditing ? (
            <input
              type="text"
              name="est_time"
              placeholder="e.g., 18 min"
              value={editForm.est_time}
              onChange={handleChange}
              style={{ width: "100px", textAlign: "right" }}
            />
          ) : (
            <strong>{editForm.est_time || "N/A"}</strong>
          )}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Trash Spots:</span>
          {isEditing ? (
            <input
              type="text"
              name="trash_spots"
              placeholder="e.g., 3 or TBD"
              value={editForm.trash_spots}
              onChange={handleChange}
              style={{ width: "100px", textAlign: "right" }}
            />
          ) : (
            <strong>{editForm.trash_spots || "TBD"}</strong>
          )}
        </div>
      </div>

      <div
        className="route-card-actions"
        style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}
      >
        {isEditing ? (
          <>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                border: "1px solid #cbd5e0",
                background: "none",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                backgroundColor: "#2f5d4b",
                color: "#fff",
                border: "none",
                cursor: "pointer",
              }}
            >
              Save
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            style={{
              padding: "10px 20px",
              borderRadius: "8px",
              border: "none",
              backgroundColor: isIncomplete ? "#4a5568" : "#2f5d4b",
              color: "#fff",
              fontWeight: "600",
              cursor: "pointer",
              width: "100%",
            }}
          >
            {actionButtonText}
          </button>
        )}
      </div>
    </article>
  );
}

function RoutePage() {
  const [routes, setRoutes] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [regionFilter, setRegionFilter] = useState("All");
  const [difficultyFilter, setDifficultyFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);

  const [newRoute, setNewRoute] = useState({
    name: "",
    description: "",
    region: "Manila, NCR",
    difficulty: "Easy",
    distance: "",
    est_time: "",
    trash_spots: "TBD", // Sets it to incomplete by default
    status: "Draft",
  });

  const fetchRoutes = () => {
    fetch("http://localhost/EcoQuest/api/index.php?endpoint=routes")
      .then((res) => res.json())
      .then((data) => setRoutes(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Error loading routes data:", err));
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  const handleCreateChange = (e) => {
    const { name, value } = e.target;
    setNewRoute((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    fetch("http://localhost/EcoQuest/api/index.php?endpoint=routes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newRoute),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setShowModal(false);
          setNewRoute({
            name: "",
            description: "",
            region: "Manila, NCR",
            difficulty: "Easy",
            distance: "",
            est_time: "",
            trash_spots: "TBD",
            status: "Draft",
          });
          fetchRoutes();
        } else {
          alert(data.message);
        }
      })
      .catch((err) => console.error("Error creating route:", err));
  };

  // 🔍 Omni-Search Filtering Engine
  const filteredRoutes = routes.filter((route) => {
    const name = route.name || "";
    const region = route.region || "";
    const difficulty = route.difficulty || "";

    const matchesSearch =
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      region.toLowerCase().includes(searchQuery.toLowerCase()) ||
      difficulty.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRegion = regionFilter === "All" || region === regionFilter;
    const matchesDifficulty =
      difficultyFilter === "All" || difficulty === difficultyFilter;

    return matchesSearch && matchesRegion && matchesDifficulty;
  });

  return (
    <section className="route-page" style={{ padding: "30px" }}>
      <Header
        title="Route Management"
        subtitle="Manage and monitor active walking routes for eco-missions."
        searchPlaceholder="Search routes, locations, or status..."
        onSearchChange={(e) => setSearchQuery(e.target.value)}
        searchValue={searchQuery}
        actions={
          <button
            type="button"
            className="filled-action"
            onClick={() => setShowModal(true)}
            style={{
              backgroundColor: "#2f5d4b",
              color: "#fff",
              padding: "10px 20px",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Create New Route
          </button>
        }
      />

      {/* Filter Toolbar */}
      <div
        className="filter-toolbar"
        style={{ display: "flex", gap: "15px", margin: "25px 0" }}
      >
        <select
          value={regionFilter}
          onChange={(e) => setRegionFilter(e.target.value)}
          style={{
            padding: "8px 16px",
            borderRadius: "8px",
            borderColor: "#cbd5e0",
          }}
        >
          <option value="All">All Regions</option>
          {regionOptions.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>

        <select
          value={difficultyFilter}
          onChange={(e) => setDifficultyFilter(e.target.value)}
          style={{
            padding: "8px 16px",
            borderRadius: "8px",
            borderColor: "#cbd5e0",
          }}
        >
          <option value="All">All Difficulties</option>
          {difficultyOptions.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      {/* Creation Popup Modal */}
      {showModal && (
        <div
          className="modal-backdrop"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.4)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 2000,
          }}
        >
          <div
            className="modal-content"
            style={{
              backgroundColor: "#fff",
              padding: "30px",
              borderRadius: "16px",
              width: "400px",
            }}
          >
            <h3>Create New Route</h3>
            <form
              onSubmit={handleCreateSubmit}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                marginTop: "15px",
              }}
            >
              <input
                type="text"
                name="name"
                placeholder="Route Name"
                required
                value={newRoute.name}
                onChange={handleCreateChange}
                style={{ padding: "8px" }}
              />
              <textarea
                name="description"
                placeholder="Route Description"
                value={newRoute.description}
                onChange={handleCreateChange}
                style={{ padding: "8px", height: "60px" }}
              />

              <select
                name="region"
                value={newRoute.region}
                onChange={handleCreateChange}
                style={{ padding: "8px" }}
              >
                {regionOptions.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>

              <select
                name="difficulty"
                value={newRoute.difficulty}
                onChange={handleCreateChange}
                style={{ padding: "8px" }}
              >
                {difficultyOptions.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>

              <input
                type="text"
                name="distance"
                placeholder="Distance (e.g., 2.2 km)"
                value={newRoute.distance}
                onChange={handleCreateChange}
                style={{ padding: "8px" }}
              />
              <input
                type="text"
                name="est_time"
                placeholder="Est. Time (e.g., 30 min)"
                value={newRoute.est_time}
                onChange={handleCreateChange}
                style={{ padding: "8px" }}
              />
              <input
                type="text"
                name="trash_spots"
                placeholder="Trash Spots (Leave blank or 'TBD' for Draft status)"
                value={newRoute.trash_spots}
                onChange={handleCreateChange}
                style={{ padding: "8px" }}
              />

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
                  onClick={() => setShowModal(false)}
                  style={{ padding: "8px 16px" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#2f5d4b",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                  }}
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Grid Layout Container */}
      <div
        className="route-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: "25px",
        }}
      >
        {filteredRoutes.map((route) => (
          <RouteCard
            key={route.id}
            route={route}
            onUpdateSuccess={fetchRoutes}
          />
        ))}
      </div>
    </section>
  );
}

export default RoutePage;
