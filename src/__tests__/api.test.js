import apiClient from '../services/api';

test('uses the NOVI education API URL by default', () => {
  expect(apiClient.defaults.baseURL).toBe('https://novi-backend-api-wgsgz.ondigitalocean.app/api');
});
