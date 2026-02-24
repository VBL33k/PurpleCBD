import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import s from './LoginPage.module.css';

const LOGO = 'https://i.imgur.com/CbcU0Qp.png';

export default function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const email = `${username.trim().toLowerCase()}@purplecbd.internal`;
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (authError) {
      setError('Identifiants incorrects. Vérifiez votre email et mot de passe.');
      return;
    }

    navigate('/dashboard');
  }

  return (
    <div className={s.page}>
      <div className={s.bgOrbs} aria-hidden="true">
        <div className={`${s.orb} ${s.orb1}`} />
        <div className={`${s.orb} ${s.orb2}`} />
      </div>

      <div className={s.card}>
        <div className={s.cardTop} aria-hidden="true" />

        <img src={LOGO} alt="Purple CBD" className={s.logo} />

        <h1 className={s.title}>Espace Interne</h1>
        <p className={s.sub}>ACCÈS RESTREINT — ÉQUIPE PURPLE CBD</p>

        <form onSubmit={handleSubmit} className={s.form}>
          <div className={s.formGroup}>
            <label className={s.label} htmlFor="username">Identifiant</label>
            <input
              id="username"
              type="text"
              className={s.input}
              placeholder="votre_id"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              autoComplete="username"
              autoFocus
            />
          </div>

          <div className={s.formGroup}>
            <label className={s.label} htmlFor="password">Mot de passe</label>
            <input
              id="password"
              type="password"
              className={s.input}
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          {error && <p className={s.error}>{error}</p>}

          <button type="submit" className={s.submit} disabled={loading}>
            {loading ? 'Connexion...' : 'Accéder au Dashboard'}
          </button>
        </form>

        <Link to="/" className={s.back}>
          ← Retour au site
        </Link>
      </div>
    </div>
  );
}
