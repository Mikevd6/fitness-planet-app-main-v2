import api from './client';

export type CreateUserPayload = {
  email: string;
  password: string;
  name?: string;
};

export async function createUser(payload: CreateUserPayload) {
  // Adjust path if your API uses /users instead of /user
  const res = await api.post('/user', payload);
  return res.data;
}