import api from './client';

export type CreateUserPayload = {
  username: string;
  email: string;
  password: string;
  info?: string;
  authorities?: { authority: string }[];
};

export async function createUser(payload: CreateUserPayload, opts?: { jwt?: string }) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Api-Key': 'fitnessplanet:7m997U9ozv6dJ9JLyWh9',
  };
  if (opts?.jwt) {
    headers.Authorization = `Bearer ${opts.jwt}`;
  }
  const res = await api.post('/users', payload, { headers });
  return res.data;
}