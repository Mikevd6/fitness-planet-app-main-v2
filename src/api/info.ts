import api from './client';

export async function updateInfo(info: string) {
  const res = await api.put('/info', { info });
  return res.data;
}