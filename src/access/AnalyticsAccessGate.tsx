import { lazy, Suspense, useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { loadAnalyticsAccess, signInAnalytics, signInAnalyticsGoogle, signOutAnalytics, subscribeAnalyticsAuth } from '../services/auth';

// Do not import the legacy dashboard until a network-wide access grant is verified.
// This is a UI entry guard, NOT a substitute for server-side authorization or
// removing compatibility datasets from publicly hosted JavaScript assets.
const InternalAnalytics = lazy(() => import('../App'));

type State = 'checking' | 'signed-out' | 'denied' | 'allowed' | 'error';

export function AnalyticsAccessGate() {
  const [state, setState] = useState<State>('checking');
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let generation = 0;
    const stop = subscribeAnalyticsAuth(nextUser => {
      const current = ++generation;
      setUser(nextUser);
      setMessage('');
      if (!nextUser) { setState('signed-out'); return; }
      setState('checking');
      void loadAnalyticsAccess(nextUser.uid).then(access => {
        if (current !== generation) return;
        // This legacy dashboard contains whole-network figures; scoped grants
        // must NOT unlock it until proper server-filtered area views exist.
        setState(access.isAdmin || (access.canReadTicketSales && access.canReadKp) ? 'allowed' : 'denied');
      }).catch(() => {
        if (current !== generation) return;
        setMessage('Impossibile verificare i permessi DNS Core.');
        setState('error');
      });
    });
    return () => { generation++; stop(); };
  }, []);

  async function login(method: 'google' | 'password') {
    setBusy(true);
    setMessage('');
    try {
      if (method === 'google') await signInAnalyticsGoogle();
      else await signInAnalytics(email, password);
      setPassword('');
    } catch {
      setMessage('Accesso non riuscito. Verificare l’account DNS.');
    } finally {
      setBusy(false);
    }
  }

  if (state === 'allowed') {
    return <Suspense fallback={<div role="status" style={{padding:32}}>Caricamento DNS Analytics…</div>}>
      <InternalAnalytics />
    </Suspense>;
  }

  return <main style={{minHeight:'100vh',display:'grid',placeItems:'center',background:'var(--dns-bg, #f4f8f9)',color:'var(--dns-deep, #0d4d5e)',padding:24}}>
    <section style={{width:'100%',maxWidth:420,padding:28,borderRadius:16,background:'#fff',boxShadow:'0 8px 28px #0d4d5e14'}}>
      <h1 style={{fontSize:24,marginBottom:8}}>DNS Analytics</h1>
      <p style={{marginBottom:22}}>{state === 'checking' ? 'Verifica accesso DNS…' : state === 'denied' ? 'L’account non dispone dei permessi per Analytics interno.' : state === 'error' ? 'Verifica dell’accesso non disponibile.' : 'Accesso riservato agli utenti autorizzati Dolomiti NordicSki.'}</p>
      {(state === 'signed-out' || state === 'denied' || state === 'error') && <>
        <button type="button" disabled={busy} onClick={() => void login('google')} style={{display:'block',width:'100%',padding:12,marginBottom:16}}>Accedi con Google</button>
        {state === 'signed-out' && <>
          <form onSubmit={e => {e.preventDefault();void login('password');}}>
            <input aria-label="Email" type="email" autoComplete="username" placeholder="Email" required value={email} onChange={e=>setEmail(e.target.value)} style={{display:'block',width:'100%',padding:10,marginBottom:8}}/>
            <input aria-label="Password" type="password" autoComplete="current-password" placeholder="Password" required value={password} onChange={e=>setPassword(e.target.value)} style={{display:'block',width:'100%',padding:10,marginBottom:12}}/>
            <button type="submit" disabled={busy} style={{width:'100%',padding:12}}>Accedi con email</button>
          </form>
        </>}
        {user && <button type="button" onClick={() => void signOutAnalytics()} style={{marginTop:12}}>Esci / cambia account</button>}
      </>}
      {message && <p role="alert" style={{color:'#993c1d'}}>{message}</p>}
    </section>
  </main>;
}
