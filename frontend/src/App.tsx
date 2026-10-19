import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './lib/supabaseClient';
import Occurrences from './Occurrences';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [resposta, setResposta] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const loginComGoogle = () =>
    supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });

  const sair = () => supabase.auth.signOut();

  const testarBackend = async () => {
    const r = await fetch(`${import.meta.env.VITE_API_URL}/me`, {
      headers: { Authorization: `Bearer ${session?.access_token}` },
    });
    setResposta(JSON.stringify(await r.json(), null, 2));
  };

  if (loading) return <p>Carregando...</p>;

  if (!session) {
    return (
      <main style={{ padding: 32 }}>
        <h1>Vem Pra Orla</h1>
        <button onClick={loginComGoogle}>Entrar com Google</button>
      </main>
    );
  }

  return (
    <main style={{ padding: 32 }}>
      <h1>Vem Pra Orla</h1>
      <p>Logado como {session.user.email}</p>
      <button onClick={testarBackend}>Testar backend (/me)</button>
      <button onClick={sair}>Sair</button>
      <pre>{resposta}</pre>
      <Occurrences />
    </main>
  );
}