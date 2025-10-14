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

await createUser(
  {
    username: 'testuser2',
    email: 'mikevd6@hotmail.com',
    password: 'testpassword',
    info: 'testinfo',
    authorities: [{ authority: 'USER' }],
  },
  {
    jwt: 'eyJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiVVNFUiIsInVzZXJJZCI6MTMsImFwcGxpY2F0aW9uTmFtZSI6InRlc3RhcHAiLCJzdWIiOiJ0ZXN0dXNlciIsImlhdCI6MTc2MDQ3ODk5NywiZXhwIjoxNzYxMzQyOTk3fQ.i_wZHiSJEdbfO2lwwiX4Fz75YZjXq-H3syJE6L6Xy0Y',
  }
);