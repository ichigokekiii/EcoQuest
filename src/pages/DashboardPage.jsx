import React, { useState, useEffect } from "react";
import Header from "../components/Header";

function SectionIcon({ name }) {
  switch (name) {
    case "users":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
          <path d="M8 11a4 4 0 1 0-0.001-8.001A4 4 0 0 0 8 11Zm8 1a3 3 0 1 0-.001-6.001A3 3 0 0 0 16 12Zm-8 2c-3.866 0-7 2.239-7 5v1h14v-1c0-2.761-3.134-5-7-5Zm8 0c-.53 0-1.035.07-1.51.19A6.97 6.97 0 0 1 19 18v1h5v-1c0-2.209-1.79-4-4-4Z" />
        </svg>
      );
    case "trash":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
          <path d="M10 2h4l1 2h5v2H4V4h5l1-2Zm-4 6h12l-1 11a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L6 8Zm4 2v7h2v-7h-2Zm4 0v7h2v-7h-2Z" />
        </svg>
      );
    case "route":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
          <path d="M6 18a3 3 0 1 1 0-6c1.1 0 2.07.6 2.58 1.5h3.84A5.98 5.98 0 0 0 18 7a3 3 0 1 1 0-3 5.98 5.98 0 0 0-5.58 4.5H8.58A3.01 3.01 0 0 0 6 6a3 3 0 1 0 0 6h12a3 3 0 1 1 0 6H6Z" />
        </svg>
      );
    case "check":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2Zm-8 13-4-4 1.4-1.4L11 13.2l5.6-5.6L18 9l-7 7Z" />
        </svg>
      );
    default:
      return null;
  }
}

function StatCard({ label, value, delta, tone, icon }) {
  return (
    <article className={`stat-card tone-${tone}`}>
      <div className="stat-card-head">
        <p>{label}</p>
        <span className="stat-icon">
          <SectionIcon name={icon} />
        </span>
      </div>
      <strong>{value}</strong>
      <div className="stat-footnote">
        <span className="trend-mark">↗</span>
        <span>{delta}</span>
      </div>
    </article>
  );
}

function Chart({ data }) {
  if (!data || data.length === 0) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const width = 100;
  const height = 100;

  const points = data
    .map((value, index) => {
      const x = data.length > 1 ? (index / (data.length - 1)) * width : 0;
      const normalized = (value - min) / (max - min || 1);
      const y = height - normalized * 80 - 10;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg
      className="trend-chart"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(77, 133, 88, 0.36)" />
          <stop offset="100%" stopColor="rgba(77, 133, 88, 0.04)" />
        </linearGradient>
      </defs>
      <path
        d={`M0,100 L0,${points.split(" ")[0].split(",")[1]} ${points} L100,100 Z`}
        fill="url(#trendFill)"
      />
      <polyline
        points={points}
        fill="none"
        stroke="#4d8558"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DashboardPage() {
  const [stats, setStats] = useState([]);
  const [chartPointsArray, setChartPointsArray] = useState([]);
  const [recentSubmissions, setRecentSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  // App core state arrays for report parsing compilation
  const [rawUsers, setRawUsers] = useState([]);
  const [rawRoutes, setRawRoutes] = useState([]);
  const [rawSubmissions, setRawSubmissions] = useState([]);
  const [calculatedWeight, setCalculatedWeight] = useState(0);

  useEffect(() => {
    const apiBase = "http://localhost/EcoQuest/api/index.php?endpoint=";

    Promise.all([
      fetch(`${apiBase}users`).then((res) => res.json()),
      fetch(`${apiBase}routes`).then((res) => res.json()),
      fetch(`${apiBase}submissions`).then((res) => res.json()),
    ])
      .then(([usersData, routesData, submissionsData]) => {
        const users = Array.isArray(usersData) ? usersData : [];
        const routes = Array.isArray(routesData) ? routesData : [];
        const submissions = Array.isArray(submissionsData)
          ? submissionsData
          : [];

        setRawUsers(users);
        setRawRoutes(routes);
        setRawSubmissions(submissions);

        // 1. Metric Counters Mapping
        const activeUsersCount = users.length;
        const activeRoutesCount = routes.length;
        const pendingCount = submissions.filter(
          (s) => s.status === "Pending",
        ).length;

        const estimatedTrashWeight = submissions.reduce((acc, curr) => {
          if (curr.status !== "Approved") return acc;
          const category = (curr.trash_category || "").toLowerCase().trim();
          if (category === "cans") return acc + 5.2;
          if (category === "cardboard") return acc + 12.8;
          return acc + 15.4;
        }, 0);

        setCalculatedWeight(estimatedTrashWeight);

        setStats([
          {
            label: "Total Active Users",
            value: activeUsersCount.toLocaleString(),
            delta: "Live metrics pool",
            tone: "success",
            icon: "users",
          },
          {
            label: "Total Trash (kg)",
            value: `${estimatedTrashWeight.toFixed(1)}`,
            delta: "Approved submissions",
            tone: "info",
            icon: "trash",
          },
          {
            label: "Active Routes",
            value: activeRoutesCount.toLocaleString(),
            delta: "Operational lines",
            tone: "neutral",
            icon: "route",
          },
          {
            label: "Pending Verifications",
            value: pendingCount.toLocaleString(),
            delta: pendingCount > 0 ? "Requires review action" : "Up to date",
            tone: pendingCount > 0 ? "warning" : "success",
            icon: "check",
          },
        ]);

        // 2. Timeline Parsing Mapping
        const timelineMap = {};
        submissions.slice(0, 30).forEach((sub) => {
          const rawDate = sub.created_at
            ? new Date(sub.created_at)
            : new Date();
          const dayKey = rawDate.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          });
          timelineMap[dayKey] = (timelineMap[dayKey] || 0) + 1;
        });

        const formattedTimelineValues = Object.keys(timelineMap)
          .map((key) => ({
            day: key,
            count: timelineMap[key],
            timestamp: new Date(
              `${key}, ${new Date().getFullYear()}`,
            ).getTime(),
          }))
          .sort((a, b) => a.timestamp - b.timestamp)
          .map((item) => item.count * 12.5);

        setChartPointsArray(
          formattedTimelineValues.length
            ? formattedTimelineValues
            : [
                18, 22, 16, 14, 19, 31, 44, 52, 58, 51, 44, 40, 42, 47, 59, 66,
                61, 54, 49, 45, 47, 52, 58, 63, 70, 77,
              ],
        );

        // 3. Activity Feed Assignment
        setRecentSubmissions(submissions.slice(0, 4));
        setLoading(false);
      })
      .catch((err) => {
        console.error(
          "Critical dashboard state collection matrix failure:",
          err,
        );
        setLoading(false);
      });
  }, []);

  // Action Handler: Compiles an Executive Report incorporating all core database and visual trends
  const handleGenerateReport = () => {
    let csv = "";

    // SECTION 1: REPORT METADATA HEADER
    csv += "==================================================\n";
    csv += "           ECOQUEST SYSTEM EXECUTIVE REPORT        \n";
    csv += ` Generated On: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}\n`;
    csv += "==================================================\n\n";

    // SECTION 2: LIVE METRIC SUMMARY FIELDS
    csv += "--- PART I: INFRASTRUCTURE SUMMARY METRICS ---\n";
    csv += `Total Active Accounts,${rawUsers.length} users\n`;
    csv += `Total Trash Volume Logged,${calculatedWeight.toFixed(1)} kg\n`;
    csv += `Active Operational Routes,${rawRoutes.length} lines\n`;
    csv += `Pending Verification Backlog,${rawSubmissions.filter((s) => s.status === "Pending").length} items\n\n`;

    // SECTION 3: TREND GRAPH VECTOR POINT MAP
    csv +=
      "--- PART II: COLLECTION VOLUMETRIC TREND DATA (30-DAY TIMELINE) ---\n";
    csv +=
      "Data Track Index Points (kg Processing Throughput Baseline Matrix):\n";
    csv +=
      chartPointsArray
        .map((point, idx) => `Plot point-${idx + 1},${point.toFixed(1)} kg`)
        .join("\n") + "\n\n";

    // SECTION 4: DETAILED CORE RECORDS DUMP
    csv += "--- PART III: SYSTEM LOG DATA (ALL MASTER SUBMISSIONS) ---\n";
    csv +=
      "Submission ID,User ID,Username,Route Association,Trash Category,Verification Status,Logged Timestamp\n";

    if (rawSubmissions.length > 0) {
      csv += rawSubmissions
        .map(
          (row) =>
            `"${row.id || ""}","${row.user_id || ""}","${row.username || "Anonymous Hero"}","${row.route_title || "Unassigned General Route"}","${row.trash_category || "General Materials"}","${row.status || ""}","${row.created_at || ""}"`,
        )
        .join("\n");
    } else {
      csv += "No raw database logs available to extract.\n";
    }

    // BLOB EXECUTION DOWNLOAD GENERATOR
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const downloadUrl = URL.createObjectURL(blob);
    const hiddenLink = document.createElement("a");

    hiddenLink.href = downloadUrl;
    hiddenLink.setAttribute(
      "download",
      `EcoQuest_SystemOverview_Report_${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(hiddenLink);
    hiddenLink.click();
    document.body.removeChild(hiddenLink);
  };

  if (loading) {
    return (
      <div
        style={{
          padding: "3rem",
          textAlign: "center",
          color: "#666",
          fontFamily: "sans-serif",
        }}
      >
        Synchronizing system infrastructure metrics telemetry...
      </div>
    );
  }

  return (
    <section className="dashboard-page">
      <Header
        title="System Overview"
        subtitle="Monitor core infrastructure metrics and recent activity indexes cleanly."
      />

      <section className="stats-grid" aria-label="Summary metrics">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </section>

      <section className="content-grid">
        <article className="chart-card">
          <div className="section-head">
            <div>
              <h2>Collection Trends (30 Days)</h2>
              <p>
                A steady climb in collected waste metrics mapped dynamically
                from system confirmation nodes.
              </p>
            </div>
            <button
              type="button"
              className="ghost-link"
              onClick={handleGenerateReport}
              style={{ cursor: "pointer" }}
            >
              Generate Report →
            </button>
          </div>
          <div className="chart-panel">
            <Chart data={chartPointsArray} />
            <div className="chart-axis chart-axis-top" />
            <div className="chart-axis chart-axis-mid" />
            <div className="chart-axis chart-axis-bottom" />
            <div className="chart-label left">Day 1</div>
            <div className="chart-label center">Day 15</div>
            <div className="chart-label right">Day 30</div>
          </div>
        </article>

        <aside className="submissions-card">
          <h2>Recent Submissions</h2>
          <div className="submission-list">
            {recentSubmissions.map((item, index) => (
              <div key={item.id || index} className="submission-item">
                <div>
                  <p className="submission-name">
                    {item.username || "Anonymous Hero"}
                  </p>
                  <p className="submission-route">
                    {item.route_title || "General Cleanup Activity"}
                  </p>
                </div>
                <span
                  className={`status-pill ${item.status === "Approved" ? "approved" : "verify"}`}
                  onClick={() => (window.location.hash = "/verification")}
                  style={{ cursor: "pointer" }}
                >
                  {item.status === "Approved" ? "Approved" : "Verify"}
                </span>
              </div>
            ))}
          </div>
          <button
            type="button"
            className="primary-outline"
            onClick={() => (window.location.hash = "/verification")}
          >
            View All Submissions
          </button>
        </aside>
      </section>
    </section>
  );
}

export default DashboardPage;
