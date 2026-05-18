import React, { useState, useEffect } from "react";
import Header from "../components/Header";

function UserFormModal({ isOpen, onClose, onSave, editUser }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("User");
  const [status, setStatus] = useState("Active");
  const [points, setPoints] = useState("0");
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    if (editUser) {
      setUsername(editUser.username || "");
      setEmail(editUser.email || "");
      setPassword(""); // Keep blank unless resetting explicit value paths
      setRole(editUser.role || "User");
      setStatus(editUser.status || "Active");
      setPoints(editUser.points !== undefined ? editUser.points : "0");
      setImageUrl(editUser.image_url || "");
      setImageFile(null);
    } else {
      setUsername("");
      setEmail("");
      setPassword("");
      setRole("User");
      setStatus("Active");
      setPoints("0");
      setImageFile(null);
      setImageUrl("");
    }
  }, [editUser, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("username", username);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("role", role);
    formData.append("status", status);
    formData.append("points", points);

    if (imageFile) {
      formData.append("image_file", imageFile);
    } else {
      formData.append("image_url", imageUrl);
    }

    onSave(formData, editUser?.id);
  };

  return (
    <div className="modal-overlay" style={modalStyles.overlay}>
      <div className="modal-container" style={modalStyles.container}>
        <div style={modalStyles.header}>
          <h2>{editUser ? "Edit User Account" : "Add New User Account"}</h2>
          <button type="button" onClick={onClose} style={modalStyles.closeX}>
            &times;
          </button>
        </div>
        <form onSubmit={handleSubmit} style={modalStyles.form}>
          <label style={modalStyles.label}>
            Username *
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={modalStyles.input}
            />
          </label>

          <label style={modalStyles.label}>
            Email Address *
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={modalStyles.input}
            />
          </label>

          <label style={modalStyles.label}>
            Password {editUser ? "(Leave blank to keep current)" : "*"}
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required={!editUser}
              style={modalStyles.input}
            />
          </label>

          <div style={{ display: "flex", gap: "0.5rem" }}>
            <label style={{ ...modalStyles.label, flex: 1 }}>
              Role
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                style={modalStyles.input}
              >
                <option value="User">User</option>
                <option value="Admin">Admin</option>
                <option value="Moderator">Moderator</option>
              </select>
            </label>

            <label style={{ ...modalStyles.label, flex: 1 }}>
              Status
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                style={modalStyles.input}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Suspended">Suspended</option>
              </select>
            </label>
          </div>

          <label style={modalStyles.label}>
            Eco-Quest Points Balance
            <input
              type="number"
              min="0"
              value={points}
              onChange={(e) => setPoints(e.target.value)}
              style={modalStyles.input}
            />
          </label>

          <label style={modalStyles.label}>
            Avatar Profile Image File
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files[0])}
              style={modalStyles.input}
            />
          </label>

          <div style={modalStyles.actions}>
            <button
              type="button"
              onClick={onClose}
              style={modalStyles.cancelBtn}
            >
              Cancel
            </button>
            <button type="submit" style={modalStyles.saveBtn}>
              Save Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEditUser, setSelectedEditUser] = useState(null);

  const fetchUsers = () => {
    setLoading(true);
    fetch("http://localhost/EcoQuest/api/index.php?endpoint=users")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setUsers(data);
        } else {
          setUsers([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleFormSubmissionSave = (formDataPayload, id) => {
    const isEdit = !!id;
    const url = isEdit
      ? `http://localhost/EcoQuest/api/index.php?endpoint=users&id=${id}`
      : "http://localhost/EcoQuest/api/index.php?endpoint=users";

    fetch(url, {
      method: "POST",
      body: formDataPayload,
    })
      .then((res) => res.json())
      .then((result) => {
        if (result.success) {
          setIsModalOpen(false);
          setSelectedEditUser(null);
          fetchUsers();
        } else {
          alert("Error Processing User Action: " + result.message);
        }
      })
      .catch((err) => console.error(err));
  };

  const handleDeleteUser = (id) => {
    if (
      window.confirm(
        "Are you entirely sure you want to delete this user record entry?",
      )
    ) {
      fetch(`http://localhost/EcoQuest/api/index.php?endpoint=users&id=${id}`, {
        method: "DELETE",
      })
        .then((res) => res.json())
        .then(() => {
          setUsers((prev) => prev.filter((u) => u.id !== id));
        })
        .catch((err) => console.error(err));
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <section className="users-page" style={{ padding: "1rem" }}>
      <Header
        title="User Management"
        subtitle="Review registered user metrics, update status variables, and configure parameters manually."
        searchPlaceholder="Search users by name or email..."
        onSearchChange={(e) => setSearchQuery(e.target.value)}
        actions={
          <button
            type="button"
            className="filled-action"
            style={{
              padding: "0.6rem 1.2rem",
              background: "#2d5a27",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
            onClick={() => {
              setSelectedEditUser(null);
              setIsModalOpen(true);
            }}
          >
            + Add New User
          </button>
        }
      />

      <div
        style={{
          marginTop: "1.5rem",
          background: "#fff",
          padding: "1rem",
          borderRadius: "8px",
          border: "1px solid #eee",
        }}
      >
        {loading ? (
          <div>Loading database users profile grid metrics...</div>
        ) : (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              textAlign: "left",
            }}
          >
            <thead>
              <tr
                style={{
                  borderBottom: "2px solid #eee",
                  paddingBottom: "0.5rem",
                }}
              >
                <th style={{ padding: "0.5rem" }}>Avatar</th>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Points Balance</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => {
                const userAvatar =
                  user.image_url &&
                  (user.image_url.startsWith("http://") ||
                    user.image_url.startsWith("https://"))
                    ? user.image_url
                    : `http://localhost/EcoQuest/public/users/${user.image_url || "default-user.png"}`;

                return (
                  <tr
                    key={user.id}
                    style={{ borderBottom: "1px solid #f9f9f9" }}
                  >
                    <td style={{ padding: "0.5rem" }}>
                      <img
                        src={userAvatar}
                        alt="avatar"
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "50%",
                          objectFit: "cover",
                          border: "1px solid #ddd",
                        }}
                      />
                    </td>
                    <td style={{ fontWeight: "600" }}>{user.username}</td>
                    <td>{user.email}</td>
                    <td>
                      <span
                        style={{
                          background: "#eee",
                          padding: "0.2rem 0.5rem",
                          borderRadius: "4px",
                          fontSize: "12px",
                        }}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td style={{ fontWeight: "700", color: "#2d5a27" }}>
                      {user.points} pts
                    </td>
                    <td>
                      <span
                        style={{
                          color:
                            user.status === "Active" ? "#2b7a1d" : "#c92a2a",
                          fontWeight: "600",
                        }}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedEditUser(user);
                          setIsModalOpen(true);
                        }}
                        style={{
                          marginRight: "0.5rem",
                          padding: "0.3rem 0.7rem",
                          background: "#f1f3f5",
                          border: "1px solid #ccc",
                          borderRadius: "4px",
                          cursor: "pointer",
                        }}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteUser(user.id)}
                        style={{
                          padding: "0.3rem 0.7rem",
                          background: "#fff5f5",
                          color: "#c92a2a",
                          border: "1px solid #ffc9c9",
                          borderRadius: "4px",
                          cursor: "pointer",
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <UserFormModal
        isOpen={isModalOpen}
        editUser={selectedEditUser}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedEditUser(null);
        }}
        onSave={handleFormSubmissionSave}
      />
    </section>
  );
}

const modalStyles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  container: {
    background: "#fff",
    padding: "1.5rem",
    borderRadius: "12px",
    width: "100%",
    maxWidth: "450px",
    maxHeight: "90vh",
    overflowY: "auto",
    boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid #eee",
    paddingBottom: "0.5rem",
    marginBottom: "1rem",
  },
  closeX: {
    background: "none",
    border: "none",
    fontSize: "1.5rem",
    cursor: "pointer",
  },
  form: { display: "flex", flexDirection: "column", gap: "1rem" },
  label: {
    display: "flex",
    flexDirection: "column",
    gap: "0.25rem",
    fontWeight: "500",
    fontSize: "14px",
    color: "#333",
  },
  input: {
    padding: "0.5rem",
    borderRadius: "6px",
    border: "1px solid #ccc",
    fontSize: "14px",
  },
  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "0.5rem",
    marginTop: "0.5rem",
  },
  cancelBtn: {
    padding: "0.5rem 1rem",
    background: "#f5f5f5",
    border: "1px solid #ccc",
    borderRadius: "6px",
    cursor: "pointer",
  },
  saveBtn: {
    padding: "0.5rem 1rem",
    background: "#2d5a27",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
};

export default UsersPage;
