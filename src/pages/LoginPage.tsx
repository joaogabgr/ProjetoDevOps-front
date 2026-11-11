import { useState, type FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { messageOf } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import { Field } from '../components/Field';

export function LoginPage() {
  const { session, endedBy, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  if (session) return <Navigate to={from} replace />;

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setSending(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (caught) {
      setError(messageOf(caught));
      setSending(false);
    }
  }

  return (
    <main className="login">
      <form className="login__card" onSubmit={submit} noValidate>
        <h1>Vigia das Águas</h1>
        <p className="login__subtitle">Entre com seu e-mail e senha.</p>
        {endedBy === 'expired' && !error && (
          <p className="login__info" role="status">
            Sua sessão expirou. Entre novamente.
          </p>
        )}
        {error && (
          <p className="login__error" role="alert">
            {error}
          </p>
        )}
        <Field id="email" label="E-mail">
          <input
            id="email"
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </Field>
        <Field id="password" label="Senha">
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </Field>
        <button type="submit" className="button login__submit" disabled={sending || !email || !password}>
          {sending ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
    </main>
  );
}
