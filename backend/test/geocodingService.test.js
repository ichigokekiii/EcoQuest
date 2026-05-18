const assert = require('node:assert/strict');
const test = require('node:test');

const { searchLocations } = require('../src/services/geocodingService');

const originalFetch = global.fetch;
const originalApiKey = process.env.GOOGLE_GEOCODING_API_KEY;

test.afterEach(() => {
  global.fetch = originalFetch;
  process.env.GOOGLE_GEOCODING_API_KEY = originalApiKey;
});

test('searchLocations returns empty suggestions for short queries', async () => {
  process.env.GOOGLE_GEOCODING_API_KEY = 'test-key';

  const result = await searchLocations('M');

  assert.deepEqual(result, { suggestions: [], status: 'OK' });
});

test('searchLocations maps Google Geocoding results into suggestions', async () => {
  process.env.GOOGLE_GEOCODING_API_KEY = 'test-key';

  global.fetch = async () => ({
    ok: true,
    async json() {
      return {
        status: 'OK',
        results: [
          {
            formatted_address: 'Manila, Metro Manila, Philippines',
            place_id: 'place-manila',
            geometry: {
              location: {
                lat: 14.5995,
                lng: 120.9842,
              },
            },
          },
        ],
      };
    },
  });

  const result = await searchLocations('Manila');

  assert.equal(result.status, 'OK');
  assert.equal(result.suggestions.length, 1);
  assert.equal(result.suggestions[0].description, 'Manila, Metro Manila, Philippines');
  assert.equal(result.suggestions[0].lat, 14.5995);
  assert.equal(result.suggestions[0].lng, 120.9842);
});
