import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { NotificationProvider } from '../contexts/NotificationContext';
import App from '../App';

// Mock the localStorage
const mockLocalStorage = (() => {
  let store = {};
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => { store[key] = value.toString(); }),
    removeItem: jest.fn(key => { delete store[key]; }),
    clear: jest.fn(() => { store = {}; })
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});

describe('App Component', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    jest.clearAllMocks();
  });

  test('renders login when user is not logged in', () => {
    render(
      <NotificationProvider>
        <App />
      </NotificationProvider>
    );
    expect(screen.getByText(/log in/i)).toBeInTheDocument();
  });

  test('renders dashboard when user is logged in', () => {
    // Set the user in localStorage before rendering
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify({ name: 'Test User' }));

    render(
      <NotificationProvider>
        <App />
      </NotificationProvider>
    );
    expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
  });
});
