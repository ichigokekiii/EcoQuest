﻿import { useState, useEffect } from "react";
import Header from "../components/Header";

const missionFilters = ["Active", "Scheduled", "Archived"];

// --- MISSION CARD COMPONENT (With Edit & Delete) ---
function MissionCard({ mission, onSaveSuccess }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: mission.title || "",
    requirement: mission.requirement || mission.description || "",
    date_range: mission.date_range || "",
    xp_reward: mission.xp_reward || 0,
    status: mission.status || "Active",
  });

  const displayId = mission.id ? `MS-${mission.id}` : "N/A";
  const displayRoute = mission.assigned_route || "Unassigned Route";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    fetch(
      `http://localhost/EcoQuest/api/index.php?endpoint=missions&id=${mission.id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      },
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setIsEditing(false);
          onSaveSuccess();
        } else {
          alert(data.message);
        }
      })
      .catch((err) => console.error("Error updating mission:", err));
  };

  const handleDelete = () => {
    if (
      window.confirm(
        `Are you sure you want to permanently delete "${editForm.title}"?`,
      )
    ) {
      fetch(
        `http://localhost/EcoQuest/api/index.php?endpoint=missions&id=${mission.id}`,
        {
          method: "DELETE",
        },
      )
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setIsEditing(false);
            onSaveSuccess();
          } else {
            alert(data.message);
          }
        })
        .catch((err) => console.error("Error deleting mission:", err));
    }
  };

  return (
    <article className="mission-card">
      <div className="mission-card-header">
        <div>
          {isEditing ? (
            <input
              type="text"
              name="title"
              className="edit-input"
              value={editForm.title}
              onChange={handleChange}
            />
          ) : (
            <h3>{mission.title || "Untitled Mission"}</h3>
          )}
          <p className="mission-card-id">ID: {displayId}</p>
        </div>
        {isEditing ? (
          <select
            name="status"
            className="edit-input"
            value={editForm.status}
            onChange={handleChange}
          >
            {missionFilters.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        ) : (
          <span
            className={`mission-card-badge mission-card-badge-${editForm.status.toLowerCase()}`}
          >
            {editForm.status}
          </span>
        )}
      </div>

      <div className="mission-card-meta">
        <div className="mission-card-line">
          <span className="mission-card-label">Assigned Route</span>
          <span>{displayRoute}</span>
        </div>
        <div className="mission-card-line">
          <span className="mission-card-label">Requirement</span>
          {isEditing ? (
            <input
              type="text"
              name="requirement"
              className="edit-input"
              value={editForm.requirement}
              onChange={handleChange}
            />
          ) : (
            <span>{editForm.requirement}</span>
          )}
        </div>
        <div className="mission-card-line">
          <span className="mission-card-label">Date Range</span>
          {isEditing ? (
            <input
              type="text"
              name="date_range"
              className="edit-input"
              value={editForm.date_range}
              onChange={handleChange}
            />
          ) : (
            <span>{editForm.date_range}</span>
          )}
        </div>
        <div className="mission-card-line">
          <span className="mission-card-label">XP Reward</span>
          {isEditing ? (
            <input
              type="number"
              name="xp_reward"
              className="edit-input"
              value={editForm.xp_reward}
              onChange={handleChange}
            />
          ) : (
            <span>+{Number(editForm.xp_reward).toLocaleString()} XP</span>
          )}
        </div>
      </div>

      <div className="mission-card-actions">
        {isEditing ? (
          <>
            <button
              type="button"
              className="mission-button danger"
              onClick={handleDelete}
              style={{
                marginRight: "auto",
                backgroundColor: "#dc3545",
                color: "#fff",
              }}
            >
              Delete
            </button>
            <button
              type="button"
              className="mission-button secondary"
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="mission-button primary"
              onClick={handleSave}
            >
              Save
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              className="mission-button secondary"
              onClick={() => setIsEditing(true)}
            >
              Edit
            </button>
            <button type="button" className="mission-button primary">
              View Details
            </button>
          </>
        )}
      </div>
    </article>
  );
}

// --- MAIN MISSION PAGE WITH CREATION LOGIC ---
function MissionPage() {
  const [missions, setMissions] = useState([]);
  const [routes, setRoutes] = useState([]); // Dynamic lists straight from your DB table
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("Active");

  // Modal toggle & new creation form mapping state
  const [showModal, setShowModal] = useState(false);
  const [newMission, setNewMission] = useState({
    title: "",
    requirement: "",
    date_range: "Oct 12 - Oct 14",
    xp_reward: 500,
    status: "Active",
    route_id: "",
  });

  const fetchMissions = () => {
    fetch("http://localhost/EcoQuest/api/index.php?endpoint=missions")
      .then((res) => {
        if (!res.ok)
          throw new Error("Failed to communicate with local PHP server.");
        return res.json();
      })
      .then((data) => {
        setMissions(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  // Pre-load your routes table to populate the selector dropdown list
  const fetchRoutes = () => {
    fetch("http://localhost/EcoQuest/api/index.php?endpoint=routes")
      .then((res) => res.json())
      .then((data) => setRoutes(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Could not fetch database routes:", err));
  };

  useEffect(() => {
    fetchMissions();
    fetchRoutes(); // Optional fallback if routes endpoint isn't fully configured
  }, []);

  const handleCreateChange = (e) => {
    const { name, value } = e.target;
    setNewMission((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    fetch("http://localhost/EcoQuest/api/index.php?endpoint=missions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newMission),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setShowModal(false);
          // Reset form keys safely
          setNewMission({
            title: "",
            requirement: "",
            date_range: "Oct 12 - Oct 14",
            xp_reward: 500,
            status: "Active",
            route_id: "",
          });
          fetchMissions(); // Refresh the list view grid instantly
        } else {
          alert(data.message || "Failed to submit new database entry.");
        }
      })
      .catch((err) => console.error("Error creating mission:", err));
  };

  const filteredMissions = missions.filter((mission) => {
    const title = mission.title || "";
    const routeName = mission.assigned_route || "";
    const currentStatus = mission.status || "Active";

    const matchesSearch =
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      routeName.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    return currentStatus.toLowerCase() === activeFilter.toLowerCase();
  });

  return (
    <section className="mission-page">
      <Header
        title="Mission Management"
        subtitle="Oversee active campaigns, manage requirements, and track global progress."
        searchPlaceholder="Search missions, routes..."
        onSearchChange={(e) => setSearchQuery(e.target.value)}
        searchValue={searchQuery}
        actions={
          <button
            type="button"
            className="filled-action"
            onClick={() => setShowModal(true)}
          >
            Create New Mission
          </button>
        }
      />

      <section className="mission-filters" aria-label="Mission filters">
        <div className="filter-pills">
          {missionFilters.map((filter) => (
            <button
              key={filter}
              type="button"
              className={`filter-pill${activeFilter === filter ? " active" : ""}`}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>
      </section>

      {/* --- POPUP FORM MODAL --- */}
      {showModal && (
        <div
          className="modal-backdrop"
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
            className="modal-content"
            style={{
              backgroundColor: "#fff",
              padding: "30px",
              borderRadius: "12px",
              width: "450px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
            }}
          >
            <h2 style={{ marginBottom: "20px" }}>Create New Mission</h2>
            <form
              onSubmit={handleCreateSubmit}
              style={{ display: "flex", flexDirection: "column", gap: "15px" }}
            >
              <label>
                <strong>Mission Title</strong>
                <input
                  type="text"
                  name="title"
                  required
                  value={newMission.title}
                  onChange={handleCreateChange}
                  style={{ width: "100%", padding: "8px", marginTop: "5px" }}
                />
              </label>

              <label>
                <strong>Requirement / Description</strong>
                <input
                  type="text"
                  name="requirement"
                  required
                  value={newMission.requirement}
                  onChange={handleCreateChange}
                  style={{ width: "100%", padding: "8px", marginTop: "5px" }}
                />
              </label>

              <label>
                <strong>Assigned Route</strong>
                <select
                  name="route_id"
                  value={newMission.route_id}
                  onChange={handleCreateChange}
                  style={{ width: "100%", padding: "8px", marginTop: "5px" }}
                >
                  <option value="">Select a Route Path</option>
                  {/* Map over incoming routes array rows dynamically */}
                  {routes.map((route) => (
                    <option key={route.id} value={route.id}>
                      {route.name}
                    </option>
                  ))}
                  {/* Static options fallback if routes fetch isn't working yet */}
                  {routes.length === 0 && (
                    <>
                      <option value="1">Coastal Bay Trail</option>
                      <option value="2">Rizal Park Loop</option>
                      <option value="3">Tech District Path</option>
                    </>
                  )}
                </select>
              </label>

              <label>
                <strong>Date Range</strong>
                <input
                  type="text"
                  name="date_range"
                  value={newMission.date_range}
                  onChange={handleCreateChange}
                  style={{ width: "100%", padding: "8px", marginTop: "5px" }}
                />
              </label>

              <label>
                <strong>XP Reward</strong>
                <input
                  type="number"
                  name="xp_reward"
                  value={newMission.xp_reward}
                  onChange={handleCreateChange}
                  style={{ width: "100%", padding: "8px", marginTop: "5px" }}
                />
              </label>

              <label>
                <strong>Initial Status</strong>
                <select
                  name="status"
                  value={newMission.status}
                  onChange={handleCreateChange}
                  style={{ width: "100%", padding: "8px", marginTop: "5px" }}
                >
                  {missionFilters.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </label>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "10px",
                  marginTop: "15px",
                }}
              >
                <button
                  type="button"
                  className="mission-button secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="mission-button primary"
                  style={{ backgroundColor: "#28a745", color: "#fff" }}
                >
                  Add Mission
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <section className="mission-grid" aria-label="Mission cards">
        {loading && (
          <p style={{ gridColumn: "1 / -1", padding: "20px" }}>
            Loading missions...
          </p>
        )}
        {error && (
          <p style={{ gridColumn: "1 / -1", padding: "20px", color: "red" }}>
            Error: {error}
          </p>
        )}

        {!loading && !error && filteredMissions.length === 0 && (
          <p
            style={{
              gridColumn: "1 / -1",
              padding: "40px",
              textAlign: "center",
            }}
          >
            No missions found matching the "{activeFilter}" criteria.
          </p>
        )}

        {!loading &&
          !error &&
          filteredMissions.map((mission) => (
            <MissionCard
              key={mission.id || mission.title}
              mission={mission}
              onSaveSuccess={fetchMissions}
            />
          ))}
      </section>
    </section>
  );
}

export default MissionPage;
