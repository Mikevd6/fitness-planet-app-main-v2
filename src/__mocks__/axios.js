// Jest manual mock for axios (CommonJS style to avoid ESM parse issues)
const makeInstance = () => ({
  interceptors: { request: { use: () => {} }, response: { use: () => {} } },
  get: (url, config) => Promise.resolve(mockResponse(url, 'get', config)),
  post: (url, data, config) => Promise.resolve(mockResponse(url, 'post', { ...config, data })),
  put: (url, data, config) => Promise.resolve(mockResponse(url, 'put', { ...config, data })),
  patch: (url, data, config) => Promise.resolve(mockResponse(url, 'patch', { ...config, data })),
  delete: (url, config) => Promise.resolve(mockResponse(url, 'delete', config)),
  request: (config = {}) => Promise.resolve(mockResponse(config.url || '', (config.method || 'get').toLowerCase(), config)),
});

const mockInstance = makeInstance();

const axiosMock = {
  create: () => makeInstance(),
  ...mockInstance,
};

module.exports = axiosMock;
// Support default import style (axios default)
module.exports.default = module.exports;

// Helpers
function mockResponse(url = '', method = 'get', config = {}) {
  if (url.includes('/health')) {
    return { data: { ok: true }, status: 200, config: { url, method, ...config } };
  }
  if (url.includes('/recipes')) {
    return { data: { results: [{ id: 1, name: 'Mock Recipe' }] }, status: 200, config: { url, method, ...config } };
  }
  return { data: {}, status: 200, config: { url, method, ...config } };
}
