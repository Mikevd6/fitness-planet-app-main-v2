import '@testing-library/jest-dom';

// Mock axios to avoid ESM parsing issues in Jest environment
jest.mock('axios', () => {
  const mockInstance = {
    interceptors: { request: { use: jest.fn() }, response: { use: jest.fn() } },
    get: jest.fn(),
    post: jest.fn(),
  };
  return {
    create: jest.fn(() => mockInstance),
    ...mockInstance,
  };
});
