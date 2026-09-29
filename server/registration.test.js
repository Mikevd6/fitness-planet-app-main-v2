import assert from 'node:assert/strict';
import test from 'node:test';
import { createNoviAccount, RegistrationError, validateRegistration } from './registration.js';

const config = { projectId: 'project-test', adminEmail: 'admin@example.com', adminPassword: 'private-admin-value' };

test('registration validates input before contacting NOVI', async () => {
  assert.throws(() => validateRegistration({ email: 'invalid', password: 'longenough' }), RegistrationError);
  assert.throws(() => validateRegistration({ email: 'user@example.com', password: 'short' }), RegistrationError);
  let called = false;
  await assert.rejects(createNoviAccount({ email: 'invalid', password: 'longenough' }, config, () => { called = true; }), RegistrationError);
  assert.equal(called, false);
});

test('public signup creates only a normal user and returns no credentials', async () => {
  const calls = [];
  const fakeFetch = async (url, options) => {
    calls.push({ url, options });
    if (url.endsWith('/login')) return { ok: true, json: async () => ({ token: 'admin-jwt' }) };
    if (url.endsWith('/users') && options.method === 'GET') return { ok: true, json: async () => [] };
    return { ok: true, status: 201, json: async () => ({ id: 3, email: 'student@example.com', roles: ['user'] }) };
  };

  const result = await createNoviAccount({ email: ' Student@Example.com ', password: 'student-secret' }, config, fakeFetch);
  assert.deepEqual(result, { email: 'student@example.com' });
  assert.equal(calls.length, 3);
  assert.equal(calls[0].options.headers['novi-education-project-id'], 'project-test');
  assert.equal(calls[2].options.headers.Authorization, 'Bearer admin-jwt');
  assert.deepEqual(JSON.parse(calls[2].options.body), {
    email: 'student@example.com', password: 'student-secret', roles: ['user']
  });
  assert.equal(JSON.stringify(result).includes('admin-jwt'), false);
  assert.equal(JSON.stringify(result).includes('student-secret'), false);
});

test('duplicate email is reported without exposing NOVI response', async () => {
  const fakeFetch = async (url) => url.endsWith('/login')
    ? { ok: true, json: async () => ({ token: 'admin-jwt' }) }
    : { ok: true, json: async () => [{ id: 0, email: 'student@example.com' }] };
  await assert.rejects(
    createNoviAccount({ email: 'student@example.com', password: 'student-secret' }, config, fakeFetch),
    (error) => error.status === 409 && /al geregistreerd/.test(error.message)
  );
});
