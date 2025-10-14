import api from './client';

export type CreateUserPayload = {
  username: string;
  email: string;
  password: string;
  info?: string;
  authorities?: { authority: string }[];
};

export async function createUser(payload: CreateUserPayload) {
  const res = await api.post('/users', payload);
  return res.data;
}