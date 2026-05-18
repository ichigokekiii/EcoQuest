import { useState, useEffect } from "react";
import Header from "../components/Header";

function UsersPage() {
  // 1. Core State Management
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Interactive UI State
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All Users");

  const filters = ["All Users", "Admins Only", "Banned"];

  // 2. Fetch data from XAMPP local server on mount
  useEffect(() => {
    fetch("http://localhost/EcoQuest/api/index.php?endpoint=users")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to communicate with local PHP server.");
        }
        return response.json();
      })
      .then((data) => {
        setUsers(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Database connection error:", err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // 3. Helper Functions for Dynamic UI Data mapping
  const getInitials = (username) => {
    if (!username) return "EQ";
    return username
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const calculateLevel = (points) => {
    const numericPoints = Number(points) || 0;
    // Progression logic: 1 level per 1,000 points
    return Math.floor(numericPoints / 1000) + 1;
  };

  // 4. Dynamic Client-Side Filtering and Searching
  const filteredUsers = users.filter((user) => {
    // Null safety fallback values to avoid application crashes
    const username = user.username || "";
    const email = user.email || "";
    const role = user.role || "User";
    const isBanned =
      user.is_banned === 1 ||
      user.is_banned === "1" ||
      user.status === "Banned";

    // Search filter logic (matches Username or Email matches)
    const matchesSearch =
      username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    // Pill filter logic
    if (activeFilter === "Admins Only") {
      return role.toLowerCase() === "admin";
    }
    if (activeFilter === "Banned") {
      return isBanned;
    }
    return true; // "All Users"
  });

  return (
    <section className="users-page">
      <Header
        title="User Management"
        subtitle="View, filter, and manage EcoQuest community members."
        searchPlaceholder="Search users..."
        onSearchChange={(e) => setSearchQuery(e.target.value)}
        searchValue={searchQuery}
        actions={
          <>
            <button type="button" className="outline-action">
              Export CSV
            </button>
            <button type="button" className="filled-action">
              Invite User
            </button>
          </>
        }
      />

      <section className="users-toolbar" aria-label="User filters">
        <div className="filter-pills">
          {filters.map((filter) => (
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

        <div className="toolbar-meta">
          <span>
            Showing {filteredUsers.length} of {users.length} users
          </span>
          <button
            type="button"
            className="icon-button nav-arrow"
            aria-label="Previous page"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M15.41 16.59 10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41Z" />
            </svg>
          </button>
          <button
            type="button"
            className="icon-button nav-arrow"
            aria-label="Next page"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="m8.59 16.59 4.58-4.59-4.58-4.59L10 6l6 6-6 6-1.41-1.41Z" />
            </svg>
          </button>
        </div>
      </section>

      <section className="users-table-card" aria-label="Users table">
        {loading && (
          <p style={{ padding: "20px" }}>Loading system users from server...</p>
        )}
        {error && (
          <p style={{ padding: "20px", color: "red" }}>Error: {error}</p>
        )}

        {!loading && !error && (
          <table className="users-table">
            <thead>
              <tr>
                <th>Avatar</th>
                <th>Name &amp; Email</th>
                <th>Role</th>
                <th>Level</th>
                <th>Total Points</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    style={{ textAlign: "center", padding: "20px" }}
                  >
                    No community members found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const isBanned =
                    user.is_banned === 1 ||
                    user.is_banned === "1" ||
                    user.status === "Banned";
                  return (
                    <tr key={user.id || user.email}>
                      <td>
                        <div className="avatar-badge">
                          {getInitials(user.username)}
                        </div>
                      </td>
                      <td>
                        <div className="user-identity">
                          <strong>{user.username || "Unknown User"}</strong>
                          <span>{user.email || "No Email Provided"}</span>
                        </div>
                      </td>
                      <td>
                        <span className="role-chip">{user.role || "User"}</span>
                      </td>
                      <td>Lvl {calculateLevel(user.points)}</td>
                      <td className="xp-cell">
                        {Number(user.points || 0).toLocaleString()} pts
                      </td>
                      <td>
                        <span
                          className={`status-chip ${isBanned ? "danger" : "success"}`}
                        >
                          {isBanned ? "Banned" : "Active"}
                        </span>
                      </td>
                      <td>
                        <button type="button" className="row-action">
                          •••
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </section>
    </section>
  );
}

export default UsersPage;
