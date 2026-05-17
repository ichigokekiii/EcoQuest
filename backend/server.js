const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// High-fidelity Metro Manila coordinate arrays mimicking road grids

const bgcCoordinates = [
  { "latitude": 14.551086, "longitude": 121.046495 },
  { "latitude": 14.550579, "longitude": 121.04808 },
  { "latitude": 14.550146, "longitude": 121.048717 },
  { "latitude": 14.548836, "longitude": 121.052805 },
  { "latitude": 14.550205, "longitude": 121.053265 },
  { "latitude": 14.550207, "longitude": 121.05338 },
  { "latitude": 14.5501, "longitude": 121.053415 }
];

const ayalaCoordinates = [
  { "latitude": 14.557753, "longitude": 121.021071 },
  { "latitude": 14.557679, "longitude": 121.021429 },
  { "latitude": 14.557751, "longitude": 121.021916 },
  { "latitude": 14.558279, "longitude": 121.021776 },
  { "latitude": 14.558453, "longitude": 121.022395 },
  { "latitude": 14.557355, "longitude": 121.02274 },
  { "latitude": 14.556926, "longitude": 121.021279 },
  { "latitude": 14.556877, "longitude": 121.021163 },
  { "latitude": 14.556744, "longitude": 121.021073 },
  { "latitude": 14.556362, "longitude": 121.021599 },
  { "latitude": 14.555541, "longitude": 121.02287 },
  { "latitude": 14.555472, "longitude": 121.023028 }
];

// UP Oval coordinates
const upOvalCoordinates = [
  { "latitude": 14.654793, "longitude": 121.061996 },
  { "latitude": 14.654799, "longitude": 121.062333 },
  { "latitude": 14.65769, "longitude": 121.062361 },
  { "latitude": 14.657676, "longitude": 121.063729 },
  { "latitude": 14.657577, "longitude": 121.0648 },
  { "latitude": 14.657549, "longitude": 121.068572 },
  { "latitude": 14.654237, "longitude": 121.068618 },
  { "latitude": 14.654234, "longitude": 121.068871 },
  { "latitude": 14.654049, "longitude": 121.068874 },
  { "latitude": 14.651997, "longitude": 121.069441 },
  { "latitude": 14.654004, "longitude": 121.070492 }
];

const mockRoutes = [
  {
    id: 'route-bgc',
    title: 'BGC High Street Walk',
    difficulty: 'Easy',
    locationName: 'Bonifacio Global City, Taguig',
    distance: '1.2 km',
    duration: '30 min',
    targetTrash: 20,
    points: 120,
    coordinates: bgcCoordinates,
    centerRegion: { latitude: 14.5515, longitude: 121.0475, latitudeDelta: 0.006, longitudeDelta: 0.006 },
    markers: [
      { id: 'm1', type: 'start', color: '#16A34A', coordinate: bgcCoordinates[0] },
      { id: 'm2', type: 'end', color: '#111827', coordinate: bgcCoordinates[bgcCoordinates.length - 1] }
    ],
    description: "A scenic shaded trail through the center of Bonifacio High Street. Help keep our urban spaces clean while enjoying stunning city views and fresh morning air. Perfect for a quick morning walk before work."
  },
  {
    id: 'route-ayala',
    title: 'Ayala Triangle Gardens Loop',
    difficulty: 'Medium',
    locationName: 'Makati CBD, Metro Manila',
    distance: '2.5 km',
    duration: '55 min',
    targetTrash: 36,
    points: 250,
    coordinates: ayalaCoordinates,
    centerRegion: { latitude: 14.5575, longitude: 121.0221, latitudeDelta: 0.006, longitudeDelta: 0.006 },
    markers: [
      { id: 'm3', type: 'start', color: '#16A34A', coordinate: ayalaCoordinates[0] },
      { id: 'm4', type: 'checkpoint', color: '#D97706', coordinate: ayalaCoordinates[2] },
      { id: 'm5', type: 'end', color: '#111827', coordinate: ayalaCoordinates[4] }
    ],
    description: "A lush, green sanctuary right in the middle of the Makati Central Business District. You'll trace the triangular pedestrian paths, picking up litter along the busy financial hub."
  },
  {
    id: 'route-up',
    title: 'UP Diliman Academic Oval',
    difficulty: 'Hard',
    locationName: 'Quezon City, Metro Manila',
    distance: '2.2 km',
    duration: '90 min',
    targetTrash: 80,
    points: 400,
    coordinates: upOvalCoordinates,
    centerRegion: { latitude: 14.6548, longitude: 121.0664, latitudeDelta: 0.012, longitudeDelta: 0.012 },
    markers: [
      { id: 'm6', type: 'start', color: '#16A34A', coordinate: upOvalCoordinates[0] },
      { id: 'm7', type: 'end', color: '#111827', coordinate: upOvalCoordinates[4] }
    ],
    description: "The famous UP Academic Oval! Shaded by magnificent acacia trees, this 2.2km loop is perfect for serious eco-warriors. Clear the bike lanes and pedestrian walkways of debris!"
  }
];

// Get all nearby routes
app.get('/api/routes/nearby', (req, res) => {
  res.json({ routes: mockRoutes });
});

// Get specific route by ID
app.get('/api/routes/:id', (req, res) => {
  const route = mockRoutes.find(r => r.id === req.params.id);
  if (route) {
    res.json(route);
  } else {
    res.status(404).json({ error: 'Route not found' });
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
