const React = require('react');
const { renderHook, act, waitFor } = require('@testing-library/react');

// Mock backend auth to provide a successful login response
jest.mock('../services/authService', () => ({
  __esModule: true,
  default: {
    login: jest.fn(async (email) => {
      // simulate backend success
      const user = { email };
      // store user like fallback would, if context relies on localStorage
      localStorage.setItem('user', JSON.stringify(user));
      return user;
    }),
    register: jest.fn(),
    logout: jest.fn(() => {
      localStorage.removeItem('user');
    }),
    getCurrentUser: jest.fn(() => {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    }),
    // Reflect authentication based on storing user in localStorage
    isAuthenticated: jest.fn(() => !!localStorage.getItem('user'))
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

    await waitFor(() => expect(result.current.isAuthenticated).toBe(true));
    expect(result.current.user).toBeTruthy();
    expect(result.current.user.email).toBe('demo@fitnessplanet.com');
  });

  test('logout clears user and isAuthenticated', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login('demo@fitnessplanet.com', 'demo123');
    });
    await waitFor(() => expect(result.current.isAuthenticated).toBe(true));

    act(() => {
      result.current.logout();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBe(null);
  });
});
