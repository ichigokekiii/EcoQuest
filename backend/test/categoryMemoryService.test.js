const test = require('node:test');
const assert = require('node:assert/strict');

const { saveCorrectionExample } = require('../src/services/categoryMemoryService');

test('saveCorrectionExample skips when categories match', async () => {
  await assert.doesNotReject(() =>
    saveCorrectionExample({
      aiSuggestedCategoryId: 'plastic',
      finalCategoryId: 'plastic',
    })
  );
});

test('saveCorrectionExample skips when Firebase is not configured', async () => {
  await assert.doesNotReject(() =>
    saveCorrectionExample({
      aiSuggestedCategoryId: 'plastic',
      finalCategoryId: 'mixed-waste',
    })
  );
});
