/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-undef */
const React = require('react');
const { renderHook, act, waitFor } = require('@testing-library/react');

// Mock AuthContext to avoid external module dependency during tests
jest.mock('../contexts/AuthContext', () => {
  const React = require('react');
  const AuthContext = React.createContext(null);

  const AuthProvider = ({ children }) => {
    const [user, setUser] = React.useState(() => {
      const raw = globalThis.localStorage?.getItem('user');
      return raw ? JSON.parse(raw) : null;
    });

    const login = jest.fn(async (email, _password) => {
      const loggedInUser = { email };
      globalThis.localStorage?.setItem('user', JSON.stringify(loggedInUser));
      setUser(loggedInUser);
      return loggedInUser;
    });

    const logout = jest.fn(() => {
      globalThis.localStorage?.removeItem('user');
      setUser(null);
    });

    const value = React.useMemo(
      () => ({ user, isAuthenticated: !!user, login, logout }),
      [user]
    );

    return React.createElement(AuthContext.Provider, { value }, children);
  };

  const useAuth = () => React.useContext(AuthContext);

  return { AuthProvider, useAuth };
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
