﻿import { useState, useEffect } from "react";
import Header from "../components/Header";

const missionFilters = ["Active", "Scheduled", "Archived"];

function MissionCard({ mission }) {
  // Gracefully handle raw columns coming straight from your database query
  const displayId = mission.id ? `MS-${mission.id}` : "N/A";
  const displayRoute = mission.assigned_route || "Unassigned Route";
  const displayRequirement =
    mission.requirement || mission.description || "No specific target";
  const displayReward = mission.xp_reward ? `+${mission.xp_reward} XP` : "0 XP";

  // Use dates from database if present, otherwise fallback to mock data seen in your UI mockup
  const displayDate = mission.date_range || "Oct 12 - Oct 14";
  const displayStatus = mission.status || "Active";

  return (
    <article className="mission-card">
      <div className="mission-card-header">
        <div>
          <h3>{mission.title || "Untitled Mission"}</h3>
          <p className="mission-card-id">ID: {displayId}</p>
        </div>
        <span
          className={`mission-card-badge mission-card-badge-${displayStatus.toLowerCase()}`}
        >
          {displayStatus}
        </span>
      </div>

      <div className="mission-card-meta">
        <div className="mission-card-line">
          <span className="mission-card-label">Assigned Route</span>
          <span>{displayRoute}</span>
        </div>
        <div className="mission-card-line">
          <span className="mission-card-label">Requirement</span>
          <span>{displayRequirement}</span>
        </div>
        <div className="mission-card-line">
          <span className="mission-card-label">Date Range</span>
          <span>{displayDate}</span>
        </div>
        <div className="mission-card-line">
          <span className="mission-card-label">XP Reward</span>
          <span>{displayReward}</span>
        </div>
      </div>

      <div className="mission-card-actions">
        <button type="button" className="mission-button secondary">
          Edit
        </button>
        <button type="button" className="mission-button primary">
          View Details
        </button>
      </div>
    </article>
  );
}

function MissionPage() {
  // 1. Core State Hooks
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 2. Filter & Search UI State Hooks
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("Active");

  // 3. Fetch data from XAMPP local PHP server on mount
  useEffect(() => {
    fetch("http://localhost/EcoQuest/api/index.php?endpoint=missions")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to communicate with local PHP server.");
        }
        return response.json();
      })
      .then((data) => {
        setMissions(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Database connection error:", err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // 4. Client-Side Interactive Filtering Matrix
  const filteredMissions = missions.filter((mission) => {
    const title = mission.title || "";
    const routeName = mission.assigned_route || "";
    const currentStatus = mission.status || "Active"; // fallback default matching your UI screenshots

    // Step A: Evaluate Search Criteria (Matches Title OR Joined Route Name)
    const matchesSearch =
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      routeName.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    // Step B: Evaluate Pill Filter Status Condition
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

      {/* Handling Loading state wrappers, Server errors, or Empty Database States cleanly */}
      <section className="mission-grid" aria-label="Mission cards">
        {loading && (
          <p style={{ gridColumn: "1 / -1", padding: "20px" }}>
            Loading missions from ecoquest schema...
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
            <MissionCard key={mission.id || mission.title} mission={mission} />
          ))}
      </section>
    </section>
  );
}

export default MissionPage;
