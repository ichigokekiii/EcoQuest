const { admin, getDb, isFirebaseConfigured } = require('../config/firebaseAdmin');
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

async function saveCorrectionExample({
  aiSuggestedCategoryId,
  aiSuggestedCategoryName,
  finalCategoryId,
  finalCategoryName,
  detectedObject = null,
  detectedMaterial = null,
  userId = null,
}) {
  if (!isFirebaseConfigured()) {
    return;
  }

  if (!aiSuggestedCategoryId || !finalCategoryId || aiSuggestedCategoryId === finalCategoryId) {
    return;
  }

  const db = getDb();
  const timestamp = admin.firestore.Timestamp.now();
  const existingSnapshot = await db
    .collection('trashClassificationExamples')
    .where('aiSuggestedCategoryId', '==', aiSuggestedCategoryId)
    .where('finalCategoryId', '==', finalCategoryId)
    .where('status', '==', 'active')
    .limit(1)
    .get();

  if (!existingSnapshot.empty) {
    const exampleRef = existingSnapshot.docs[0].ref;

    await exampleRef.update({
      correctionCount: admin.firestore.FieldValue.increment(1),
      detectedObject: detectedObject || existingSnapshot.docs[0].data().detectedObject || null,
      detectedMaterial: detectedMaterial || existingSnapshot.docs[0].data().detectedMaterial || null,
      updatedAt: timestamp,
    });

    console.log(
      `Saved trash classification correction memory: ${aiSuggestedCategoryId} -> ${finalCategoryId} (updated ${exampleRef.id})`
    );

    return;
  }

  const newExampleRef = await db.collection('trashClassificationExamples').add({
    aiSuggestedCategoryId,
    aiSuggestedCategoryName: aiSuggestedCategoryName || null,
    finalCategoryId,
    finalCategoryName: finalCategoryName || null,
    detectedObject,
    detectedMaterial,
    correctionCount: 1,
    status: 'active',
    source: 'user',
    userId,
    createdAt: timestamp,
    updatedAt: timestamp,
  });

  console.log(
    `Saved trash classification correction memory: ${aiSuggestedCategoryId} -> ${finalCategoryId} (created ${newExampleRef.id})`
  );
}

module.exports = {
  getActiveTrashCategories,
  getActiveTrashCategoryById,
  getUsefulCorrectionExamples,
  saveCorrectionExample,
};
