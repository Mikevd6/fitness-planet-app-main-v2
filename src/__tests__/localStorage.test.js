import { storage } from '../utils/localStorage';

describe('LocalStorage Utility', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });
  
  test('saves and retrieves user', () => {
    const testUser = { id: 1, name: 'Test User', email: 'test@example.com' };
    storage.setUser(testUser);
    const retrievedUser = storage.getUser();
    expect(retrievedUser).toEqual(testUser);
  });
  
  test('adds and removes favorites', () => {
    const recipe = { id: 1, title: 'Test Recipe' };
    
    // Initially empty
    expect(storage.getFavorites()).toEqual([]);
    
    // Add favorite
    storage.addToFavorites(recipe);
    expect(storage.getFavorites()).toContainEqual(recipe);
    
    // Remove favorite
    storage.removeFromFavorites(1);
    expect(storage.getFavorites()).toEqual([]);
  });
  
  test('handles profile data', () => {
    const profile = {
      naam: 'Test User',
      email: 'test@example.com',
      leeftijd: 30
    };
    
    storage.setProfile(profile);
    const retrievedProfile = storage.getProfile();
    expect(retrievedProfile.naam).toBe('Test User');
    expect(retrievedProfile.email).toBe('test@example.com');
  });
});