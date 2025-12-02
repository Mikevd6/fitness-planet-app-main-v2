const mockAxios = {
  defaults: { baseURL: '', headers: {} },
  create: jest.fn(function (config = {}) {
    mockAxios.defaults = {
      ...mockAxios.defaults,
      ...config,
      baseURL: config.baseURL
    };
    return mockAxios;
  }),
  get: jest.fn(() => Promise.resolve({ data: {} })),
  post: jest.fn(() => Promise.resolve({ data: {} })),
  put: jest.fn(() => Promise.resolve({ data: {} })),
  interceptors: {
    request: { use: jest.fn() },
    response: { use: jest.fn() }
  }
};

export default mockAxios;
