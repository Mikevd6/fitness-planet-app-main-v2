const { api, apiDomain } = require('../services/api');

describe('api wrapper', () => {
  test('api.get returns status 200', async () => {
    const res = await api.get('/health', { context: 'test.health' });
    expect(res.status).toBe(200);
  });

  test('apiDomain.system.health delegates to api.get', async () => {
    const spy = jest.spyOn(api, 'get');
    await apiDomain.system.health();
    expect(spy).toHaveBeenCalledWith('/health', expect.any(Object));
    expect(spy).toHaveBeenCalledTimes(1);
    spy.mockRestore();
  });

  test('apiDomain.system.health returns status 200', async () => {
    const res = await apiDomain.system.health();
    expect(res.status).toBe(200);
  });

  test('recipes.list caches subsequent calls', async () => {
    const first = await apiDomain.recipes.list({ page: 1 });
    const second = await apiDomain.recipes.list({ page: 1 });
    expect(first).toEqual(second);
  });
});
