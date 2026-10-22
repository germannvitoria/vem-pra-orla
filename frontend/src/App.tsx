import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './lib/supabaseClient'
import Navbar from './Navbar'
import Footer from './Footer'
import LoginPage from './LoginPage'
import Dashboard from './Dashboard'
import Occurrences from './Occurrences'
import Forecast from './Forecast'

export default function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [recarregar, setRecarregar] = useState(0)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setCarregando(false)
    })
    const { data } = supabase.auth.onAuthStateChange((_evento, s) => setSession(s))
    return () => data.subscription.unsubscribe()
  }, [])

  function entrar() {
    supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } })
  }

  if (carregando) return null
  if (!session) return <LoginPage onEntrar={entrar} />

  return (
    <>
      <Navbar email={session.user.email} onSair={() => supabase.auth.signOut()} />
      <main className="container">
        <Dashboard recarregar={recarregar} />
        <Forecast />
        <Occurrences onCriada={() => setRecarregar((n) => n + 1)} />
      </main>
      <Footer />
    </>
  )
}
