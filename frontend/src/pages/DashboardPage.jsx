import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import s from './DashboardPage.module.css';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://purplecbd.onrender.com';
const LOGO = 'https://i.imgur.com/CbcU0Qp.png';

const STATUS_OPTIONS = [
  { value: 'pending',   label: 'En attente',  color: '#f59e0b' },
  { value: 'confirmed', label: 'Confirmée',   color: '#8b5cf6' },
  { value: 'ready',     label: 'Prête',       color: '#06b6d4' },
  { value: 'delivered', label: 'Livrée',      color: '#10b981' },
  { value: 'cancelled', label: 'Annulée',     color: '#ef4444' },
];

/* ── Icons ── */
function GridIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="8" height="8" rx="1.5" /><rect x="13" y="3" width="8" height="8" rx="1.5" />
      <rect x="3" y="13" width="8" height="8" rx="1.5" /><rect x="13" y="13" width="8" height="8" rx="1.5" />
    </svg>
  );
}
function UsersIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
    </svg>
  );
}
function OrdersIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
      <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  );
}
function SettingsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
    </svg>
  );
}
function LogoutIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
      <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  );
}
function RefreshIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
      <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
    </svg>
  );
}
function DiscordIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
    </svg>
  );
}
function TruckIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
      <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
    </svg>
  );
}
function StoreIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('members');

  /* Members */
  const [members, setMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(true);
  const [membersError, setMembersError] = useState('');

  /* Orders */
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState('');
  const [statusUpdating, setStatusUpdating] = useState({});

  /* Settings */
  const [settings, setSettings] = useState({ delivery_enabled: false, store_open: false });
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  /* Load members */
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

  /* Load orders */
  async function fetchOrders() {
    setOrdersLoading(true);
    setOrdersError('');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setOrdersError('Non authentifié.'); setOrdersLoading(false); return; }
      const res = await fetch(`${BACKEND_URL}/api/orders`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setOrders(json.orders || []);
    } catch (e) {
      setOrdersError('Impossible de charger les commandes.');
      console.error(e);
    } finally {
      setOrdersLoading(false);
    }
  }

  /* Load settings */
  async function fetchSettings() {
    setSettingsLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/settings`);
      const json = await res.json();
      setSettings(json);
    } catch (e) { console.error(e); }
    finally { setSettingsLoading(false); }
  }

  function handleTabChange(tab) {
    setActiveTab(tab);
    if (tab === 'orders') fetchOrders();
    if (tab === 'settings') fetchSettings();
  }

  /* Update order status */
  async function updateStatus(orderId, status) {
    setStatusUpdating(prev => ({ ...prev, [orderId]: true }));
    try {
      const { data: { session } } = await supabase.auth.getSession();
      await fetch(`${BACKEND_URL}/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ status }),
      });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    } catch (e) { console.error(e); }
    finally { setStatusUpdating(prev => ({ ...prev, [orderId]: false })); }
  }

  /* Save settings */
  async function saveSettings() {
    setSettingsSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      await fetch(`${BACKEND_URL}/api/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify(settings),
      });
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 2500);
    } catch (e) { console.error(e); }
    finally { setSettingsSaving(false); }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate('/dashboard/login');
  }

  const displayName = user?.email?.split('@')[0] ?? 'Admin';
  const pendingCount = orders.filter(o => o.status === 'pending').length;

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
            <button className={`${s.navItem} ${activeTab === 'members' ? s.navItemActive : ''}`} onClick={() => handleTabChange('members')}>
              <UsersIcon /> Membres
              {members.length > 0 && <span className={s.navBadge}>{members.length}</span>}
            </button>
            <button className={`${s.navItem} ${activeTab === 'orders' ? s.navItemActive : ''}`} onClick={() => handleTabChange('orders')}>
              <OrdersIcon /> Commandes
              {pendingCount > 0 && <span className={s.navBadgeAlert}>{pendingCount}</span>}
            </button>
            <button className={`${s.navItem} ${activeTab === 'settings' ? s.navItemActive : ''}`} onClick={() => handleTabChange('settings')}>
              <SettingsIcon /> Paramètres
            </button>
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
            <LogoutIcon /> Déconnexion
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className={s.main}>

        {/* ── Membres ── */}
        {activeTab === 'members' && (
          <>
            <header className={s.header}>
              <div>
                <h1 className={s.pageTitle}>Membres</h1>
                <p className={s.pageSubtitle}>{members.length} membre{members.length !== 1 ? 's' : ''} inscrit{members.length !== 1 ? 's' : ''}</p>
              </div>
            </header>
            <div className={s.content}>
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
            </div>
          </>
        )}

        {/* ── Commandes ── */}
        {activeTab === 'orders' && (
          <>
            <header className={s.header}>
              <div>
                <h1 className={s.pageTitle}>Commandes</h1>
                <p className={s.pageSubtitle}>{orders.length} commande{orders.length !== 1 ? 's' : ''} au total</p>
              </div>
              <button className={s.refreshBtn} onClick={fetchOrders} disabled={ordersLoading} title="Actualiser">
                <RefreshIcon />
              </button>
            </header>
            <div className={s.content}>
              {ordersLoading && <p className={s.stateMsg}>Chargement...</p>}
              {ordersError && <p className={s.stateError}>{ordersError}</p>}
              {!ordersLoading && !ordersError && orders.length === 0 && (
                <p className={s.stateMsg}>Aucune commande pour l'instant.</p>
              )}
              {!ordersLoading && !ordersError && orders.length > 0 && (
                <div className={s.ordersList}>
                  {orders.map(order => {
                    const st = STATUS_OPTIONS.find(s => s.value === order.status) || STATUS_OPTIONS[0];
                    return (
                      <div key={order.id} className={s.orderCard}>
                        <div className={s.orderCardTop}>
                          {/* Client info */}
                          <div className={s.orderClient}>
                            {order.avatar_url
                              ? <img src={order.avatar_url} alt="" className={s.orderAvatar} />
                              : <div className={s.orderAvatarFallback}>{(order.username || '?')[0].toUpperCase()}</div>
                            }
                            <div className={s.orderClientInfo}>
                              <div className={s.orderClientName}>{order.rp_name || order.username || '—'}</div>
                              <div className={s.orderClientSub}>{order.username}{order.rp_name && order.username !== order.rp_name ? ` · @${order.username}` : ''}</div>
                            </div>
                          </div>

                          {/* Meta */}
                          <div className={s.orderMeta}>
                            <span className={s.orderId}>#{order.id.slice(-6).toUpperCase()}</span>
                            <span className={s.orderDate}>{new Date(order.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                            <span className={s.orderDelivery}>
                              {order.delivery_type === 'delivery' ? <><TruckIcon /> Livraison</> : <><StoreIcon /> Retrait</>}
                            </span>
                          </div>

                          {/* Status badge */}
                          <span className={s.orderStatusBadge} style={{ color: st.color, borderColor: st.color + '33', background: st.color + '14' }}>
                            {st.label}
                          </span>
                        </div>

                        {/* Items */}
                        <div className={s.orderItems}>
                          {(order.items || []).map((item, i) => (
                            <span key={i} className={s.orderItem}>{item.name} ×{item.qty}</span>
                          ))}
                        </div>

                        {/* Address */}
                        {order.address && (
                          <div className={s.orderAddress}><TruckIcon /> {order.address}</div>
                        )}

                        {/* Notes */}
                        {order.notes && (
                          <div className={s.orderNotes}>Note: {order.notes}</div>
                        )}

                        {/* Actions */}
                        <div className={s.orderActions}>
                          <div className={s.orderActionsLeft}>
                            <span className={s.orderTotal}>${order.total}</span>
                            <a
                              href={`https://discord.com/users/${order.discord_id}`}
                              target="_blank"
                              rel="noreferrer"
                              className={s.contactBtn}
                            >
                              <DiscordIcon /> Contacter
                            </a>
                          </div>
                          <div className={s.statusSelect}>
                            {STATUS_OPTIONS.map(opt => (
                              <button
                                key={opt.value}
                                className={`${s.statusBtn} ${order.status === opt.value ? s.statusBtnActive : ''}`}
                                style={order.status === opt.value ? { color: opt.color, borderColor: opt.color + '55', background: opt.color + '18' } : {}}
                                onClick={() => updateStatus(order.id, opt.value)}
                                disabled={statusUpdating[order.id] || order.status === opt.value}
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}

        {/* ── Paramètres ── */}
        {activeTab === 'settings' && (
          <>
            <header className={s.header}>
              <div>
                <h1 className={s.pageTitle}>Paramètres</h1>
                <p className={s.pageSubtitle}>Configuration de la boutique</p>
              </div>
            </header>
            <div className={s.content}>
              {settingsLoading ? (
                <p className={s.stateMsg}>Chargement...</p>
              ) : (
                <div className={s.settingsCard}>
                  <div className={s.settingsSection}>
                    <h2 className={s.settingsSectionTitle}>État de la boutique</h2>
                    <p className={s.settingsSectionSub}>Contrôle la disponibilité de la boutique pour les clients.</p>

                    <div className={s.toggleRow}>
                      <div className={s.toggleInfo}>
                        <span className={s.toggleLabel}>Boutique ouverte</span>
                        <span className={s.toggleDesc}>Quand activé, les clients voient que la boutique est ouverte pour les retraits.</span>
                      </div>
                      <button
                        className={`${s.toggle} ${settings.store_open ? s.toggleOn : ''}`}
                        onClick={() => setSettings(prev => ({ ...prev, store_open: !prev.store_open }))}
                        aria-label="Boutique ouverte"
                      >
                        <span className={s.toggleKnob} />
                      </button>
                    </div>

                    <div className={s.toggleRow}>
                      <div className={s.toggleInfo}>
                        <span className={s.toggleLabel}>Livraison à domicile</span>
                        <span className={s.toggleDesc}>Quand activé, les clients peuvent choisir la livraison lors du checkout.</span>
                      </div>
                      <button
                        className={`${s.toggle} ${settings.delivery_enabled ? s.toggleOn : ''}`}
                        onClick={() => setSettings(prev => ({ ...prev, delivery_enabled: !prev.delivery_enabled }))}
                        aria-label="Livraison activée"
                      >
                        <span className={s.toggleKnob} />
                      </button>
                    </div>
                  </div>

                  <div className={s.settingsFooter}>
                    {settingsSaved && <span className={s.savedMsg}>✓ Sauvegardé</span>}
                    <button className={s.saveBtn} onClick={saveSettings} disabled={settingsSaving}>
                      {settingsSaving ? 'Sauvegarde...' : 'Enregistrer les paramètres'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

      </main>
    </div>
  );
}
