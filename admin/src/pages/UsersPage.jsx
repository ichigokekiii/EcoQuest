import { useEffect, useMemo, useState } from 'react';

import Header from '../components/Header';
import PageStatRow from '../components/PageStatRow';
import PointsValue from '../components/PointsValue';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import TableToolbar from '../components/TableToolbar';
import api from '../services/api';

const roleFilters = ['All', 'Admin', 'User'];
const statusFilters = ['All', 'Active', 'Inactive', 'Suspended'];

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

function getHandle(user) {
  const handle = user.username || user.email?.split('@')[0] || user.id?.slice(0, 8) || 'user';
  return `@${handle}`;
}

function formatJoined(value) {
  if (!value) {
    return '—';
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString();
}

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [tableSearch, setTableSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  async function loadUsers() {
    try {
      setLoading(true);
      setErrorMessage('');
      const response = await api.get('/admin/users?limit=50');
      setUsers(response.data.users || []);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Unable to load users.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const searchText = `${getDisplayName(user)} ${user.email || ''} ${getHandle(user)}`.toLowerCase();
      const matchesSearch = searchText.includes(tableSearch.toLowerCase());
      const matchesRole =
        roleFilter === 'All' || String(user.role || 'user').toLowerCase() === roleFilter.toLowerCase();
      const matchesStatus =
        statusFilter === 'All' ||
        String(user.status || 'active').toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [roleFilter, statusFilter, tableSearch, users]);

  async function handleRoleChange(user, role) {
    try {
      const response = await api.patch(`/admin/users/${user.id}/role`, { role });
      setUsers((currentUsers) =>
        currentUsers.map((item) => (item.id === user.id ? response.data.user : item))
      );
      setSuccessMessage(`${getDisplayName(user)} is now ${role}.`);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Unable to update user role.');
    }
  }

  async function handleStatusChange(user, status) {
    try {
      const response = await api.patch(`/admin/users/${user.id}/status`, { status });
      setUsers((currentUsers) =>
        currentUsers.map((item) => (item.id === user.id ? response.data.user : item))
      );
      setSuccessMessage(`${getDisplayName(user)} status updated to ${status}.`);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Unable to update user status.');
    }
  }

  function handleExportUsers() {
    const headers = ['id', 'fullName', 'email', 'role', 'status', 'points', 'routesCompleted', 'createdAt'];
    const rows = filteredUsers.map((user) =>
      headers
        .map((header) => `"${String(user[header] ?? '').replace(/"/g, '""')}"`)
        .join(',')
    );
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'ecoquest-users.csv';
    link.click();
    URL.revokeObjectURL(url);
    setSuccessMessage('Exported current user list to CSV.');
  }

  return (
    <section className="users-page">
      <Header
        subtitle={`${users.length.toLocaleString()} total registered users`}
        title="User Management"
      />

      <PageStatRow>
        <StatCard label="Total Users" tone="blue" value={users.length.toLocaleString()} />
        <StatCard
          label="Admins"
          tone="green"
          value={users.filter((user) => user.role === 'admin').length}
        />
        <StatCard
          label="Active"
          tone="green"
          value={users.filter((user) => user.status === 'active' || !user.status).length}
        />
        <StatCard
          label="Suspended"
          tone="red"
          value={users.filter((user) => user.status === 'suspended').length}
        />
      </PageStatRow>

      {errorMessage ? <p className="error">{errorMessage}</p> : null}
      {successMessage ? <p className="success">{successMessage}</p> : null}

      <section className="data-card">
        <TableToolbar
          actions={
            <button className="outline-action" onClick={handleExportUsers} type="button">
              Export CSV
            </button>
          }
          onSearchChange={(event) => setTableSearch(event.target.value)}
          searchPlaceholder="Filter users..."
          searchValue={tableSearch}
        />

        <div className="filter-pills">
          {roleFilters.map((filter) => (
            <button
              className={`filter-pill${roleFilter === filter ? ' active' : ''}`}
              key={filter}
              onClick={() => setRoleFilter(filter)}
              type="button"
            >
              {filter}
            </button>
          ))}
          {statusFilters.map((filter) => (
            <button
              className={`filter-pill${statusFilter === filter ? ' active' : ''}`}
              key={`status-${filter}`}
              onClick={() => setStatusFilter(filter)}
              type="button"
            >
              {filter}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="loading-state">Loading users...</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Points</th>
                <th>Routes</th>
                <th>Trash</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => {
                const displayName = getDisplayName(user);

                return (
                  <tr key={user.id}>
                    <td>
                      <div className="user-cell">
                        <span className="profile-avatar">{getInitials(displayName)}</span>
                        <div className="user-identity">
                          <strong>{displayName}</strong>
                          <span className="user-handle">{getHandle(user)}</span>
                        </div>
                      </div>
                    </td>
                    <td>{user.email || 'No email'}</td>
                    <td>
                      <select
                        className="inline-select"
                        onChange={(event) => handleRoleChange(user, event.target.value)}
                        value={user.role || 'user'}
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td>
                      <PointsValue value={user.points} />
                    </td>
                    <td>{user.routesCompleted ?? user.routes ?? '—'}</td>
                    <td>{user.totalTrashCollected ?? user.trashCollected ?? '—'}</td>
                    <td>
                      <StatusBadge status={user.status || 'active'} />
                    </td>
                    <td>{formatJoined(user.createdAt || user.joinedAt)}</td>
                    <td>
                      <div className="table-actions">
                        <select
                          className="inline-select"
                          onChange={(event) => handleStatusChange(user, event.target.value)}
                          value={user.status || 'active'}
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                          <option value="suspended">Suspended</option>
                        </select>
                      </div>
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
