// Jest manual mock for axios (CommonJS style to avoid ESM parse issues)
const makeInstance = () => ({
  interceptors: { request: { use: jest.fn() }, response: { use: jest.fn() } },
  get: jest.fn(() => Promise.resolve({ data: {}, status: 200 })),
  post: jest.fn(() => Promise.resolve({ data: {}, status: 200 })),
  put: jest.fn(() => Promise.resolve({ data: {}, status: 200 })),
  patch: jest.fn(() => Promise.resolve({ data: {}, status: 200 })),
  delete: jest.fn(() => Promise.resolve({ data: {}, status: 200 })),
  request: jest.fn((config) => Promise.resolve({ data: {}, status: 200, config })),
});

const mockInstance = makeInstance();

const axiosMock = {
  create: () => makeInstance(),
  ...mockInstance,
};

module.exports = axiosMock;
// Support default import style (axios default)
module.exports.default = module.exports;
