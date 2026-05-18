import axios from 'axios';
import { Platform } from 'react-native';

import { auth } from './firebase';

const fallbackApiUrl =
  Platform.OS === 'android' ? 'http://10.0.2.2:4000/api' : 'http://localhost:4000/api';

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || fallbackApiUrl;

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;

  if (user) {
    const token = await user.getIdToken();
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export async function getDashboard() {
  const response = await api.get('/home/dashboard');
  return response.data;
}

export async function getNearbyRoutes() {
  const response = await api.get('/routes/nearby');
  return response.data;
}

export async function getRouteById(routeId) {
  const response = await api.get(`/routes/${routeId}`);
  return response.data;
}

export async function getRouteMissions(routeId) {
  const response = await api.get(`/missions/route/${routeId}`);
  return response.data;
}

export async function getActiveRouteSession() {
  const response = await api.get('/route-sessions/active');
  return response.data;
}

export async function getRouteSessionById(sessionId) {
  const response = await api.get(`/route-sessions/${sessionId}`);
  return response.data;
}

export async function startRouteSession(routeId) {
  const response = await api.post(`/route-sessions/start/${routeId}`);
  return response.data;
}

export async function getMissionsData() {
  const response = await api.get('/missions');
  return response.data;
}

export async function getTrashCategories() {
  const response = await api.get('/trash-categories');
  return response.data;
}

export async function analyzeTrashPhoto(payload) {
  const response = await api.post('/trash-submissions/analyze', payload);
  return response.data;
}

export async function confirmTrash(
  sessionId,
  finalCategoryId = 'plastic',
  quantity = 1,
  imageUri = null,
  finalCategoryName = null,
  extraPayload = {}
) {
  const response = await api.post(`/route-sessions/${sessionId}/confirm-trash`, {
    ...extraPayload,
    finalCategoryId,
    finalCategoryName,
    imageUri,
    quantity,
  });
  return response.data;
}

export async function finishRouteSession(sessionId) {
  const response = await api.post(`/route-sessions/${sessionId}/finish`);
  return response.data;
}

export async function getStoreData() {
  const response = await api.get('/store');
  return response.data;
}

export async function getProfileData() {
  const response = await api.get('/profile');
  return response.data;
}

export async function resetDemoState() {
  const response = await api.post('/dev/reset');
  return response.data;
}

export default api;
