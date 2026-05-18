function buildUsername({ email = '', fullName = '' }) {
  const fromName = fullName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
    .slice(0, 24);

  if (fromName) {
    return fromName;
  }

  return email.split('@')[0]?.toLowerCase().replace(/[^a-z0-9]+/g, '') || 'ecoquestuser';
}

function buildDefaultUserProfile({ uid, fullName, email, username }) {
  return {
    uid,
    fullName,
    username: username || buildUsername({ email, fullName }),
    email,
    role: 'user',
    status: 'active',
    avatarUrl: null,
    points: 0,
    level: 1,
    totalTrashCollected: 0,
    routesCompleted: 0,
    missionsCompleted: 0,
    achievementsCount: 0,
  };
}

module.exports = {
  buildDefaultUserProfile,
  buildUsername,
};
