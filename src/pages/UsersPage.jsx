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

  // CRUD Target Form States
  const [editingUser, setEditingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);

  // 2. Fetch data from XAMPP local server on mount
  const fetchUsers = () => {
    setLoading(true);
    fetch("http://localhost/EcoQuest/api/index.php?endpoint=users")
      .then((response) => {
        if (!response.ok)
          throw new Error("Failed to communicate with local PHP server.");
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
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 3. Backend Mutation Handlers (Update & Delete)
  const handleUpdateUser = (e) => {
    e.preventDefault();

    // Since our router handles multipart updates via POST when an ID is present,
    // we use FormData here to allow future image uploads if needed, matching the new matrix.
    const formData = new FormData();
    formData.append("username", editingUser.username);
    formData.append("email", editingUser.email);
    formData.append("role", editingUser.role || "User");
    formData.append("status", editingUser.status || "Active");
    formData.append("points", Number(editingUser.points || 0));

    fetch(
      `http://localhost/EcoQuest/api/index.php?endpoint=users&id=${editingUser.id}`,
      {
        method: "POST", // Redirected seamlessly through the backend router matrix
        body: formData,
      },
    )
      .then((res) => {
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          return res.text().then((text) => {
            throw new Error(`Server returned raw HTML text: ${text}`);
          });
        }
        return res.json();
      })
      .then(() => {
        setEditingUser(null);
        fetchUsers(); // Refresh data grid
      })
      .catch((err) => alert(`Update Failed: ${err.message}`));
  };

  const handleDeleteUser = () => {
    fetch(
      `http://localhost/EcoQuest/api/index.php?endpoint=users&id=${deletingUser.id}`,
      {
        method: "DELETE",
      },
    )
      .then((res) => {
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          return res.text().then((text) => {
            throw new Error(`Server returned raw text: ${text}`);
          });
        }
        return res.json();
      })
      .then(() => {
        setDeletingUser(null);
        fetchUsers(); // Refresh data grid
      })
      .catch((err) => alert(`Delete Failed: ${err.message}`));
  };

  // 4. Helper Functions for Dynamic UI Data mapping
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
    return Math.floor(numericPoints / 1000) + 1;
  };

  const handleExportCSV = () => {
    const headers = [
      "ID",
      "Username",
      "Email",
      "Role",
      "Level",
      "Points",
      "Status",
    ];
    const csvRows = filteredUsers.map((user) => [
      user.id,
      `"${user.username.replace(/"/g, '""')}"`,
      `"${user.email}"`,
      user.role || "User",
      calculateLevel(user.points),
      user.points || 0,
      user.status || "Active",
    ]);
    const csvContent = [
      headers.join(","),
      ...csvRows.map((row) => row.join(",")),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `ecoquest_users_${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 5. Dynamic Client-Side Filtering and Searching
  const filteredUsers = users.filter((user) => {
    const username = user.username || "";
    const email = user.email || "";
    const role = user.role || "User";
    const status = user.status || "Active";

    const matchesSearch =
      username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeFilter === "Admins Only") return role.toLowerCase() === "admin";
    if (activeFilter === "Banned") return status.toLowerCase() === "banned";
    return true;
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
            <button
              type="button"
              className="outline-action"
              onClick={handleExportCSV}
            >
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
                <th style={{ textAlign: "center" }}>Actions</th>
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
                  const isAdmin = user.role?.toLowerCase() === "admin";
                  const isBanned = user.status?.toLowerCase() === "banned";

                  // Resolve absolute URL dynamically for uploaded assets or local placeholder strings
                  const resolvedAvatarSrc =
                    user.image_url &&
                    (user.image_url.startsWith("http://") ||
                      user.image_url.startsWith("https://"))
                      ? user.image_url
                      : user.image_url
                        ? `http://localhost/EcoQuest/public/users/${user.image_url}`
                        : null;

                  return (
                    <tr key={user.id || user.email}>
                      <td>
                        <div
                          className="avatar-badge"
                          style={{
                            overflow: "hidden",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {resolvedAvatarSrc ? (
                            <img
                              src={resolvedAvatarSrc}
                              alt={user.username}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                              onError={(e) => {
                                // If local file is missing from folder path, hide it to fall back to text initials
                                e.target.style.display = "none";
                                e.target.parentElement.innerHTML = getInitials(
                                  user.username,
                                );
                              }}
                            />
                          ) : (
                            getInitials(user.username)
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="user-identity">
                          <strong>{user.username || "Unknown User"}</strong>
                          <span>{user.email || "No Email"}</span>
                        </div>
                      </td>
                      <td>
                        <span
                          className={`role-chip ${isAdmin ? "admin-mode" : ""}`}
                        >
                          {user.role || "User"}
                        </span>
                      </td>
                      <td>Lvl {calculateLevel(user.points)}</td>
                      <td className="xp-cell">
                        {Number(user.points || 0).toLocaleString()} pts
                      </td>
                      <td>
                        <span
                          className={`status-chip ${isBanned ? "danger" : "success"}`}
                        >
                          {user.status || "Active"}
                        </span>
                      </td>
                      <td>
                        <div className="inline-row-actions">
                          <button
                            type="button"
                            className="btn-inline-edit"
                            onClick={() => setEditingUser({ ...user })}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="btn-inline-delete"
                            onClick={() => setDeletingUser(user)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </section>

      {/* --- EDIT MODAL --- */}
      {editingUser && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h2>Edit Member Profile</h2>
            <form onSubmit={handleUpdateUser}>
              <label>Username</label>
              <input
                type="text"
                value={editingUser.username}
                onChange={(e) =>
                  setEditingUser({ ...editingUser, username: e.target.value })
                }
                required
              />

              <label>Email Address</label>
              <input
                type="email"
                value={editingUser.email}
                onChange={(e) =>
                  setEditingUser({ ...editingUser, email: e.target.value })
                }
                required
              />

              <div className="form-row">
                <div>
                  <label>Role</label>
                  <select
                    value={editingUser.role || "User"}
                    onChange={(e) =>
                      setEditingUser({ ...editingUser, role: e.target.value })
                    }
                  >
                    <option value="User">User</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label>Status</label>
                  <select
                    value={editingUser.status || "Active"}
                    onChange={(e) =>
                      setEditingUser({ ...editingUser, status: e.target.value })
                    }
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Banned">Banned</option>
                  </select>
                </div>
              </div>

              <label>EcoQuest Total Points</label>
              <input
                type="number"
                value={editingUser.points}
                onChange={(e) =>
                  setEditingUser({ ...editingUser, points: e.target.value })
                }
              />

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setEditingUser(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-save">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- DELETE CONFIRMATION MODAL --- */}
      {deletingUser && (
        <div className="modal-overlay">
          <div className="modal-card user-delete-warn">
            <h2>Delete Account Entry?</h2>
            <p>
              Are you sure you want to completely remove{" "}
              <strong>{deletingUser.username}</strong>? This will permanently
              purge their accumulated eco points database metrics.
            </p>
            <div className="modal-actions">
              <button
                type="button"
                className="btn-cancel"
                onClick={() => setDeletingUser(null)}
              >
                Keep Account
              </button>
              <button
                type="button"
                className="btn-confirm-delete"
                onClick={handleDeleteUser}
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default UsersPage;
