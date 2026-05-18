import { useEffect, useMemo, useState } from 'react';

import Header from '../components/Header';
import api from '../services/api';

const filters = ['All Users', 'Admins Only', 'Suspended'];

function getDisplayName(user) {
  return user.fullName || user.name || user.username || user.email || 'Unknown User';
}

function getInitials(value) {
  return (value || 'EQ')
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All Users');
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadUsers() {
      try {
        setLoading(true);
        setErrorMessage('');
        const response = await api.get('/admin/users?limit=50');

        if (isMounted) {
          setUsers(response.data.users || []);
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(error.response?.data?.message || 'Unable to load users.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadUsers();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const searchText = `${getDisplayName(user)} ${user.email || ''}`.toLowerCase();
      const matchesSearch = searchText.includes(searchQuery.toLowerCase());

      if (!matchesSearch) {
        return false;
      }

      if (activeFilter === 'Admins Only') {
        return user.role === 'admin';
      }

      if (activeFilter === 'Suspended') {
        return user.status === 'suspended' || user.status === 'banned';
      }

      return true;
    });
  }, [activeFilter, searchQuery, users]);

  return (
    <section className="users-page">
      <Header
        title="User Management"
        subtitle={`${users.length} total registered users`}
        searchPlaceholder="Search users..."
        searchValue={searchQuery}
        onSearchChange={(event) => setSearchQuery(event.target.value)}
        actions={<button className="filled-action" type="button">+ Add User</button>}
      />

      <section className="stats-grid">
        <article className="stat-card">
          <div className="stat-card-body">
            <span className="stat-icon blue">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm8 1a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-8 2c-3.9 0-7 2.2-7 5v1h14v-1c0-2.8-3.1-5-7-5Z" fill="currentColor" /></svg>
            </span>
            <div className="stat-card-content">
              <strong>{users.length}</strong>
              <p>Total Users</p>
            </div>
          </div>
        </article>
        <article className="stat-card">
          <div className="stat-card-body">
            <span className="stat-icon green">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" fill="none" stroke="currentColor" strokeWidth="2" /></svg>
            </span>
            <div className="stat-card-content">
              <strong>{users.filter((u) => u.status === 'active' || !u.status).length}</strong>
              <p>Active</p>
            </div>
          </div>
        </article>
        <article className="stat-card">
          <div className="stat-card-body">
            <span className="stat-icon yellow">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 9v4m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" fill="none" stroke="currentColor" strokeWidth="2" /></svg>
            </span>
            <div className="stat-card-content">
              <strong>{users.filter((u) => u.status === 'inactive').length}</strong>
              <p>Inactive</p>
            </div>
          </div>
        </article>
        <article className="stat-card">
          <div className="stat-card-body">
            <span className="stat-icon red">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12" fill="none" stroke="currentColor" strokeWidth="2" /></svg>
            </span>
            <div className="stat-card-content">
              <strong>{users.filter((u) => u.status === 'suspended' || u.status === 'banned').length}</strong>
              <p>Suspended</p>
            </div>
          </div>
        </article>
      </section>

      <section className="toolbar-row">
        <div className="filter-pills">
          {filters.map((filter) => (
            <button
              className={`filter-pill${activeFilter === filter ? ' active' : ''}`}
              key={filter}
              onClick={() => setActiveFilter(filter)}
              type="button"
            >
              {filter}
            </button>
          ))}
        </div>
        <p className="muted">Showing {filteredUsers.length} of {users.length} users</p>
      </section>

      {errorMessage ? <p className="error">{errorMessage}</p> : null}

      <section className="data-card">
        {loading ? (
          <p className="loading-state">Loading users...</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Avatar</th>
                <th>User</th>
                <th>Role</th>
                <th>Points</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => {
                const displayName = getDisplayName(user);

                return (
                  <tr key={user.id}>
                    <td>
                      <span className="profile-avatar">{getInitials(displayName)}</span>
                    </td>
                    <td>
                      <div className="user-identity">
                        <strong>{displayName}</strong>
                        <span>{user.email || 'No email'}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`role-chip ${user.role === 'admin' ? 'admin-mode' : ''}`}>
                        {user.role || 'user'}
                      </span>
                    </td>
                    <td>{Number(user.points || 0).toLocaleString()} pts</td>
                    <td>
                      <span className={`status-chip ${user.status === 'suspended' ? 'danger' : ''}`}>
                        {user.status || 'active'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>
    </section>
  );
}
