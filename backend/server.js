const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Mock Data for Routes
const mockRoutes = [
  {
    id: 'route-1',
    title: 'Riverside Cleanup',
    difficulty: 'Easy',
    locationName: 'Marina District',
    distance: '1.2 km',
    duration: '30 min',
    minTrash: 'Min 10',
    points: 120,
    coordinates: [
      { latitude: 37.8012, longitude: -122.4402 },
      { latitude: 37.8025, longitude: -122.4385 },
      { latitude: 37.8038, longitude: -122.4360 },
    ],
    markers: [
      { id: 'm1', type: 'start', color: '#16A34A', coordinate: { latitude: 37.8012, longitude: -122.4402 } },
      { id: 'm2', type: 'checkpoint', color: '#D97706', coordinate: { latitude: 37.8025, longitude: -122.4385 } },
      { id: 'm3', type: 'end', color: '#16A34A', coordinate: { latitude: 37.8038, longitude: -122.4360 } }
    ]
  },
  {
    id: 'route-2',
    title: 'Central Park Loop',
    difficulty: 'Medium',
    locationName: 'SoMa',
    distance: '2.5 km',
    duration: '55 min',
    minTrash: 'Min 18',
    points: 250,
    coordinates: [
      { latitude: 37.7830, longitude: -122.4040 },
      { latitude: 37.7815, longitude: -122.4020 },
      { latitude: 37.7790, longitude: -122.4005 },
    ],
    markers: [
      { id: 'm4', type: 'start', color: '#16A34A', coordinate: { latitude: 37.7830, longitude: -122.4040 } },
      { id: 'm5', type: 'end', color: '#EF4444', coordinate: { latitude: 37.7790, longitude: -122.4005 } }
    ]
  }
];

app.get('/api/routes/nearby', (req, res) => {
  res.json({ routes: mockRoutes });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
