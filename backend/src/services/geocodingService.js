const GEOCODING_API_URL = 'https://maps.googleapis.com/maps/api/geocode/json';

function getGeocodingApiKey() {
  return process.env.GOOGLE_GEOCODING_API_KEY || '';
}

function mapGeocodeResults(results = []) {
  return results.map((result) => ({
    description: result.formatted_address,
    lat: result.geometry.location.lat,
    lng: result.geometry.location.lng,
    placeId: result.place_id,
  }));
}

async function callGeocodingApi(params) {
  const apiKey = getGeocodingApiKey();

  if (!apiKey) {
    const error = new Error('GOOGLE_GEOCODING_API_KEY is not configured.');
    error.statusCode = 503;
    throw error;
  }

  const url = new URL(GEOCODING_API_URL);

  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, String(value));
  });

  url.searchParams.set('key', apiKey);

  const response = await fetch(url);

  if (!response.ok) {
    const error = new Error('Unable to reach Google Geocoding API.');
    error.statusCode = 502;
    throw error;
  }

  return response.json();
}

async function searchLocations(query) {
  const trimmedQuery = String(query || '').trim();

  if (trimmedQuery.length < 2) {
    return { suggestions: [], status: 'OK' };
  }

  const data = await callGeocodingApi({ address: trimmedQuery });

  if (data.status === 'ZERO_RESULTS') {
    return { suggestions: [], status: 'OK' };
  }

  if (data.status !== 'OK') {
    const error = new Error(data.error_message || `Geocoding failed with status ${data.status}.`);
    error.statusCode = 502;
    throw error;
  }

  return {
    suggestions: mapGeocodeResults(data.results).slice(0, 5),
    status: 'OK',
  };
}

async function reverseGeocode(lat, lng) {
  const latitude = Number(lat);
  const longitude = Number(lng);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    const error = new Error('Valid lat and lng query parameters are required.');
    error.statusCode = 400;
    throw error;
  }

  const data = await callGeocodingApi({ latlng: `${latitude},${longitude}` });

  if (data.status === 'ZERO_RESULTS') {
    return { address: '', status: 'OK' };
  }

  if (data.status !== 'OK') {
    const error = new Error(data.error_message || `Reverse geocoding failed with status ${data.status}.`);
    error.statusCode = 502;
    throw error;
  }

  return {
    address: data.results[0]?.formatted_address || '',
    lat: latitude,
    lng: longitude,
    status: 'OK',
  };
}

module.exports = {
  searchLocations,
  reverseGeocode,
};
