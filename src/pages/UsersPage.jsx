import Header from '../components/Header'

const usersTableRows = [
  {
    initials: 'ER',
    name: 'Elena Rostova',
    email: 'elena.r@example.com',
    role: 'User',
    level: 'Lvl 14',
    xp: '12,450 XP',
    status: 'Active',
    tone: 'success',
  },
  {
    initials: 'MC',
    name: 'Marcus Chen',
    email: 'm.chen@ecoquest.org',
    role: 'Admin',
    level: 'Lvl 42',
    xp: '89,200 XP',
    status: 'Active',
    tone: 'success',
  },
  {
    initials: 'SJ',
    name: 'Sarah Jenkins',
    email: 's.jenkins88@example.com',
    role: 'User',
    level: 'Lvl 3',
    xp: '1,200 XP',
    status: 'Banned',
    tone: 'danger',
  },
  {
    initials: 'DK',
    name: 'David Kim',
    email: 'dkim.eco@example.com',
    role: 'User',
    level: 'Lvl 8',
    xp: '6,800 XP',
    status: 'Active',
    tone: 'success',
  },
]

const usersPageData = {
  title: 'User Management',
  subtitle: 'View, filter, and manage EcoQuest community members.',
  filters: ['All Users', 'Admins Only', 'Banned'],
  countLabel: 'Showing 1-10 of 1,245 users',
  users: usersTableRows,
}

function UsersPage() {
  return (
    <section className="users-page">
      <Header
        title={usersPageData.title}
        subtitle={usersPageData.subtitle}
        searchPlaceholder="Search users..."
        actions={(
          <>
            <button type="button" className="outline-action">
              Export CSV
            </button>
            <button type="button" className="filled-action">
              Invite User
            </button>
          </>
        )}
      />

      <section className="users-toolbar" aria-label="User filters">
        <div className="filter-pills">
          {usersPageData.filters.map((filter, index) => (
            <button key={filter} type="button" className={`filter-pill${index === 0 ? ' active' : ''}`}>
              {filter}
            </button>
          ))}
        </div>

        <div className="toolbar-meta">
          <span>{usersPageData.countLabel}</span>
          <button type="button" className="icon-button nav-arrow" aria-label="Previous page">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M15.41 16.59 10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41Z" />
            </svg>
          </button>
          <button type="button" className="icon-button nav-arrow" aria-label="Next page">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="m8.59 16.59 4.58-4.59-4.58-4.59L10 6l6 6-6 6-1.41-1.41Z" />
            </svg>
          </button>
        </div>
      </section>

      <section className="users-table-card" aria-label="Users table">
        <table className="users-table">
          <thead>
            <tr>
              <th>Avatar</th>
              <th>Name &amp; Email</th>
              <th>Role</th>
              <th>Level</th>
              <th>Total XP</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {usersPageData.users.map((user) => (
              <tr key={user.email}>
                <td>
                  <div className="avatar-badge">{user.initials}</div>
                </td>
                <td>
                  <div className="user-identity">
                    <strong>{user.name}</strong>
                    <span>{user.email}</span>
                  </div>
                </td>
                <td>
                  <span className="role-chip">{user.role}</span>
                </td>
                <td>{user.level}</td>
                <td className="xp-cell">{user.xp}</td>
                <td>
                  <span className={`status-chip ${user.tone}`}>{user.status}</span>
                </td>
                <td>
                  <button type="button" className="row-action">
                    •••
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </section>
  )
}

export default UsersPage