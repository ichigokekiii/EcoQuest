const { getDb, isFirebaseConfigured } = require('../config/firebaseAdmin');
const { getActiveTrashCategories } = require('../services/categoryMemoryService');
const { analyzeTrashImage } = require('../services/trashClassificationService');

function createHttpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

async function verifySessionAccess(sessionId, userId) {
  if (!sessionId) {
    throw createHttpError(400, 'Session ID is required');
  }

  if (!isFirebaseConfigured()) {
    return;
  }

  const sessionDoc = await getDb().collection('routeSessions').doc(sessionId).get();

  if (!sessionDoc.exists) {
    throw createHttpError(404, 'Session not found');
  }

  if (sessionDoc.data().userId !== userId) {
    throw createHttpError(403, 'You do not have access to this session');
  }

  if (sessionDoc.data().status !== 'active') {
    throw createHttpError(400, 'Session is not active');
  }
}

async function analyzeTrashSubmission(req, res, next) {
  try {
    await verifySessionAccess(req.body.sessionId, req.user.id);

    const categories = await getActiveTrashCategories();
    const suggestion = await analyzeTrashImage({
      categories,
      imageUri: req.body.imageUri,
      imageFileName: req.body.imageFileName,
      imageMimeType: req.body.imageMimeType,
    });

    res.json({
      suggestion,
      categories,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  analyzeTrashSubmission,
};
