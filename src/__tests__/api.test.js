import { api, apiDomain } from '../services/api';

describe('api wrapper', () => {
  test('api.get returns success true', async () => {
    const res = await api.get('/health', { context: 'test.health' });
    expect(res.success).toBe(true);
    expect(res.status).toBe(200);
  });

  test('apiDomain.system.health delegates to api.get', async () => {
    const res = await apiDomain.system.health();
    expect(res.success).toBe(true);
  });

  test('recipes.list caches subsequent calls', async () => {
    const first = await apiDomain.recipes.list({ page: 1 });
    const second = await apiDomain.recipes.list({ page: 1 });
    expect(first).toEqual(second);
  });
});
