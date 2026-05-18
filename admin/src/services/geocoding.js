import api from './api';

export async function searchLocations(query) {
  const response = await api.get('/admin/locations/search', {
    params: { q: query },
  });

  return response.data;
}

export async function reverseGeocodeLocation(lat, lng) {
  const response = await api.get('/admin/locations/reverse', {
    params: { lat, lng },
  });

  return response.data;
}
