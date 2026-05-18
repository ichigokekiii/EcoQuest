const assert = require('node:assert/strict');
const test = require('node:test');

const adminMiddleware = require('../src/middleware/adminMiddleware');

function createResponse() {
  return {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
}

test('adminMiddleware rejects requests without an authenticated user', () => {
  const req = {};
  const res = createResponse();
  let nextCalled = false;

  adminMiddleware(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 401);
  assert.deepEqual(res.body, { message: 'Not authenticated' });
});

test('adminMiddleware rejects authenticated non-admin users', () => {
  const req = {
    user: {
      id: 'user-1',
      role: 'user',
    },
  };
  const res = createResponse();
  let nextCalled = false;

  adminMiddleware(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 403);
  assert.deepEqual(res.body, { message: 'Admin access required' });
});

test('adminMiddleware allows admin users through', () => {
  const req = {
    user: {
      id: 'admin-1',
      role: 'admin',
    },
  };
  const res = createResponse();
  let nextCalled = false;

  adminMiddleware(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
  assert.equal(res.statusCode, 200);
  assert.equal(res.body, null);
});
