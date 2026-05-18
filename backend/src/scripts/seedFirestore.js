require('dotenv').config({ quiet: true });

const { admin, getDb } = require('../config/firebaseAdmin');

const routeId = 'campus-cleanup-route';
const missionId = 'collect-3-trash-items';
const rewardId = 'eco-hero-badge';

const trashCategories = [
  {
    id: 'plastic',
    name: 'Plastic',
    description: 'Trash made mostly from plastic materials.',
    examples: ['plastic bottle', 'plastic cup', 'plastic straw', 'sachet', 'food wrapper', 'plastic bag'],
    rules: [
      'Classify as Plastic if the item is mostly made of plastic.',
      'If the item clearly contains multiple materials, consider Mixed Waste.',
    ],
    status: 'active',
  },
  {
    id: 'paper',
    name: 'Paper',
    description: 'Paper, cardboard, and paper packaging.',
    examples: ['paper bag', 'cardboard', 'newspaper', 'receipt', 'paper cup'],
    rules: [
      'Classify as Paper if the item is mostly paper or cardboard.',
      'If it is heavily coated with plastic or mixed materials, consider Mixed Waste.',
    ],
    status: 'active',
  },
  {
    id: 'metal',
    name: 'Metal',
    description: 'Cans, foil, and small metal waste.',
    examples: ['tin can', 'aluminum can', 'bottle cap', 'foil'],
    rules: ['Classify as Metal if the item is mostly metal.'],
    status: 'active',
  },
  {
    id: 'glass',
    name: 'Glass',
    description: 'Glass bottles and broken glass waste.',
    examples: ['glass bottle', 'glass jar', 'broken glass'],
    rules: ['Classify as Glass if the item is mostly glass.'],
    status: 'active',
  },
  {
    id: 'organic',
    name: 'Organic',
    description: 'Leaves, food waste, and biodegradable material.',
    examples: ['leaves', 'food scraps', 'fruit peel', 'biodegradable waste'],
    rules: ['Classify as Organic if the item is natural biodegradable waste.'],
    status: 'active',
  },
  {
    id: 'mixed-waste',
    name: 'Mixed Waste',
    description: 'Trash that contains mixed or unclear materials.',
    examples: ['food container with plastic and paper', 'dirty mixed packaging', 'unclear combined materials'],
    rules: [
      'Classify as Mixed Waste if the item clearly contains multiple materials.',
      'Use Mixed Waste when the material is unclear but appears to be a combination of categories.',
    ],
    status: 'active',
  },
  {
    id: 'other',
    name: 'Other',
    description: 'Trash that does not fit the other categories.',
    examples: ['unidentified waste', 'unusual item'],
    rules: [
      'Use Other only when the item does not clearly fit Plastic, Paper, Metal, Glass, Organic, or Mixed Waste.',
    ],
    status: 'active',
  },
];

const demoRoute = {
  name: 'Campus Cleanup Route',
  description: 'A beginner-friendly cleanup route around the campus walkway.',
  startLocation: {
    name: 'Main Gate',
    lat: 14.6091,
    lng: 120.9898,
  },
  endLocation: {
    name: 'Garden Area',
    lat: 14.6102,
    lng: 120.991,
  },
  path: [
    { lat: 14.6091, lng: 120.9898 },
    { lat: 14.6098, lng: 120.9904 },
    { lat: 14.6102, lng: 120.991 },
  ],
  distanceKm: 1.2,
  estimatedTimeMinutes: 25,
  difficulty: 'easy',
  minimumTrashRequired: 3,
  visualMaxGoal: 5,
  basePoints: 100,
  pointsPerTrash: 5,
  bonusPointsPerExtraTrash: 3,
  status: 'active',
  imageUrl: null,
  createdBy: 'seed-script',
};

const demoMission = {
  title: 'Collect 3 trash items',
  description: 'Submit at least 3 valid trash photos along this route.',
  routeId,
  type: 'route',
  requiredTrashCount: 3,
  trashCategoryId: null,
  trashCategoryName: null,
  pointsReward: 20,
  status: 'active',
  createdBy: 'seed-script',
};

const demoReward = {
  name: 'Eco Hero Badge',
  description: 'A simple reward for users who complete cleanup routes.',
  imageUrl: null,
  pointsCost: 50,
  stock: 100,
  category: 'badge',
  status: 'available',
  createdBy: 'seed-script',
};

async function upsertDocument(collectionName, id, data) {
  const now = admin.firestore.FieldValue.serverTimestamp();
  const docRef = getDb().collection(collectionName).doc(id);
  const existingDoc = await docRef.get();

  await docRef.set(
    {
      ...data,
      createdAt: existingDoc.exists ? existingDoc.data().createdAt : now,
      updatedAt: now,
    },
    { merge: true }
  );
}

async function seedFirestore() {
  console.log('Seeding Firestore demo data...');

  for (const category of trashCategories) {
    const { id, ...categoryData } = category;
    await upsertDocument('trashCategories', id, categoryData);
  }

  await upsertDocument('routes', routeId, demoRoute);
  await upsertDocument('missions', missionId, demoMission);
  await upsertDocument('rewards', rewardId, demoReward);

  console.log('Seed complete.');
  console.log(`Categories: ${trashCategories.length}`);
  console.log(`Route: ${routeId}`);
  console.log(`Mission: ${missionId}`);
  console.log(`Reward: ${rewardId}`);
}

seedFirestore()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  });
