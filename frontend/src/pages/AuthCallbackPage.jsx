import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { storeUser, getStoredUser } from '../lib/discordAuth';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://purple-cbd-api.onrender.com';

export default function AuthCallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');

    if (!code) {
      navigate('/', { replace: true });
      return;
    }

    const redirectUri = `${window.location.origin}/auth/callback`;

    fetch(`${BACKEND_URL}/api/auth/discord/callback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, redirectUri }),
    })
      .then(res => res.json())
      .then(user => {
        if (user.discordId) {
          // Préserve le rpName si c'est le même utilisateur
          const existing = getStoredUser();
          if (existing?.discordId === user.discordId && existing?.rpName) {
            user.rpName = existing.rpName;
          }
          storeUser(user);
          navigate('/client', { replace: true });
        } else {
          navigate('/', { replace: true });
        }
      })
      .catch(() => navigate('/', { replace: true }));
  }, [navigate]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#06030d',
      color: 'rgba(255,255,255,0.5)',
      fontFamily: 'sans-serif',
      fontSize: '14px',
    }}>
      Connexion en cours…
    </div>
  );
}
