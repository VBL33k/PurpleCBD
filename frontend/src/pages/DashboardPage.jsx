import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import s from './DashboardPage.module.css';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://purplecbd.onrender.com';

const LOGO = 'https://i.imgur.com/CbcU0Qp.png';

function GridIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="8" height="8" rx="1.5" />
      <rect x="13" y="3" width="8" height="8" rx="1.5" />
      <rect x="3" y="13" width="8" height="8" rx="1.5" />
      <rect x="13" y="13" width="8" height="8" rx="1.5" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [members, setMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(true);
  const [membersError, setMembersError] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  useEffect(() => {
    async function fetchMembers() {
      setMembersLoading(true);
      setMembersError('');
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) { setMembersError('Non authentifié.'); setMembersLoading(false); return; }
        const res = await fetch(`${BACKEND_URL}/api/members`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        setMembers(json.members || []);
      } catch (e) {
        setMembersError('Impossible de charger les membres.');
        console.error(e);
      } finally {
        setMembersLoading(false);
      }
    }
    fetchMembers();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate('/dashboard/login');
  }

  const displayName = user?.email?.split('@')[0] ?? 'Admin';

  return (
    <div className={s.layout}>
      {/* Sidebar */}
      <aside className={s.sidebar}>
        <div className={s.sidebarTop}>
          <Link to="/" className={s.logoLink}>
            <img src={LOGO} alt="Purple CBD" className={s.logo} />
            <span className={s.logoName}>Purple CBD</span>
          </Link>

          <nav className={s.nav}>
            <span className={s.navLabel}>Navigation</span>
            <a href="#" className={`${s.navItem} ${s.navItemActive}`}>
              <GridIcon />
              Vue d'ensemble
            </a>
          </nav>
        </div>

        <div className={s.sidebarBottom}>
          <div className={s.userInfo}>
            <div className={s.userAvatar}>{displayName[0].toUpperCase()}</div>
            <div className={s.userDetails}>
              <span className={s.userName}>{displayName}</span>
              <span className={s.userRole}>Administrateur</span>
            </div>
          </div>
          <button className={s.logoutBtn} onClick={handleLogout}>
            <LogoutIcon />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className={s.main}>
        <header className={s.header}>
          <div>
            <h1 className={s.pageTitle}>Tableau de bord</h1>
            <p className={s.pageSubtitle}>Bienvenue, {displayName}</p>
          </div>
        </header>

        <div className={s.content}>
          <section className={s.section}>
            <div className={s.sectionHeader}>
              <h2 className={s.sectionTitle}>Membres</h2>
              <span className={s.badge}>{members.length} inscrits</span>
            </div>

            {membersLoading && <p className={s.stateMsg}>Chargement...</p>}
            {membersError && <p className={s.stateError}>{membersError}</p>}

            {!membersLoading && !membersError && (
              <div className={s.tableWrapper}>
                <table className={s.table}>
                  <thead>
                    <tr>
                      <th>Membre</th>
                      <th>Nom RP</th>
                      <th>Points</th>
                      <th>Inscrit le</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.length === 0 ? (
                      <tr><td colSpan={4} className={s.emptyRow}>Aucun membre pour l'instant.</td></tr>
                    ) : members.map(m => (
                      <tr key={m.discord_id}>
                        <td>
                          <div className={s.memberCell}>
                            {m.avatar_url
                              ? <img src={m.avatar_url} alt="" className={s.memberAvatar} />
                              : <div className={s.memberAvatarFallback}>{(m.username || '?')[0].toUpperCase()}</div>
                            }
                            <span className={s.memberName}>{m.username || '—'}</span>
                          </div>
                        </td>
                        <td className={s.rpName}>{m.rp_name || '—'}</td>
                        <td className={s.points}>{m.loyalty_points ?? 0}</td>
                        <td className={s.date}>{m.joined_at ? new Date(m.joined_at).toLocaleDateString('fr-FR') : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
