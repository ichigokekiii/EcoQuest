﻿import Header from "../components/Header";

const missionFilters = ["Active", "Scheduled", "Archived"];

const missionCards = [
  {
    title: "Plastic-Free Weekend",
    id: "MS-2049A",
    status: "Active",
    route: "Coastal Bay Trail",
    requirement: "Collect 15 PET Bottles",
    date: "Oct 12 - Oct 14",
    reward: "+500 XP",
  },
  {
    title: "Urban Park Cleanup",
    id: "MS-2050B",
    status: "Active",
    route: "Rizal Park Loop",
    requirement: "Clear 3 Trash Spots",
    date: "Oct 01 - Oct 31",
    reward: "+120 XP",
  },
  {
    title: "E-Waste Collection",
    id: "MS-2051C",
    status: "Scheduled",
    route: "Tech District Path",
    requirement: "Submit 2 E-Waste Photos",
    date: "Nov 01 - Nov 15",
    reward: "+800 XP",
  },
];

function MissionCard({ mission }) {
  return (
    <article className="mission-card">
      <div className="mission-card-header">
        <div>
          <h3>{mission.title}</h3>
          <p className="mission-card-id">ID: {mission.id}</p>
        </div>
        <span
          className={`mission-card-badge mission-card-badge-${mission.status.toLowerCase()}`}
        >
          {mission.status}
        </span>
      </div>

      <div className="mission-card-meta">
        <div className="mission-card-line">
          <span className="mission-card-label">Assigned Route</span>
          <span>{mission.route}</span>
        </div>
        <div className="mission-card-line">
          <span className="mission-card-label">Requirement</span>
          <span>{mission.requirement}</span>
        </div>
        <div className="mission-card-line">
          <span className="mission-card-label">Date Range</span>
          <span>{mission.date}</span>
        </div>
        <div className="mission-card-line">
          <span className="mission-card-label">XP Reward</span>
          <span>{mission.reward}</span>
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
  return (
    <section className="mission-page">
      <Header
        title="Mission Management"
        subtitle="Oversee active campaigns, manage requirements, and track global progress."
        searchPlaceholder="Search missions, routes..."
        actions={
          <button type="button" className="filled-action">
            Create New Mission
          </button>
        }
      />

      <section className="mission-filters" aria-label="Mission filters">
        <div className="filter-pills">
          {missionFilters.map((filter, index) => (
            <button
              key={filter}
              type="button"
              className={`filter-pill${index === 0 ? " active" : ""}`}
            >
              {filter}
            </button>
          ))}
        </div>
      </section>

      <section className="mission-grid" aria-label="Mission cards">
        {missionCards.map((mission) => (
          <MissionCard key={mission.id} mission={mission} />
        ))}
      </section>
    </section>
  );
}

export default MissionPage;
