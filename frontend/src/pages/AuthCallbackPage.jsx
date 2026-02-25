import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function AuthCallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
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
