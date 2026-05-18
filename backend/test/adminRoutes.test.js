const assert = require('node:assert/strict');
const test = require('node:test');

const router = require('../src/routes/adminRoutes');

function getRouteStack(path) {
  const layer = router.stack.find((stackLayer) => stackLayer.route?.path === path);

  return layer?.route?.stack?.map((handlerLayer) => handlerLayer.name) || null;
}

test('admin dashboard route enforces auth and admin middleware', () => {
  assert.deepEqual(getRouteStack('/dashboard'), [
    'verifyFirebaseToken',
    'authMiddleware',
    'adminMiddleware',
    'getAdminDashboard',
  ]);
});

test('admin users route enforces auth and admin middleware', () => {
  assert.deepEqual(getRouteStack('/users'), [
    'verifyFirebaseToken',
    'authMiddleware',
    'adminMiddleware',
    'listAdminUsers',
  ]);
});

test('admin routes route enforces auth and admin middleware', () => {
  assert.deepEqual(getRouteStack('/routes'), [
    'verifyFirebaseToken',
    'authMiddleware',
    'adminMiddleware',
    'listAdminRoutes',
  ]);
});
