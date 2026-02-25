import { useEffect, useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import ChatModal from '../components/Modal/ChatModal';
import s from './DashboardPage.module.css';

const SEEN_KEY = 'chat_seen_vendor';
function getSeenMap() {
  try { return JSON.parse(localStorage.getItem(SEEN_KEY) || '{}'); } catch { return {}; }
}
function updateSeen(orderId) {
  const map = getSeenMap();
  map[orderId] = Date.now();
  localStorage.setItem(SEEN_KEY, JSON.stringify(map));
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://purple-cbd-api.onrender.com';
const LOGO = 'https://i.imgur.com/CbcU0Qp.png';

const STATUS_OPTIONS = [
  { value: 'pending',   label: 'En attente', color: '#f59e0b' },
  { value: 'ready',     label: 'Prête',      color: '#06b6d4' },
  { value: 'delivered', label: 'Livrée',     color: '#10b981' },
  { value: 'picked_up', label: 'Retirée',    color: '#8b5cf6' },
  { value: 'cancelled', label: 'Annulée',    color: '#ef4444' },
];

/* ── Icons ── */
function DashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="3" width="8" height="8" rx="1.5"/>
      <rect x="3" y="13" width="8" height="8" rx="1.5"/><rect x="13" y="13" width="8" height="8" rx="1.5"/>
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
function ChatIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
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

function TrashIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
      <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
    </svg>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');

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
  const [settingsSaving, setSettingsSaving] = useState(null); // key being saved

  /* Chat */
  const [chatOrder, setChatOrder] = useState(null); // { id, ref }
  const [unreadCounts, setUnreadCounts] = useState({}); // { orderId: count }
  const chatOrderRef = useRef(null);

  /* Member actions */
  const [actionLoading, setActionLoading] = useState({});
  const [editPoints, setEditPoints]       = useState(null);  // { discordId, value }
  const [banModal, setBanModal]           = useState(null);  // { discordId, username }
  const [banMessage, setBanMessage]       = useState('');
  const [confirmModal, setConfirmModal]   = useState(null); // { label, onConfirm }

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
      } finally { setMembersLoading(false); }
    }
    fetchMembers();
  }, []);

  /* Load settings (on mount + dashboard tab) */
  async function fetchSettings() {
    setSettingsLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/settings`);
      const json = await res.json();
      setSettings(json);
    } catch (e) { console.error(e); }
    finally { setSettingsLoading(false); }
  }

  useEffect(() => { fetchSettings(); }, []);

  /* Load orders */
  /* Fetch unread counts (client messages unseen by vendor) */
  async function fetchUnreadCounts(orders) {
    if (!orders.length) return;
    const seenMap = getSeenMap();
    const orderIds = orders.map(o => o.id);
    const { data } = await supabase
      .from('chat_messages')
      .select('order_id, created_at')
      .neq('sender', 'vendor')
      .in('order_id', orderIds);
    if (!data) return;
    const counts = {};
    for (const msg of data) {
      const seenAt = seenMap[msg.order_id] || 0;
      if (new Date(msg.created_at).getTime() > seenAt) {
        counts[msg.order_id] = (counts[msg.order_id] || 0) + 1;
      }
    }
    setUnreadCounts(counts);
  }

  /* Subscribe to realtime new messages */
  useEffect(() => {
    const channel = supabase
      .channel('vendor_chat_watch')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
      }, payload => {
        const msg = payload.new;
        if (msg.sender === 'vendor') return; // own message
        const openId = chatOrderRef.current?.id;
        if (openId === msg.order_id) return; // chat open for this order
        setUnreadCounts(prev => ({
          ...prev,
          [msg.order_id]: (prev[msg.order_id] || 0) + 1,
        }));
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  /* Open chat & mark as read */
  function openChat(orderId) {
    chatOrderRef.current = { id: orderId };
    setChatOrder({ id: orderId });
    updateSeen(orderId);
    setUnreadCounts(prev => {
      const next = { ...prev };
      delete next[orderId];
      return next;
    });
  }

  /* Close chat */
  function closeChat() {
    chatOrderRef.current = null;
    setChatOrder(null);
  }

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
      const orders = json.orders || [];
      setOrders(orders);
      fetchUnreadCounts(orders);
    } catch (e) {
      setOrdersError('Impossible de charger les commandes.');
      console.error(e);
    } finally { setOrdersLoading(false); }
  }

  function handleTabChange(tab) {
    setActiveTab(tab);
    if (tab === 'orders') fetchOrders();
  }

  /* Admin token helper */
  async function getToken() {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token;
  }

  /* Reset member account (points + orders) */
  async function resetMember(discordId) {
    setActionLoading(prev => ({ ...prev, [discordId]: true }));
    try {
      const token = await getToken();
      await fetch(`${BACKEND_URL}/api/members/${discordId}/reset`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      setMembers(prev => prev.map(m =>
        m.discord_id === discordId ? { ...m, loyalty_points: 0 } : m
      ));
    } catch (e) { console.error(e); }
    finally { setActionLoading(prev => ({ ...prev, [discordId]: false })); }
  }

  /* Ban / unban member */
  async function saveBan(discordId, banned, message) {
    setActionLoading(prev => ({ ...prev, [discordId]: true }));
    try {
      const token = await getToken();
      await fetch(`${BACKEND_URL}/api/members/${discordId}/ban`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ banned, banMessage: message || null }),
      });
      setMembers(prev => prev.map(m =>
        m.discord_id === discordId ? { ...m, banned, ban_message: message || null } : m
      ));
    } catch (e) { console.error(e); }
    finally {
      setActionLoading(prev => ({ ...prev, [discordId]: false }));
      setBanModal(null);
      setBanMessage('');
    }
  }

  /* Edit loyalty points */
  async function savePoints(discordId, points) {
    setActionLoading(prev => ({ ...prev, [discordId]: true }));
    try {
      const token = await getToken();
      await fetch(`${BACKEND_URL}/api/members/${discordId}/points`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ points }),
      });
      setMembers(prev => prev.map(m =>
        m.discord_id === discordId ? { ...m, loyalty_points: points } : m
      ));
    } catch (e) { console.error(e); }
    finally {
      setActionLoading(prev => ({ ...prev, [discordId]: false }));
      setEditPoints(null);
    }
  }

  /* Delete order */
  async function deleteOrder(orderId) {
    try {
      const token = await getToken();
      await fetch(`${BACKEND_URL}/api/orders/${orderId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(prev => prev.filter(o => o.id !== orderId));
    } catch (e) { console.error(e); }
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

  /* Toggle setting (instant save) */
  async function toggleSetting(key) {
    const newVal = !settings[key];
    setSettings(prev => ({ ...prev, [key]: newVal }));
    setSettingsSaving(key);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      await fetch(`${BACKEND_URL}/api/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ [key]: newVal }),
      });
    } catch (e) { console.error(e); setSettings(prev => ({ ...prev, [key]: !newVal })); }
    finally { setTimeout(() => setSettingsSaving(null), 1000); }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate('/'); // ← landing page
  }

  const displayName = user?.email?.split('@')[0] ?? 'Admin';
  const pendingCount = orders.filter(o => o.status === 'pending').length;

  /* Dashboard stats */
  const totalRevenue = orders.reduce((s, o) => s + (o.total || 0), 0);

  return (
    <div className={s.layout}>
      {/* Chat Modal */}
      {chatOrder && (
        <ChatModal
          orderId={chatOrder.id}
          orderRef={chatOrder.id}
          senderType="vendor"
          senderName="Équipe Purple CBD"
          onClose={closeChat}
        />
      )}

      {/* Sidebar */}
      <aside className={s.sidebar}>
        <div className={s.sidebarTop}>
          <Link to="/" className={s.logoLink}>
            <img src={LOGO} alt="Purple CBD" className={s.logo} />
            <span className={s.logoName}>Purple CBD</span>
          </Link>

          <nav className={s.nav}>
            <span className={s.navLabel}>Navigation</span>
            <button className={`${s.navItem} ${activeTab === 'dashboard' ? s.navItemActive : ''}`} onClick={() => handleTabChange('dashboard')}>
              <DashIcon /> Dashboard
            </button>
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

        {/* ── Dashboard ── */}
        {activeTab === 'dashboard' && (
          <>
            <header className={s.header}>
              <div>
                <h1 className={s.pageTitle}>Dashboard</h1>
                <p className={s.pageSubtitle}>Vue d'ensemble et contrôle boutique</p>
              </div>
            </header>
            <div className={s.content}>

              {/* Stats row */}
              <div className={s.statsRow}>
                <div className={s.statCard}>
                  <span className={s.statNum} style={{ color: '#f59e0b' }}>{pendingCount || members.length > 0 ? pendingCount : '—'}</span>
                  <span className={s.statLabel}>Commandes en attente</span>
                </div>
                <div className={s.statCard}>
                  <span className={s.statNum}>{members.length}</span>
                  <span className={s.statLabel}>Membres inscrits</span>
                </div>
                <div className={s.statCard}>
                  <span className={s.statNum}>${totalRevenue}</span>
                  <span className={s.statLabel}>Chiffre total</span>
                </div>
              </div>

              {/* Store controls */}
              <div className={s.controlsCard}>
                <h2 className={s.controlsTitle}>Contrôle boutique</h2>
                <p className={s.controlsSub}>Les changements sont appliqués immédiatement pour les clients.</p>

                {settingsLoading ? (
                  <p className={s.stateMsg}>Chargement...</p>
                ) : (
                  <div className={s.toggleList}>
                    <div className={s.toggleRow}>
                      <div className={s.toggleInfo}>
                        <div className={s.toggleLabelRow}>
                          <span className={s.toggleLabel}>Boutique ouverte</span>
                          <span className={`${s.statusDot} ${settings.store_open ? s.statusGreen : s.statusRed}`} />
                          {settingsSaving === 'store_open' && <span className={s.savingHint}>Sauvegarde...</span>}
                        </div>
                        <span className={s.toggleDesc}>
                          {settings.store_open ? 'Les clients sont informés que le magasin est ouvert.' : 'Le magasin est fermé — les clients verront un avertissement lors du retrait.'}
                        </span>
                      </div>
                      <button
                        className={`${s.toggle} ${settings.store_open ? s.toggleOn : ''}`}
                        onClick={() => toggleSetting('store_open')}
                        disabled={settingsSaving !== null}
                        aria-label="Boutique ouverte"
                      >
                        <span className={s.toggleKnob} />
                      </button>
                    </div>

                    <div className={s.toggleRow}>
                      <div className={s.toggleInfo}>
                        <div className={s.toggleLabelRow}>
                          <span className={s.toggleLabel}>Livraison à domicile</span>
                          <span className={`${s.statusDot} ${settings.delivery_enabled ? s.statusGreen : s.statusGray}`} />
                          {settingsSaving === 'delivery_enabled' && <span className={s.savingHint}>Sauvegarde...</span>}
                        </div>
                        <span className={s.toggleDesc}>
                          {settings.delivery_enabled ? 'Les clients peuvent choisir la livraison au checkout.' : 'La livraison est désactivée — seul le retrait est disponible.'}
                        </span>
                      </div>
                      <button
                        className={`${s.toggle} ${settings.delivery_enabled ? s.toggleOn : ''}`}
                        onClick={() => toggleSetting('delivery_enabled')}
                        disabled={settingsSaving !== null}
                        aria-label="Livraison activée"
                      >
                        <span className={s.toggleKnob} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

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
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {members.length === 0 ? (
                        <tr><td colSpan={5} className={s.emptyRow}>Aucun membre pour l'instant.</td></tr>
                      ) : members.map(m => (
                        <tr key={m.discord_id} className={m.banned ? s.rowBanned : ''}>
                          <td>
                            <div className={s.memberCell}>
                              {m.avatar_url
                                ? <img src={m.avatar_url} alt="" className={s.memberAvatar} />
                                : <div className={s.memberAvatarFallback}>{(m.username || '?')[0].toUpperCase()}</div>
                              }
                              <span className={s.memberName}>{m.username || '—'}</span>
                              {m.banned && <span className={s.bannedBadge}>Banni</span>}
                            </div>
                          </td>
                          <td className={s.rpName}>{m.rp_name || '—'}</td>
                          <td>
                            {editPoints?.discordId === m.discord_id ? (
                              <div className={s.pointsEditRow}>
                                <input
                                  type="number"
                                  className={s.pointsInput}
                                  value={editPoints.value}
                                  onChange={e => setEditPoints(p => ({ ...p, value: Number(e.target.value) }))}
                                  min={0}
                                  autoFocus
                                />
                                <button className={s.pointsSave} onClick={() => savePoints(m.discord_id, editPoints.value)} disabled={actionLoading[m.discord_id]}>✓</button>
                                <button className={s.pointsCancel} onClick={() => setEditPoints(null)}>✕</button>
                              </div>
                            ) : (
                              <button className={s.pointsBtn} onClick={() => setEditPoints({ discordId: m.discord_id, value: m.loyalty_points ?? 0 })}>
                                {m.loyalty_points ?? 0}
                              </button>
                            )}
                          </td>
                          <td className={s.date}>{m.joined_at ? new Date(m.joined_at).toLocaleDateString('fr-FR') : '—'}</td>
                          <td>
                            <div className={s.memberActions}>
                              <button
                                className={s.actionBtnSmall}
                                onClick={() => setConfirmModal({ label: `Réinitialiser ${m.username || m.rp_name} ?`, onConfirm: () => resetMember(m.discord_id) })}
                                disabled={actionLoading[m.discord_id]}
                              >Reset</button>
                              {m.banned ? (
                                <button
                                  className={`${s.actionBtnSmall} ${s.actionBtnGreen}`}
                                  onClick={() => saveBan(m.discord_id, false, null)}
                                  disabled={actionLoading[m.discord_id]}
                                >Débannir</button>
                              ) : (
                                <button
                                  className={`${s.actionBtnSmall} ${s.actionBtnRed}`}
                                  onClick={() => { setBanModal({ discordId: m.discord_id, username: m.username }); setBanMessage(''); }}
                                  disabled={actionLoading[m.discord_id]}
                                >Bannir</button>
                              )}
                            </div>
                          </td>
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
                    const st = STATUS_OPTIONS.find(o => o.value === order.status) || STATUS_OPTIONS[0];
                    return (
                      <div key={order.id} className={s.orderCard}>
                        <div className={s.orderCardTop}>
                          <div className={s.orderClient}>
                            {order.avatar_url
                              ? <img src={order.avatar_url} alt="" className={s.orderAvatar} />
                              : <div className={s.orderAvatarFallback}>{(order.username || '?')[0].toUpperCase()}</div>
                            }
                            <div className={s.orderClientInfo}>
                              <div className={s.orderClientName}>{order.rp_name || order.username || '—'}</div>
                              {order.rp_name && order.rp_name !== order.username && (
                                <div className={s.orderClientSub}>@{order.username}</div>
                              )}
                            </div>
                          </div>

                          <div className={s.orderMeta}>
                            <span className={s.orderId}>#{order.id.slice(-6).toUpperCase()}</span>
                            <span className={s.orderDate}>{new Date(order.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                            <span className={s.orderDelivery}>
                              {order.delivery_type === 'delivery' ? <><TruckIcon /> Livraison</> : <><StoreIcon /> Retrait</>}
                            </span>
                          </div>

                          <span className={s.orderStatusBadge} style={{ color: st.color, borderColor: st.color + '33', background: st.color + '14' }}>
                            {st.label}
                          </span>
                        </div>

                        <div className={s.orderItems}>
                          {(order.items || []).map((item, i) => (
                            <span key={i} className={s.orderItem}>{item.name} ×{item.qty}</span>
                          ))}
                        </div>

                        {order.address && (
                          <div className={s.orderAddress}><TruckIcon /> {order.address}</div>
                        )}
                        {order.notes && (
                          <div className={s.orderNotes}>Note: {order.notes}</div>
                        )}

                        <div className={s.orderActions}>
                          <div className={s.orderActionsLeft}>
                            {order.order_type === 'loyalty'
                              ? <span className={s.loyaltyOrderBadge}>⭐ {order.points_cost} pts</span>
                              : <span className={s.orderTotal}>${order.total}</span>
                            }
                            {order.order_type === 'regular' && order.points_earned > 0 && (
                              <span className={s.orderPointsEarn}>+{order.points_earned} pts</span>
                            )}
                            <button
                              className={s.deleteOrderBtn}
                              onClick={() => setConfirmModal({ label: `Supprimer la commande #${order.id.slice(-6).toUpperCase()} ?`, onConfirm: () => deleteOrder(order.id) })}
                              title="Supprimer la commande"
                            ><TrashIcon /></button>
                            <button
                              className={`${s.chatBtn} ${unreadCounts[order.id] ? s.chatBtnUnread : ''}`}
                              onClick={() => openChat(order.id)}
                            >
                              {unreadCounts[order.id] ? <span className={s.chatUnreadDot} /> : null}
                              <ChatIcon /> Contacter
                              {unreadCounts[order.id] > 0 && (
                                <span style={{ fontSize: '10px', fontWeight: 700, marginLeft: 2 }}>
                                  {unreadCounts[order.id]}
                                </span>
                              )}
                            </button>
                          </div>
                          <select
                            className={s.statusDropdown}
                            value={order.status}
                            disabled={statusUpdating[order.id]}
                            style={{ color: st.color, borderColor: st.color + '55' }}
                            onChange={e => updateStatus(order.id, e.target.value)}
                          >
                            {STATUS_OPTIONS.map(opt => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
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
                <p className={s.pageSubtitle}>Configuration avancée de la boutique</p>
              </div>
            </header>
            <div className={s.content}>
              <div className={s.emptySettings}>
                <div className={s.emptySettingsIcon}>
                  <SettingsIcon />
                </div>
                <p className={s.emptySettingsText}>Aucun paramètre avancé pour l'instant.</p>
                <p className={s.emptySettingsSub}>Cette section sera complétée prochainement.</p>
              </div>
            </div>
          </>
        )}

      </main>

      {/* ── Confirm Modal ── */}
      {confirmModal && (
        <div className={s.modalOverlay} onClick={e => { if (e.target === e.currentTarget) setConfirmModal(null); }}>
          <div className={s.modal}>
            <h3 className={s.modalTitle}>{confirmModal.label}</h3>
            <div className={s.modalBtns}>
              <button className={s.modalCancelBtn} onClick={() => setConfirmModal(null)}>Annuler</button>
              <button className={s.modalDangerBtn} onClick={() => { confirmModal.onConfirm(); setConfirmModal(null); }}>Confirmer</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Ban Modal ── */}
      {banModal && (
        <div className={s.modalOverlay} onClick={e => { if (e.target === e.currentTarget) { setBanModal(null); setBanMessage(''); } }}>
          <div className={s.modal}>
            <h3 className={s.modalTitle}>Bannir {banModal.username}</h3>
            <p className={s.modalSub}>Le membre verra ce message lors de la connexion.</p>
            <textarea
              className={s.banTextarea}
              placeholder="Raison du ban (optionnel)..."
              value={banMessage}
              onChange={e => setBanMessage(e.target.value)}
              rows={3}
            />
            <div className={s.modalBtns}>
              <button className={s.modalCancelBtn} onClick={() => { setBanModal(null); setBanMessage(''); }}>Annuler</button>
              <button className={s.modalDangerBtn} onClick={() => saveBan(banModal.discordId, true, banMessage)}>Bannir</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
