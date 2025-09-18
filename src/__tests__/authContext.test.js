const React = require('react');
const { renderHook, act } = require('@testing-library/react');

// Mock backend auth to force fallback to noviAuthService (demo auth)
jest.mock('../services/authService', () => ({
  __esModule: true,
  default: {
    login: jest.fn(() => Promise.reject(new Error('backend unavailable'))),
    register: jest.fn(),
    logout: jest.fn(),
    getCurrentUser: jest.fn(() => null),
    isAuthenticated: jest.fn(() => false)
  }
}));

const { AuthProvider, useAuth } = require('../contexts/AuthContext');

const wrapper = ({ children }) => React.createElement(AuthProvider, null, children);

describe('AuthContext login/logout flow', () => {
  beforeEach(() => {
    // Reset storage and mocks between tests
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('login sets user and isAuthenticated via fallback', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login('demo@fitnessplanet.com', 'demo123');
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toBeTruthy();
    expect(result.current.user.email).toBe('demo@fitnessplanet.com');
  });

  test('logout clears user and isAuthenticated', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login('demo@fitnessplanet.com', 'demo123');
    });
    expect(result.current.isAuthenticated).toBe(true);

    act(() => {
      result.current.logout();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBe(null);
  });
});
