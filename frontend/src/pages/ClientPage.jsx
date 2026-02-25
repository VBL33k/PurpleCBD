import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStoredUser, clearUser, updateStoredUser } from '../lib/discordAuth';
import s from './ClientPage.module.css';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://purplecbd.onrender.com';
const LOGO = 'https://i.imgur.com/CbcU0Qp.png';

export default function ClientPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showRpPopup, setShowRpPopup] = useState(false);
  const [rpName, setRpName] = useState('');
  const [rpLoading, setRpLoading] = useState(false);
  const [rpError, setRpError] = useState('');

  useEffect(() => {
    const stored = getStoredUser();
    if (!stored) { navigate('/'); return; }
    setUser(stored);
    if (!stored.rpName) setShowRpPopup(true);
  }, [navigate]);

  async function handleRpSubmit(e) {
    e.preventDefault();
    if (!rpName.trim()) return;
    setRpLoading(true);
    setRpError('');

    const trimmed = rpName.trim();
    updateStoredUser({ rpName: trimmed });

    // Notifier le bot
    try {
      await fetch(`${BACKEND_URL}/api/notify/new-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: user.username || 'Inconnu',
          discordId: user.discordId,
          avatarUrl: user.avatarUrl || null,
          rpName: trimmed,
        }),
      });
    } catch (e) {
      console.error('Notification échouée:', e);
    }

    setUser(getStoredUser());
    setShowRpPopup(false);
    setRpLoading(false);
  }

  function handleLogout() {
    clearUser();
    navigate('/');
  }

  if (!user) return null;

  const displayName = user.rpName || user.username || 'Client';
  const avatar = user.avatarUrl;

  return (
    <div className={s.page}>
      <div className={s.bgOrbs} aria-hidden="true">
        <div className={`${s.orb} ${s.orb1}`} />
        <div className={`${s.orb} ${s.orb2}`} />
      </div>

      {/* Popup Nom RP */}
      {showRpPopup && (
        <div className={s.popupOverlay}>
          <div className={s.popup}>
            <div className={s.popupTop} aria-hidden="true" />
            <img src={LOGO} alt="Purple CBD" className={s.popupLogo} />
            <h2 className={s.popupTitle}>Bienvenue !</h2>
            <p className={s.popupSub}>Avant de continuer, entre ton nom RP</p>
            <form onSubmit={handleRpSubmit} className={s.popupForm}>
              <input
                type="text"
                className={s.popupInput}
                placeholder="Ex: John Smith"
                value={rpName}
                onChange={e => setRpName(e.target.value)}
                required
                autoFocus
                maxLength={32}
              />
              {rpError && <p className={s.popupError}>{rpError}</p>}
              <button type="submit" className={s.popupBtn} disabled={rpLoading}>
                {rpLoading ? 'Enregistrement...' : 'Confirmer'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <header className={s.header}>
        <a href="/" className={s.headerLogo}>
          <img src={LOGO} alt="Purple CBD" />
        </a>
        <div className={s.headerRight}>
          {avatar && <img src={avatar} alt="" className={s.avatar} />}
          <span className={s.headerName}>{displayName}</span>
          <button className={s.logoutBtn} onClick={handleLogout}>Déconnexion</button>
        </div>
      </header>

      {/* Contenu */}
      <main className={s.main}>
        <div className={s.welcome}>
          <h1 className={s.welcomeTitle}>Espace Client</h1>
          <p className={s.welcomeSub}>Bienvenue, <span>{displayName}</span></p>
        </div>

        <div className={s.cards}>
          <div className={s.card}>
            <div className={s.cardIcon}>🛒</div>
            <div className={s.cardTitle}>Mes Commandes</div>
            <div className={s.cardSub}>Historique & suivi</div>
            <span className={s.cardBadge}>Bientôt</span>
          </div>
          <div className={s.card}>
            <div className={s.cardIcon}>⭐</div>
            <div className={s.cardTitle}>Fidélité</div>
            <div className={s.cardSub}>Points & récompenses</div>
            <span className={s.cardBadge}>Bientôt</span>
          </div>
          <div className={s.card}>
            <div className={s.cardIcon}>🎁</div>
            <div className={s.cardTitle}>Offres Exclusives</div>
            <div className={s.cardSub}>Réservées aux membres</div>
            <span className={s.cardBadge}>Bientôt</span>
          </div>
        </div>
      </main>
    </div>
  );
}
