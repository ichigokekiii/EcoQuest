const { getDb, isFirebaseConfigured } = require('../config/firebaseAdmin');
const { serializeDoc } = require('../utils/firestoreSerializers');
const { getTrashCategories: getMockTrashCategories } = require('../mock/mockData');

async function getActiveTrashCategories() {
  if (!isFirebaseConfigured()) {
    return getMockTrashCategories().filter((category) => category.status === 'active');
  }

  const snapshot = await getDb()
    .collection('trashCategories')
    .where('status', '==', 'active')
    .get();

  return snapshot.docs.map(serializeDoc);
}

async function getActiveTrashCategoryById(categoryId) {
  const categories = await getActiveTrashCategories();

  return categories.find((category) => category.id === categoryId) || null;
}

async function getUsefulCorrectionExamples(limit = 5) {
  if (!isFirebaseConfigured()) {
    return [];
  }

  const snapshot = await getDb()
    .collection('trashClassificationExamples')
    .where('status', '==', 'active')
    .limit(limit)
    .get();

  return snapshot.docs.map(serializeDoc);
}

module.exports = {
  getActiveTrashCategories,
  getActiveTrashCategoryById,
  getUsefulCorrectionExamples,
};
