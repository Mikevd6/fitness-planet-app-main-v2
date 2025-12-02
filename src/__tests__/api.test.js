import apiClient from '../services/api';

test('uses NOVI datavortex base URL by default', () => {
  expect(apiClient.defaults.baseURL).toBe('https://api.datavortex.nl/fitnessplanet');
});
