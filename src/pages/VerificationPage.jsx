import { useState, useEffect } from "react";
import Header from "../components/Header";

function VerificationCard({ item, onAction }) {
  // Check if image path is a remote Unsplash URL or a local file upload string
  const resolvedImageSrc =
    item.proof_image &&
    (item.proof_image.startsWith("http://") ||
      item.proof_image.startsWith("https://"))
      ? item.proof_image
      : `http://localhost/EcoQuest/public/submissions/${item.proof_image}`;

  // Formats row timestamp into relative readable strings
  const formatTimeAgo = (dateString) => {
    if (!dateString) return "Recent";
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInHrs = Math.floor(diffInMs / (1000 * 60 * 60));

    if (diffInHrs < 1) return "Just now";
    if (diffInHrs === 1) return "1 hr ago";
    if (diffInHrs < 24) return `${diffInHrs} hrs ago`;
    return date.toLocaleDateString();
  };

  return (
    <article className="verification-card">
      <div
        className="verification-card-image"
        style={{ backgroundImage: `url(${resolvedImageSrc})` }}
      >
        <span className="verification-card-time">
          {formatTimeAgo(item.created_at)}
        </span>
      </div>
      <div className="verification-card-body">
        <div className="verification-card-info">
          <div>
            <p className="verification-user">
              {item.username || "Unknown Explorer"}
            </p>
            <p className="verification-location">
              {item.route_title || "Unassigned Location"}
            </p>
          </div>
          <span className="verification-type">{item.trash_category}</span>
        </div>

        {item.status?.toLowerCase() === "pending" ? (
          <div className="verification-card-actions">
            <button
              type="button"
              className="verification-button reject-button"
              onClick={() => onAction(item.id, "Rejected")}
            >
              Reject
            </button>
            <button
              type="button"
              className="verification-button approve-button"
              onClick={() => onAction(item.id, "Approved")}
            >
              Approve
            </button>
          </div>
        ) : (
          <div className="verification-status-badge">
            <span
              className={`status-chip ${item.status?.toLowerCase() === "approved" ? "success" : "danger"}`}
            >
              {item.status}
            </span>
          </div>
        )}
      </div>
    </article>
  );
}

function VerificationPage() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filter controls
  const [searchQuery, setSearchQuery] = useState("");
  const [routeFilter, setRouteFilter] = useState("All Routes");
  const [statusFilter, setStatusFilter] = useState("Pending");

  // Dropdown visibility toggles
  const [routeDropdownOpen, setRouteDropdownOpen] = useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);

  // Pagination state tracker
  const [visibleCount, setVisibleCount] = useState(6);

  const fetchSubmissions = () => {
    setLoading(true);
    fetch("http://localhost/EcoQuest/api/index.php?endpoint=submissions")
      .then((res) => {
        if (!res.ok)
          throw new Error(
            "Could not download recent clean-up database metrics.",
          );
        return res.json();
      })
      .then((data) => {
        setSubmissions(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const handleUpdateStatus = (id, newStatus) => {
    const formData = new FormData();
    formData.append("status", newStatus);

    fetch(
      `http://localhost/EcoQuest/api/index.php?endpoint=submissions&id=${id}`,
      {
        method: "POST",
        body: formData,
      },
    )
      .then((res) => {
        if (!res.ok)
          throw new Error("Failed to change validation state record.");
        return res.json();
      })
      .then(() => {
        // Optimized internal loop state update to refresh view row instantly
        setSubmissions((prev) =>
          prev.map((sub) =>
            sub.id === id ? { ...sub, status: newStatus } : sub,
          ),
        );
      })
      .catch((err) => alert(`Action Failed: ${err.message}`));
  };

  // Compile individual route labels present in dataset dynamically
  const dynamicRoutesList = [
    "All Routes",
    ...new Set(submissions.map((s) => s.route_title).filter(Boolean)),
  ];

  const statusOptions = ["All Submissions", "Pending", "Approved", "Rejected"];

  // Search & filter matching engine
  const filteredSubmissions = submissions.filter((item) => {
    const user = item.username || "";
    const route = item.route_title || "";
    const category = item.trash_category || "";
    const currentStatus = item.status || "Pending";

    const matchesSearch =
      user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      route.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    const matchesRoute = routeFilter === "All Routes" || route === routeFilter;
    const matchesStatus =
      statusFilter === "All Submissions" ||
      currentStatus.toLowerCase() === statusFilter.toLowerCase();

    return matchesRoute && matchesStatus;
  });

  const visibleSubmissions = filteredSubmissions.slice(0, visibleCount);

  return (
    <section className="verification-page">
      <Header
        title="Trash Submission Verification"
        subtitle="Review and validate user-submitted proof of environmental cleanup."
        searchPlaceholder="Search verifications..."
        searchValue={searchQuery}
        onSearchChange={(e) => setSearchQuery(e.target.value)}
      />

      <section
        className="verification-toolbar"
        aria-label="Verification filters"
      >
        <div
          className="verification-filters"
          style={{ display: "flex", gap: "12px" }}
        >
          {/* Route Filter Dropdown */}
          <div style={{ position: "relative" }}>
            <button
              type="button"
              className="dropdown-button"
              onClick={() => {
                setRouteDropdownOpen(!routeDropdownOpen);
                setStatusDropdownOpen(false);
              }}
            >
              {routeFilter} <span>▾</span>
            </button>
            {routeDropdownOpen && (
              <div
                className="custom-dropdown-menu"
                style={{
                  position: "absolute",
                  zIndex: 10,
                  background: "#fff",
                  border: "1px solid #ccc",
                  borderRadius: "6px",
                  marginTop: "4px",
                  minWidth: "160px",
                }}
              >
                {dynamicRoutesList.map((r) => (
                  <div
                    key={r}
                    style={{ padding: "8px 12px", cursor: "pointer" }}
                    onClick={() => {
                      setRouteFilter(r);
                      setRouteDropdownOpen(false);
                    }}
                  >
                    {r}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Status Filter Dropdown */}
          <div style={{ position: "relative" }}>
            <button
              type="button"
              className="dropdown-button"
              onClick={() => {
                setStatusDropdownOpen(!statusDropdownOpen);
                setRouteDropdownOpen(false);
              }}
            >
              {statusFilter} <span>▾</span>
            </button>
            {statusDropdownOpen && (
              <div
                className="custom-dropdown-menu"
                style={{
                  position: "absolute",
                  zIndex: 10,
                  background: "#fff",
                  border: "1px solid #ccc",
                  borderRadius: "6px",
                  marginTop: "4px",
                  minWidth: "160px",
                }}
              >
                {statusOptions.map((s) => (
                  <div
                    key={s}
                    style={{ padding: "8px 12px", cursor: "pointer" }}
                    onClick={() => {
                      setStatusFilter(s);
                      setStatusDropdownOpen(false);
                    }}
                  >
                    {s}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {loading && (
        <p style={{ padding: "40px 20px", textAlign: "center" }}>
          Loading eco claims from data records...
        </p>
      )}
      {error && (
        <p style={{ padding: "40px 20px", color: "red", textAlign: "center" }}>
          Error: {error}
        </p>
      )}

      {!loading && !error && (
        <>
          <section
            className="verification-grid"
            aria-label="Verification submissions"
          >
            {visibleSubmissions.length === 0 ? (
              <div
                style={{
                  gridColumn: "1 / -1",
                  textAlign: "center",
                  padding: "40px",
                  color: "#666",
                }}
              >
                No tracking claims found matching selection options.
              </div>
            ) : (
              visibleSubmissions.map((item) => (
                <VerificationCard
                  key={item.id}
                  item={item}
                  onAction={handleUpdateStatus}
                />
              ))
            )}
          </section>

          {filteredSubmissions.length > visibleCount && (
            <div className="verification-footer">
              <button
                type="button"
                className="load-more-button"
                onClick={() => setVisibleCount((prev) => prev + 6)}
              >
                Load More Submissions <span>▾</span>
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}

export default VerificationPage;
