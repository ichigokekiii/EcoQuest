const test = require('node:test');
const assert = require('node:assert/strict');

const { analyzeTrashImage } = require('../src/services/trashClassificationService');

const categories = [
  {
    id: 'plastic',
    name: 'Plastic',
    examples: ['plastic bottle'],
    rules: ['Classify as Plastic if mostly plastic.'],
    status: 'active',
  },
  {
    id: 'other',
    name: 'Other',
    examples: ['unidentified waste'],
    rules: ['Use Other when unclear.'],
    status: 'active',
  },
];

const TEST_IMAGE_BASE64 = 'abc123';

test('analyzeTrashImage uses heuristic fallback when vision AI is disabled', async () => {
  const originalEnabled = process.env.AI_CLASSIFICATION_ENABLED;
  process.env.AI_CLASSIFICATION_ENABLED = 'false';

  try {
    const analysis = await analyzeTrashImage({
      categories,
      imageUri: 'file:///photo.jpg',
      imageFileName: 'plastic-bottle.jpg',
      imageMimeType: 'image/jpeg',
      imageBase64: TEST_IMAGE_BASE64,
      correctionExamples: [],
    });

    assert.equal(analysis.analysisSource, 'heuristic');
    assert.equal(analysis.suggestion.suggestedCategoryId, 'plastic');
    assert.equal(analysis.suggestion.suggestedCategoryName, 'Plastic');
    assert.ok(analysis.suggestion.confidence >= 0.7);
  } finally {
    process.env.AI_CLASSIFICATION_ENABLED = originalEnabled;
  }
});

test('analyzeTrashImage returns empty suggestion when no categories exist', async () => {
  const analysis = await analyzeTrashImage({
    categories: [],
    imageUri: 'file:///photo.jpg',
    imageFileName: 'plastic-bottle.jpg',
  });

  assert.equal(analysis.analysisSource, 'none');
  assert.equal(analysis.suggestion.suggestedCategoryId, null);
  assert.equal(analysis.suggestion.needsReview, true);
});

test('analyzeTrashImage falls back when base64 is missing', async () => {
  const analysis = await analyzeTrashImage({
    categories,
    imageUri: 'file:///random-photo.jpg',
    imageFileName: 'random-photo.jpg',
  });

  assert.equal(analysis.analysisSource, 'heuristic');
  assert.equal(analysis.suggestion.suggestedCategoryId, 'other');
  assert.equal(analysis.suggestion.needsReview, true);
});

test('analyzeTrashImage uses Qwen when enabled and fetch returns valid JSON', async () => {
  const originalEnv = {
    AI_CLASSIFICATION_ENABLED: process.env.AI_CLASSIFICATION_ENABLED,
    AI_PROVIDER: process.env.AI_PROVIDER,
    AI_API_KEY: process.env.AI_API_KEY,
    AI_MODEL: process.env.AI_MODEL,
    AI_BASE_URL: process.env.AI_BASE_URL,
  };

  process.env.AI_CLASSIFICATION_ENABLED = 'true';
  process.env.AI_PROVIDER = 'qwen';
  process.env.AI_API_KEY = 'test-qwen-key';
  process.env.AI_MODEL = 'qwen3-vl-flash';
  process.env.AI_BASE_URL = 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1';

  const originalFetch = global.fetch;
  global.fetch = async () => ({
    ok: true,
    json: async () => ({
      choices: [
        {
          message: {
            content: JSON.stringify({
              detectedObject: 'plastic bottle',
              detectedMaterial: 'plastic',
              suggestedCategoryId: 'plastic',
              confidence: 0.92,
              reason: 'The image shows a plastic bottle.',
            }),
          },
        },
      ],
    }),
  });

  try {
    const analysis = await analyzeTrashImage({
      categories,
      imageUri: 'file:///photo.jpg',
      imageFileName: 'photo.jpg',
      imageMimeType: 'image/jpeg',
      imageBase64: TEST_IMAGE_BASE64,
      correctionExamples: [],
    });

    assert.equal(analysis.analysisSource, 'qwen');
    assert.equal(analysis.suggestion.suggestedCategoryId, 'plastic');
    assert.equal(analysis.suggestion.confidence, 0.92);
    assert.equal(analysis.suggestion.reason, 'The image shows a plastic bottle.');
  } finally {
    global.fetch = originalFetch;
    Object.entries(originalEnv).forEach(([key, value]) => {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    });
  }
});

test('analyzeTrashImage falls back to heuristic when Qwen fetch fails', async () => {
  const originalEnv = {
    AI_CLASSIFICATION_ENABLED: process.env.AI_CLASSIFICATION_ENABLED,
    AI_PROVIDER: process.env.AI_PROVIDER,
    AI_API_KEY: process.env.AI_API_KEY,
  };

  process.env.AI_CLASSIFICATION_ENABLED = 'true';
  process.env.AI_PROVIDER = 'qwen';
  process.env.AI_API_KEY = 'test-qwen-key';

  const originalFetch = global.fetch;
  global.fetch = async () => ({
    ok: false,
    status: 401,
    text: async () => 'Unauthorized',
  });

  try {
    const analysis = await analyzeTrashImage({
      categories,
      imageUri: 'file:///photo.jpg',
      imageFileName: 'photo.jpg',
      imageMimeType: 'image/jpeg',
      imageBase64: TEST_IMAGE_BASE64,
      correctionExamples: [],
    });

    assert.equal(analysis.analysisSource, 'heuristic');
  } finally {
    global.fetch = originalFetch;
    Object.entries(originalEnv).forEach(([key, value]) => {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    });
  }
});

test('analyzeTrashImage falls back when Qwen returns invalid category id', async () => {
  const originalEnv = {
    AI_CLASSIFICATION_ENABLED: process.env.AI_CLASSIFICATION_ENABLED,
    AI_PROVIDER: process.env.AI_PROVIDER,
    AI_API_KEY: process.env.AI_API_KEY,
  };

  process.env.AI_CLASSIFICATION_ENABLED = 'true';
  process.env.AI_PROVIDER = 'qwen';
  process.env.AI_API_KEY = 'test-qwen-key';

  const originalFetch = global.fetch;
  global.fetch = async () => ({
    ok: true,
    json: async () => ({
      choices: [
        {
          message: {
            content: JSON.stringify({
              detectedObject: 'mystery item',
              detectedMaterial: 'unknown',
              suggestedCategoryId: 'not-a-real-category',
              confidence: 0.88,
              reason: 'Invalid category test.',
            }),
          },
        },
      ],
    }),
  });

  try {
    const analysis = await analyzeTrashImage({
      categories,
      imageUri: 'file:///photo.jpg',
      imageFileName: 'photo.jpg',
      imageMimeType: 'image/jpeg',
      imageBase64: TEST_IMAGE_BASE64,
      correctionExamples: [],
    });

    assert.equal(analysis.analysisSource, 'heuristic');
  } finally {
    global.fetch = originalFetch;
    Object.entries(originalEnv).forEach(([key, value]) => {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    });
  }
});
