﻿import { useState, useEffect } from "react";
import Header from "../components/Header";

const missionFilters = ["Active", "Scheduled", "Archived"];

function MissionCard({ mission, onSaveSuccess }) {
  const [isEditing, setIsEditing] = useState(false);

  // Local form states synced with incoming mission properties
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
          onSaveSuccess(); // Refresh parent view array metrics
        } else {
          alert(data.message || "Failed to update database record.");
        }
      })
      .catch((err) => console.error("Error updating mission:", err));
  };

  return (
    <article className="mission-card">
      <div className="mission-card-header">
        <div>
          {isEditing ? (
            <input
              type="text"
              name="title"
              className="edit-input title-field"
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

function MissionPage() {
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("Active");

  const fetchMissions = () => {
    fetch("http://localhost/EcoQuest/api/index.php?endpoint=missions")
      .then((response) => {
        if (!response.ok)
          throw new Error("Failed to communicate with local PHP server.");
        return response.json();
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

  useEffect(() => {
    fetchMissions();
  }, []);

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
          <button type="button" className="filled-action">
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
