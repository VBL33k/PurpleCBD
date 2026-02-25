import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://purplecbd.onrender.com';

export default function AuthCallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        const user = session.user;
        const isNew = user.created_at === user.last_sign_in_at;

        if (isNew) {
          const meta = user.user_metadata;
          try {
            await fetch(`${BACKEND_URL}/api/notify/new-user`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                username: meta.full_name || meta.name || meta.user_name || 'Inconnu',
                discordId: meta.provider_id || user.id,
                avatarUrl: meta.avatar_url || null,
              }),
            });
          } catch (e) {
            console.error('Notification échouée:', e);
          }
        }
      }
      navigate('/', { replace: true });
    });
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
