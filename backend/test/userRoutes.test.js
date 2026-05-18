const assert = require('node:assert/strict');
const test = require('node:test');

const homeRoutes = require('../src/routes/homeRoutes');
const missionRoutes = require('../src/routes/missionRoutes');
const profileRoutes = require('../src/routes/profileRoutes');
const redemptionRoutes = require('../src/routes/redemptionRoutes');
const storeRoutes = require('../src/routes/storeRoutes');

function getUseStack(router) {
  return router.stack.filter((layer) => !layer.route).map((layer) => layer.name);
}

function getRouteHandlers(router, path, method) {
  const layer = router.stack.find(
    (stackLayer) => stackLayer.route?.path === path && stackLayer.route.methods[method]
  );

  return layer?.route?.stack?.map((handlerLayer) => handlerLayer.name) || null;
}

test('home routes require firebase auth middleware', () => {
  assert.deepEqual(getUseStack(homeRoutes), ['verifyFirebaseToken', 'authMiddleware']);
  assert.deepEqual(getRouteHandlers(homeRoutes, '/dashboard', 'get'), ['getDashboard']);
});

test('mission routes require firebase auth middleware', () => {
  assert.deepEqual(getUseStack(missionRoutes), ['verifyFirebaseToken', 'authMiddleware']);
  assert.deepEqual(getRouteHandlers(missionRoutes, '/', 'get'), ['getMissions']);
});

test('store routes require firebase auth middleware', () => {
  assert.deepEqual(getUseStack(storeRoutes), ['verifyFirebaseToken', 'authMiddleware']);
  assert.deepEqual(getRouteHandlers(storeRoutes, '/', 'get'), ['getStoreOverview']);
});

test('profile routes require firebase auth middleware', () => {
  assert.deepEqual(getUseStack(profileRoutes), ['verifyFirebaseToken', 'authMiddleware']);
  assert.deepEqual(getRouteHandlers(profileRoutes, '/', 'get'), ['getProfileOverview']);
});

test('redemption routes require firebase auth middleware', () => {
  assert.deepEqual(getUseStack(redemptionRoutes), ['verifyFirebaseToken', 'authMiddleware']);
  assert.deepEqual(getRouteHandlers(redemptionRoutes, '/me', 'get'), ['getCurrentUserRedemptions']);
  assert.deepEqual(getRouteHandlers(redemptionRoutes, '/:rewardId', 'post'), ['redeemReward']);
});
