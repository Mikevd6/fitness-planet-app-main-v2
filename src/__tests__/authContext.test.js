/* eslint-disable no-undef */
const React = require('react');
const { renderHook, act, waitFor } = require('@testing-library/react');

// Mock backend auth to provide a successful login response
jest.mock('../path/to/whatever-you-are-mocking', () => {
  return {
    login: jest.fn(async (email, _password) => {
      const user = { email };
      // Use an allowed object
      globalThis.localStorage?.setItem('user', JSON.stringify(user));
      return user;
    }),
    logout: jest.fn(() => {
      globalThis.localStorage?.removeItem('user');
    }),
  };
});

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
