const express = require('express');
const cors = require('cors');

const homeRoutes = require('./routes/homeRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const routeRoutes = require('./routes/routeRoutes');
const routeSessionRoutes = require('./routes/routeSessionRoutes');
const missionRoutes = require('./routes/missionRoutes');
const storeRoutes = require('./routes/storeRoutes');
const profileRoutes = require('./routes/profileRoutes');
const adminRoutes = require('./routes/adminRoutes');
const devRoutes = require('./routes/devRoutes');
const trashCategoryRoutes = require('./routes/trashCategoryRoutes');
const trashSubmissionRoutes = require('./routes/trashSubmissionRoutes');

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.get('/', (req, res) => {
  res.json({ message: 'Eco Quest API is running' });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    mode: 'mock-ready',
    message: 'Eco Quest API is running.',
  });
});

// Mobile and user-facing endpoints share the same Express backend.
app.use('/api/home', homeRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/route-sessions', routeSessionRoutes);
app.use('/api/missions', missionRoutes);
app.use('/api/trash-categories', trashCategoryRoutes);
app.use('/api/trash-submissions', trashSubmissionRoutes);
app.use('/api/store', storeRoutes);
app.use('/api/profile', profileRoutes);

// Admin endpoints live in the same backend but require admin authorization.
app.use('/api/admin', adminRoutes);

app.use('/api/dev', devRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use((error, req, res, next) => {
  console.error(error);

  const statusCode = error.statusCode || 500;
  const message = error.message || 'Something went wrong';

  res.status(statusCode).json({ message });
});

module.exports = app;
