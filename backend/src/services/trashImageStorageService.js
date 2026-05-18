const path = require('node:path');

const { getBucket, isFirebaseConfigured } = require('../config/firebaseAdmin');

function getExtensionFromMimeType(mimeType = '') {
  if (mimeType.includes('png')) {
    return '.png';
  }

  if (mimeType.includes('webp')) {
    return '.webp';
  }

  return '.jpg';
}

function sanitizeFileName(fileName = '') {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, '-').slice(0, 80);
}

async function uploadTrashProofImage({ userId, sessionId, imageBase64, imageMimeType, imageFileName }) {
  if (!isFirebaseConfigured() || !imageBase64) {
    return {
      imageUrl: null,
      storagePath: null,
    };
  }

  const bucket = getBucket();
  const mimeType = imageMimeType || 'image/jpeg';
  const base64Payload = imageBase64.includes(',')
    ? imageBase64.split(',').pop()
    : imageBase64;
  const extension = path.extname(imageFileName || '') || getExtensionFromMimeType(mimeType);
  const safeFileName = sanitizeFileName(imageFileName || `trash-proof-${Date.now()}${extension}`);
  const storagePath = `trash-proofs/${userId}/${sessionId}/${Date.now()}-${safeFileName}`;
  const file = bucket.file(storagePath);

  await file.save(Buffer.from(base64Payload, 'base64'), {
    metadata: {
      contentType: mimeType,
      metadata: {
        userId,
        sessionId,
      },
    },
  });

  return {
    imageUrl: `https://storage.googleapis.com/${bucket.name}/${storagePath}`,
    storagePath,
  };
}

module.exports = {
  uploadTrashProofImage,
};
