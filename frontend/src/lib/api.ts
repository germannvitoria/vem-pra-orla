import { supabase } from './supabaseClient';

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  const res = await fetch(`${import.meta.env.VITE_API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!res.ok) {
    const erro = await res.json().catch(() => ({}));
    const msg = Array.isArray(erro.message) ? erro.message.join(', ') : erro.message;
    throw new Error(msg ?? `Erro ${res.status}`);
  }

  return res.json();
}