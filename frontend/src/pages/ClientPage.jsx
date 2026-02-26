import { useEffect, useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getStoredUser, clearUser, updateStoredUser } from '../lib/discordAuth';
import { supabase } from '../lib/supabase';
import ChatModal from '../components/Modal/ChatModal';
import s from './ClientPage.module.css';

const SEEN_KEY = 'chat_seen_client';
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

const PRODUCTS = [
  { id: 1, name: 'Purple Haze', strain: 'Sativa Dominante', badge: 'Signature', price: 150,
    tags: ['Créatif', 'Euphorisant', 'Diurne'],
    desc: "Notes de baies sauvages et boost créatif d'une rare intensité." },
  { id: 2, name: 'OG Kush', strain: 'Indica Dominante', badge: 'VIP Select', price: 150,
    tags: ['Relaxation', 'Intense', 'Nocturne'],
    desc: "Arôme terreux boisé aux accents de pin et d'épices. Relaxation profonde." },
  { id: 3, name: 'Lemon Haze', strain: 'Sativa Pure', badge: 'Fresh Cut', price: 150,
    tags: ['Énergie', 'Focus', 'Citronné'],
    desc: "Fraîcheur citronnée vive qui ouvre les sens et affine la concentration." },
  { id: 4, name: 'Dark Devil', strain: 'Hybrid Exclusive', badge: 'Ultra Rare', price: 150,
    tags: ['Exclusif', 'Sucré', 'Prestige'],
    desc: "Teintes anthracite et améthyste. Goût sucré d'encens qui enveloppe." },
];

const STATUS_LABELS = {
  pending:   { label: 'En attente',  color: '#f59e0b' },
  ready:     { label: 'Prête',       color: '#06b6d4' },
  delivered: { label: 'Livrée',      color: '#10b981' },
  picked_up: { label: 'Retirée',     color: '#10b981' },
  cancelled: { label: 'Annulée',     color: '#ef4444' },
};

/* ── Icons ── */
function ShopIcon() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>; }
function OrdersIcon() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>; }
function StarIcon() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>; }
function LogoutIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>; }
function PlusIcon() { return <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>; }
function MinusIcon() { return <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>; }
function CartIcon() { return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg>; }
function CloseIcon() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>; }
function CheckIcon() { return <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>; }
function SearchIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>; }
function ImageIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>; }
function StoreIcon() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>; }
function TruckIcon() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>; }
function WarnIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>; }
function CardIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>; }
function ChatIcon() { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>; }

export default function ClientPage() {
  const navigate = useNavigate();
  const [user, setUser]         = useState(null);
  const [activeTab, setActiveTab] = useState('shop');
  const [quantities, setQuantities] = useState({});
  const [search, setSearch]     = useState('');
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [deliveryType, setDeliveryType] = useState('pickup');
  const [address, setAddress]   = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);
  const [settings, setSettings] = useState({ delivery_enabled: false, store_open: false });
  const [myOrders, setMyOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [chatOrder, setChatOrder] = useState(null); // { id } for chat modal
  const [unreadCounts, setUnreadCounts] = useState({}); // { orderId: count }
  const [receiptLightbox, setReceiptLightbox] = useState(null); // URL reçu lightbox
  const [copiedLightbox, setCopiedLightbox]   = useState(false);
  const chatOrderRef = useRef(null);
  const [banData, setBanData] = useState(null); // { message } when banned
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const [pendingPoints, setPendingPoints] = useState(0);
  const [totalSpent, setTotalSpent]       = useState(0);

  /* Loyalty shop */
  const [loyaltyQty, setLoyaltyQty]                   = useState({});
  const [loyaltyCheckoutOpen, setLoyaltyCheckoutOpen] = useState(false);
  const [loyaltyOrderSuccess, setLoyaltyOrderSuccess] = useState(false);
  const [loyaltyOrderLoading, setLoyaltyOrderLoading] = useState(false);
  const [loyaltyDelivery, setLoyaltyDelivery]         = useState('pickup');
  const [loyaltyAddress, setLoyaltyAddress]           = useState('');

  /* RP Popup */
  const [showRpPopup, setShowRpPopup] = useState(false);
  const [rpName, setRpName]     = useState('');
  const [rpLoading, setRpLoading] = useState(false);

  useEffect(() => {
    const stored = getStoredUser();
    if (!stored) { navigate('/'); return; }
    setUser(stored);
    if (!stored.rpName) setShowRpPopup(true);
    // Load store settings
    fetch(`${BACKEND_URL}/api/settings`)
      .then(r => r.json())
      .then(d => setSettings(d))
      .catch(() => {});
    // Ban check + rp_name sync on mount
    if (stored.discordId) {
      fetch(`${BACKEND_URL}/api/members/check?discord_id=${stored.discordId}`)
        .then(r => r.json())
        .then(d => {
          if (d.banned) { setBanData({ message: d.message }); return; }
          // Si le nom RP a été effacé côté serveur (reset), réafficher le popup
          if (d.rpName === null && stored.rpName) {
            updateStoredUser({ rpName: null });
            setShowRpPopup(true);
          }
          // Sync stats fidélité depuis le serveur
          if (typeof d.loyaltyPoints === 'number') setLoyaltyPoints(d.loyaltyPoints);
          if (typeof d.pendingPoints === 'number') setPendingPoints(d.pendingPoints);
          if (typeof d.totalSpent    === 'number') setTotalSpent(d.totalSpent);
        })
        .catch(() => {});
    }
  }, [navigate]);

  async function handleRpSubmit(e) {
    e.preventDefault();
    if (!rpName.trim()) return;
    setRpLoading(true);
    const trimmed = rpName.trim();
    updateStoredUser({ rpName: trimmed });
    try {
      const res = await fetch(`${BACKEND_URL}/api/members/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ discordId: user.discordId, username: user.username || 'Inconnu', avatarUrl: user.avatarUrl || null, rpName: trimmed }),
      });
      if (res.status === 403) {
        const data = await res.json();
        setBanData({ message: data.message });
        setRpLoading(false);
        return;
      }
    } catch (err) { console.error(err); }
    setUser(getStoredUser());
    setShowRpPopup(false);
    setRpLoading(false);
  }

  function handleLogout() { clearUser(); navigate('/'); }

  /* Cart */
  const cartItems = PRODUCTS.filter(p => (quantities[p.id] || 0) > 0).map(p => ({ ...p, qty: quantities[p.id] }));
  const cartTotal = cartItems.reduce((sum, i) => sum + i.price * i.qty, 0);
  const cartCount = cartItems.reduce((sum, i) => sum + i.qty, 0);

  function changeQty(id, delta) {
    setQuantities(prev => ({ ...prev, [id]: Math.max(0, (prev[id] || 0) + delta) }));
  }

  /* Loyalty cart */
  const loyaltyCartItems = PRODUCTS.filter(p => (loyaltyQty[p.id] || 0) > 0).map(p => ({ ...p, qty: loyaltyQty[p.id] }));
  const loyaltyCost      = loyaltyCartItems.reduce((sum, i) => sum + i.qty * 100, 0);
  const loyaltyCartCount = loyaltyCartItems.reduce((sum, i) => sum + i.qty, 0);

  function changeLoyaltyQty(id, delta) {
    setLoyaltyQty(prev => ({ ...prev, [id]: Math.max(0, (prev[id] || 0) + delta) }));
  }

  async function handleLoyaltyOrder() {
    if (!loyaltyCartItems.length || loyaltyCost > loyaltyPoints) return;
    if (loyaltyDelivery === 'delivery' && !loyaltyAddress.trim()) return;
    setLoyaltyOrderLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/orders/loyalty`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          discordId: user.discordId,
          username: user.username,
          rpName: user.rpName,
          avatarUrl: user.avatarUrl,
          items: loyaltyCartItems.map(i => ({ id: i.id, name: i.name, qty: i.qty })),
          deliveryType: loyaltyDelivery,
          address: loyaltyDelivery === 'delivery' ? loyaltyAddress : null,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        alert(d.error || "Erreur lors de la commande.");
        return;
      }
      const data = await res.json();
      setLoyaltyPoints(prev => prev - data.pointsCost);
      setTotalSpent(prev => prev + data.pointsCost);
      setLoyaltyOrderSuccess(true);
      setTimeout(() => {
        setLoyaltyQty({});
        setLoyaltyCheckoutOpen(false);
        setLoyaltyOrderSuccess(false);
        setLoyaltyAddress('');
        setLoyaltyDelivery('pickup');
      }, 2800);
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'envoi. Réessaie.");
    } finally {
      setLoyaltyOrderLoading(false);
    }
  }

  /* Filtered products */
  const filtered = PRODUCTS.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.strain.toLowerCase().includes(search.toLowerCase()) ||
    p.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
  );

  /* Load my orders */
  /* Fetch unread counts (vendor messages unseen by client) */
  async function fetchUnreadCounts(orders) {
    if (!orders.length) return;
    const seenMap = getSeenMap();
    const orderIds = orders.map(o => o.id);
    const { data } = await supabase
      .from('chat_messages')
      .select('order_id, created_at')
      .neq('sender', 'client')
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
      .channel('client_chat_watch')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
      }, payload => {
        const msg = payload.new;
        if (msg.sender === 'client') return; // own message
        const openId = chatOrderRef.current?.id;
        if (openId === msg.order_id) return; // already viewing this chat
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

  async function loadMyOrders() {
    if (!user) return;
    setOrdersLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/orders/me?discord_id=${user.discordId}`);
      const json = await res.json();
      const orders = json.orders || [];
      setMyOrders(orders);
      fetchUnreadCounts(orders);
    } catch (e) { console.error(e); }
    finally { setOrdersLoading(false); }
  }

  function handleTabChange(tab) {
    setActiveTab(tab);
    if (tab === 'orders') loadMyOrders();
  }

  async function handleOrder() {
    if (!cartItems.length) return;
    if (deliveryType === 'delivery' && !address.trim()) return;
    setOrderLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          discordId: user.discordId,
          username: user.username,
          rpName: user.rpName,
          avatarUrl: user.avatarUrl,
          items: cartItems.map(i => ({ id: i.id, name: i.name, qty: i.qty, price: i.price })),
          total: cartTotal,
          deliveryType,
          address: deliveryType === 'delivery' ? address : null,
          notes: orderNotes || null,
        }),
      });
      if (!res.ok) throw new Error('Order failed');
      setPendingPoints(prev => prev + cartTotal); // pts en attente jusqu'à la remise
      setOrderSuccess(true);
      setTimeout(() => {
        setQuantities({});
        setCheckoutOpen(false);
        setOrderSuccess(false);
        setOrderNotes('');
        setAddress('');
        setDeliveryType('pickup');
      }, 2800);
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'envoi de la commande. Réessaie.");
    } finally {
      setOrderLoading(false);
    }
  }

  if (!user) return null;

  if (banData) {
    return (
      <div className={s.banScreen}>
        <img src={LOGO} alt="Purple CBD" className={s.banLogo} />

        <h1 className={s.banTitle}>Compte suspendu</h1>
        <p className={s.banMessage}>{banData.message || "Votre compte a été banni. Contactez l'administration."}</p>
        <button className={s.banLogoutBtn} onClick={handleLogout}>Se déconnecter</button>
      </div>
    );
  }

  const displayName = user.rpName || user.username || 'Client';
  const avatar = user.avatarUrl;

  /* Order stats */
  const orderStats = {
    total:     myOrders.length,
    spent:     myOrders.filter(o => o.order_type !== 'loyalty').reduce((s, o) => s + (o.total || 0), 0),
    active:    myOrders.filter(o => !['delivered', 'picked_up', 'cancelled'].includes(o.status)).length,
    delivered: myOrders.filter(o => o.status === 'delivered' || o.status === 'picked_up').length,
    cancelled: myOrders.filter(o => o.status === 'cancelled').length,
    favorite:  (() => {
      const counts = {};
      myOrders.forEach(o => (o.items || []).forEach(i => { counts[i.name] = (counts[i.name] || 0) + i.qty; }));
      return Object.entries(counts).sort(([,a],[,b]) => b - a)[0]?.[0] || null;
    })(),
  };

  return (
    <div className={s.layout}>

      {/* ── Receipt Lightbox ── */}
      {receiptLightbox && (
        <div className={s.receiptLightboxOverlay} onClick={() => setReceiptLightbox(null)}>
          <div className={s.receiptLightboxBox} onClick={e => e.stopPropagation()}>
            <button className={s.receiptLightboxClose} onClick={() => setReceiptLightbox(null)}>✕</button>
            <p className={s.receiptLightboxTitle}>Ticket de caisse</p>
            <img src={receiptLightbox} alt="Ticket de caisse" className={s.receiptLightboxImg} />
            <div className={s.receiptLightboxUrlRow}>
              <input className={s.receiptLightboxUrlInput} value={receiptLightbox} readOnly />
              <button
                className={`${s.receiptLightboxCopyBtn} ${copiedLightbox ? s.receiptLightboxCopyDone : ''}`}
                onClick={async () => {
                  try { await navigator.clipboard.writeText(receiptLightbox); setCopiedLightbox(true); setTimeout(() => setCopiedLightbox(false), 2000); } catch {}
                }}
              >
                {copiedLightbox ? '✓ Copié' : '⎘ Copier'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Chat Modal ── */}
      {chatOrder && (
        <ChatModal
          orderId={chatOrder.id}
          orderRef={chatOrder.id}
          senderType="client"
          senderName={displayName}
          onClose={closeChat}
        />
      )}

      {/* ── RP Popup ── */}
      {showRpPopup && (
        <div className={s.popupOverlay}>
          <div className={s.popup}>
            <div className={s.popupGlow} />
            <img src={LOGO} alt="" className={s.popupLogo} />
            <h2 className={s.popupTitle}>Bienvenue !</h2>
            <p className={s.popupSub}>Avant de continuer, entre ton nom RP</p>
            <form onSubmit={handleRpSubmit} className={s.popupForm}>
              <input type="text" className={s.popupInput} placeholder="Ex: John Smith" value={rpName}
                onChange={e => setRpName(e.target.value)} required autoFocus maxLength={32} />
              <button type="submit" className={s.popupBtn} disabled={rpLoading}>
                {rpLoading ? 'Enregistrement...' : 'Confirmer'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── Sidebar ── */}
      <aside className={s.sidebar}>
        <div className={s.sidebarTop}>
          <Link to="/" className={s.logoLink}>
            <img src={LOGO} alt="Purple CBD" className={s.logo} />
            <span className={s.logoName}>Purple CBD</span>
          </Link>
          <nav className={s.nav}>
            <span className={s.navLabel}>Espace Client</span>
            <button className={`${s.navItem} ${activeTab === 'shop' ? s.navItemActive : ''}`} onClick={() => handleTabChange('shop')}>
              <ShopIcon /> Commander
              {cartCount > 0 && <span className={s.cartBadge}>{cartCount}</span>}
            </button>
            <button className={`${s.navItem} ${activeTab === 'orders' ? s.navItemActive : ''}`} onClick={() => handleTabChange('orders')}>
              <OrdersIcon /> Mes Commandes
            </button>
            <button className={`${s.navItem} ${activeTab === 'loyalty' ? s.navItemActive : ''}`} onClick={() => handleTabChange('loyalty')}>
              <StarIcon /> Fidélité
            </button>
          </nav>
        </div>
        <div className={s.sidebarBottom}>
          <div className={s.userCard}>
            {avatar ? <img src={avatar} alt="" className={s.userAvatar} /> : <div className={s.userAvatarFallback}>{displayName[0].toUpperCase()}</div>}
            <div className={s.userInfo}>
              <span className={s.userName}>{displayName}</span>
              <span className={s.userRole}>Client</span>
            </div>
          </div>
          <button className={s.logoutBtn} onClick={handleLogout}><LogoutIcon /> Déconnexion</button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className={s.main}>

        {/* ── Shop ── */}
        {activeTab === 'shop' && (
          <div className={s.shopView}>
            <div className={s.shopHeader}>
              <h1 className={s.shopTitle}>Commander</h1>
              <p className={s.shopSub}>Sélectionne tes produits, le panier s'affiche en bas</p>
            </div>

            {/* Search */}
            <div className={s.searchBar}>
              <span className={s.searchIcon}><SearchIcon /></span>
              <input
                type="text"
                className={s.searchInput}
                placeholder="Rechercher un produit, une variété, un effet..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {search && <button className={s.searchClear} onClick={() => setSearch('')}><CloseIcon /></button>}
            </div>

            {/* Product list */}
            <div className={s.productList}>
              {filtered.length === 0 && (
                <div className={s.noResults}>Aucun produit ne correspond à "{search}"</div>
              )}
              {filtered.map(p => {
                const qty = quantities[p.id] || 0;
                return (
                  <div key={p.id} className={s.productRow}>
                    {/* Image placeholder */}
                    <div className={s.productImg}>
                      <ImageIcon />
                    </div>

                    {/* Info */}
                    <div className={s.productInfo}>
                      <div className={s.productNameRow}>
                        <span className={s.productName}>{p.name}</span>
                        <span className={s.productBadge}>{p.badge}</span>
                      </div>
                      <span className={s.productStrain}>{p.strain}</span>
                      <div className={s.productTags}>
                        {p.tags.map(t => <span key={t} className={s.productTag}>{t}</span>)}
                      </div>
                    </div>

                    {/* Price + qty */}
                    <div className={s.productActions}>
                      <span className={s.productPrice}>${p.price}</span>
                      {qty === 0 ? (
                        <button className={s.addBtn} onClick={() => changeQty(p.id, 1)}>Ajouter</button>
                      ) : (
                        <div className={s.qtyControl}>
                          <button className={s.qtyBtn} onClick={() => changeQty(p.id, -1)}><MinusIcon /></button>
                          <span className={s.qtyNum}>{qty}</span>
                          <button className={s.qtyBtn} onClick={() => changeQty(p.id, 1)}><PlusIcon /></button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Mes Commandes ── */}
        {activeTab === 'orders' && (
          <div className={s.ordersView}>
            <div className={s.shopHeader}>
              <h1 className={s.shopTitle}>Mes Commandes</h1>
              <p className={s.shopSub}>Historique et suivi de tes commandes</p>
            </div>
            {ordersLoading ? (
              <div className={s.stateMsg}>Chargement...</div>
            ) : myOrders.length === 0 ? (
              <div className={s.emptyOrders}>
                <div className={s.emptyIcon}><OrdersIcon /></div>
                <p className={s.emptyText}>Aucune commande pour l'instant</p>
                <button className={s.emptyBtn} onClick={() => setActiveTab('shop')}>Passer une commande</button>
              </div>
            ) : (
              <div className={s.ordersLayout}>
                {/* Orders list */}
                <div className={s.ordersList}>
                  {myOrders.map(order => {
                    const isPhysical = order.order_type === 'physical';
                    const st = STATUS_LABELS[order.status] || STATUS_LABELS.pending;
                    return (
                      <div key={order.id} className={`${s.orderCard} ${isPhysical ? s.orderCardPhysical : ''}`}>
                        <div className={s.orderCardHeader}>
                          <div className={s.orderMeta}>
                            <span className={s.orderId}>#{order.id.slice(-6).toUpperCase()}</span>
                            {isPhysical && (
                              <span className={s.physicalBadge}>🏪 Vente Physique</span>
                            )}
                            <span className={s.orderDate}>{new Date(order.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                          </div>
                          <span className={s.orderStatus} style={{ color: st.color, borderColor: st.color + '33', background: st.color + '14' }}>
                            {st.label}
                          </span>
                        </div>
                        <div className={s.orderItems}>
                          {(order.items || []).map((item, i) => (
                            <span key={i} className={s.orderItem}>{item.name} ×{item.qty}</span>
                          ))}
                        </div>
                        <div className={s.orderFooter}>
                          {isPhysical ? (
                            <span className={s.orderType}>
                              🧑‍💼 Vendeur : {order.vendor_name || 'Équipe Purple CBD'}
                            </span>
                          ) : (
                            <span className={s.orderType}>
                              {order.delivery_type === 'delivery' ? <><TruckIcon /> Livraison</> : <><StoreIcon /> Retrait en magasin</>}
                            </span>
                          )}
                          <div className={s.orderFooterRight}>
                            <span className={s.orderTotal}>${order.total}</span>
                            {isPhysical && order.receipt_url && (
                              <button className={s.receiptBtn} onClick={() => setReceiptLightbox(order.receipt_url)}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="9" y1="7" x2="15" y2="7"/><line x1="9" y1="11" x2="15" y2="11"/><line x1="9" y1="15" x2="13" y2="15"/></svg>
                                Ticket
                              </button>
                            )}
                            {!isPhysical && (
                              <button
                                className={`${s.orderChatBtn} ${unreadCounts[order.id] ? s.orderChatBtnUnread : ''}`}
                                onClick={() => openChat(order.id)}
                              >
                                {unreadCounts[order.id] ? <span className={s.chatUnreadDot} /> : null}
                                <ChatIcon /> Chat
                                {unreadCounts[order.id] > 0 && (
                                  <span style={{ fontSize: '10px', fontWeight: 700, marginLeft: 2 }}>
                                    {unreadCounts[order.id]}
                                  </span>
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Stats panel */}
                <div className={s.statsPanel}>
                  <h3 className={s.statsPanelTitle}>Statistiques</h3>

                  <div className={s.statItem}>
                    <span className={s.statItemNum}>{orderStats.total}</span>
                    <span className={s.statItemLabel}>Commandes passées</span>
                  </div>

                  <div className={s.statItem}>
                    <span className={s.statItemNum}>${orderStats.spent}</span>
                    <span className={s.statItemLabel}>Total dépensé</span>
                  </div>

                  <div className={s.statItem}>
                    <span className={s.statItemNum} style={{ color: '#f59e0b' }}>{orderStats.active}</span>
                    <span className={s.statItemLabel}>En cours</span>
                  </div>

                  <div className={s.statItem}>
                    <span className={s.statItemNum} style={{ color: '#10b981' }}>{orderStats.delivered}</span>
                    <span className={s.statItemLabel}>Complétées</span>
                  </div>

                  {orderStats.cancelled > 0 && (
                    <div className={s.statItem}>
                      <span className={s.statItemNum} style={{ color: '#ef4444' }}>{orderStats.cancelled}</span>
                      <span className={s.statItemLabel}>Annulées</span>
                    </div>
                  )}

                  {orderStats.favorite && (
                    <div className={s.statFavorite}>
                      <span className={s.statFavLabel}>Produit favori</span>
                      <span className={s.statFavName}>{orderStats.favorite}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Fidélité ── */}
        {activeTab === 'loyalty' && (
          <div className={s.shopView}>
            <div className={s.shopHeader}>
              <h1 className={s.shopTitle}>Boutique Fidélité</h1>
              <p className={s.shopSub}>Échange tes points contre des produits — 100 pts par article</p>
            </div>

            {/* Stats bar */}
            <div className={s.loyaltyStatsBar}>
              <div className={s.loyaltyStat}>
                <span className={s.loyaltyStatNum}>{loyaltyPoints}</span>
                <span className={s.loyaltyStatLabel}>Points disponibles</span>
              </div>
              <div className={s.loyaltyStat}>
                <span className={s.loyaltyStatNum} style={{ color: '#f59e0b' }}>{pendingPoints}</span>
                <span className={s.loyaltyStatLabel}>En attente</span>
              </div>
              <div className={s.loyaltyStat}>
                <span className={s.loyaltyStatNum} style={{ color: '#6b7280' }}>{totalSpent}</span>
                <span className={s.loyaltyStatLabel}>Dépensés au total</span>
              </div>
            </div>

            {/* Product list */}
            <div className={s.productList}>
              {PRODUCTS.map(p => {
                const qty = loyaltyQty[p.id] || 0;
                return (
                  <div key={p.id} className={s.productRow}>
                    <div className={s.productImg}><ImageIcon /></div>
                    <div className={s.productInfo}>
                      <div className={s.productNameRow}>
                        <span className={s.productName}>{p.name}</span>
                        <span className={s.productBadge}>{p.badge}</span>
                      </div>
                      <span className={s.productStrain}>{p.strain}</span>
                      <div className={s.productTags}>
                        {p.tags.map(t => <span key={t} className={s.productTag}>{t}</span>)}
                      </div>
                    </div>
                    <div className={s.productActions}>
                      <span className={s.loyaltyPrice}>100 pts</span>
                      {qty === 0 ? (
                        <button className={s.addBtn} onClick={() => changeLoyaltyQty(p.id, 1)}>Ajouter</button>
                      ) : (
                        <div className={s.qtyControl}>
                          <button className={s.qtyBtn} onClick={() => changeLoyaltyQty(p.id, -1)}><MinusIcon /></button>
                          <span className={s.qtyNum}>{qty}</span>
                          <button className={s.qtyBtn} onClick={() => changeLoyaltyQty(p.id, 1)}><PlusIcon /></button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* ── Loyalty Cart Bar ── */}
      {activeTab === 'loyalty' && loyaltyCartCount > 0 && !loyaltyCheckoutOpen && (
        <div className={s.cartBar}>
          <div className={s.cartBarLeft}>
            <span className={s.cartBarIcon}><StarIcon /></span>
            <span className={s.cartBarCount}>{loyaltyCartCount} article{loyaltyCartCount > 1 ? 's' : ''}</span>
            <span className={s.cartBarItems}>{loyaltyCartItems.map(i => `${i.name} ×${i.qty}`).join(' · ')}</span>
          </div>
          <div className={s.cartBarRight}>
            <span className={s.cartBarTotal} style={{ color: loyaltyCost > loyaltyPoints ? '#ef4444' : '#8b5cf6' }}>{loyaltyCost} pts</span>
            <button
              className={s.cartBarBtn}
              onClick={() => setLoyaltyCheckoutOpen(true)}
              disabled={loyaltyCost > loyaltyPoints}
            >{loyaltyCost > loyaltyPoints ? `Solde insuffisant (manque ${loyaltyCost - loyaltyPoints} pts)` : 'Échanger les points →'}</button>
          </div>
        </div>
      )}

      {/* ── Cart Bar ── */}
      {activeTab !== 'loyalty' && cartCount > 0 && !checkoutOpen && (
        <div className={s.cartBar}>
          <div className={s.cartBarLeft}>
            <span className={s.cartBarIcon}><CartIcon /></span>
            <span className={s.cartBarCount}>{cartCount} article{cartCount > 1 ? 's' : ''}</span>
            <span className={s.cartBarItems}>{cartItems.map(i => `${i.name} ×${i.qty}`).join(' · ')}</span>
          </div>
          <div className={s.cartBarRight}>
            <span className={s.cartBarTotal}>${cartTotal}</span>
            <button className={s.cartBarBtn} onClick={() => setCheckoutOpen(true)}>Passer la commande →</button>
          </div>
        </div>
      )}

      {/* ── Checkout Drawer ── */}
      {checkoutOpen && (
        <div className={s.checkoutOverlay} onClick={e => { if (e.target === e.currentTarget && !orderLoading) setCheckoutOpen(false); }}>
          <div className={s.checkoutDrawer}>
            {orderSuccess ? (
              <div className={s.successView}>
                <div className={s.successIcon}><CheckIcon /></div>
                <h2 className={s.successTitle}>Commande envoyée !</h2>
                <p className={s.successSub}>Tu seras contacté très prochainement.</p>
              </div>
            ) : (
              <>
                <div className={s.checkoutHeader}>
                  <h2 className={s.checkoutTitle}>Récapitulatif</h2>
                  <button className={s.checkoutClose} onClick={() => setCheckoutOpen(false)} disabled={orderLoading}><CloseIcon /></button>
                </div>

                {/* Items */}
                <div className={s.checkoutItems}>
                  {cartItems.map(item => (
                    <div key={item.id} className={s.checkoutItem}>
                      <div className={s.checkoutItemName}>{item.name}</div>
                      <div className={s.checkoutItemQty}>×{item.qty}</div>
                      <div className={s.checkoutItemPrice}>${item.price * item.qty}</div>
                    </div>
                  ))}
                </div>
                <div className={s.checkoutTotal}>
                  <span>Total</span>
                  <span className={s.checkoutTotalAmt}>${cartTotal}</span>
                </div>

                {/* Points à gagner */}
                <div className={s.loyaltyEarnNotice}>
                  <StarIcon />
                  <span>Tu gagneras <strong>{cartTotal} pts</strong> crédités à la livraison / au retrait</span>
                </div>

                {/* Payment notice */}
                <div className={s.paymentNotice}>
                  <span className={s.paymentNoticeIcon}><CardIcon /></span>
                  <div>
                    <div className={s.paymentNoticeTitle}>Paiement à la réception</div>
                    <div className={s.paymentNoticeSub}>Aucun paiement en ligne — tu règles à la livraison ou au retrait.</div>
                  </div>
                </div>

                {/* Delivery type */}
                <div className={s.deliverySection}>
                  <span className={s.deliveryLabel}>Mode de retrait</span>
                  <div className={s.deliveryOptions}>
                    <button
                      className={`${s.deliveryOption} ${deliveryType === 'pickup' ? s.deliveryOptionActive : ''}`}
                      onClick={() => setDeliveryType('pickup')}
                    >
                      <StoreIcon />
                      <div>
                        <div className={s.deliveryOptionTitle}>Retrait en magasin</div>
                        <div className={s.deliveryOptionSub}>Disponible dès que ta commande est prête</div>
                      </div>
                    </button>
                    <button
                      className={`${s.deliveryOption} ${deliveryType === 'delivery' ? s.deliveryOptionActive : ''} ${!settings.delivery_enabled ? s.deliveryOptionDisabled : ''}`}
                      onClick={() => settings.delivery_enabled && setDeliveryType('delivery')}
                      disabled={!settings.delivery_enabled}
                    >
                      <TruckIcon />
                      <div>
                        <div className={s.deliveryOptionTitle}>
                          Livraison à domicile
                          {!settings.delivery_enabled && <span className={s.soonBadge}>Bientôt disponible</span>}
                        </div>
                        <div className={s.deliveryOptionSub}>{settings.delivery_enabled ? 'Livraison directement chez toi' : 'Disponible à l\'ouverture'}</div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Address field (delivery only) */}
                {deliveryType === 'delivery' && (
                  <div className={s.checkoutField}>
                    <label className={s.checkoutLabel}>Adresse de livraison</label>
                    <input
                      type="text"
                      className={s.checkoutInput}
                      placeholder="Rue, numéro, ville..."
                      value={address}
                      onChange={e => setAddress(e.target.value)}
                      required
                    />
                  </div>
                )}

                {/* Store closed warning (pickup) */}
                {deliveryType === 'pickup' && !settings.store_open && (
                  <div className={s.storeClosedWarn}>
                    <span className={s.warnIcon}><WarnIcon /></span>
                    <span>Le magasin est actuellement fermé. Ta commande sera préparée dès la réouverture.</span>
                  </div>
                )}

                {/* Notes */}
                <div className={s.checkoutField}>
                  <label className={s.checkoutLabel}>Notes (facultatif)</label>
                  <textarea className={s.checkoutTextarea} placeholder="Remarques particulières..." value={orderNotes} onChange={e => setOrderNotes(e.target.value)} rows={2} />
                </div>

                <button className={s.checkoutBtn} onClick={handleOrder} disabled={orderLoading || (deliveryType === 'delivery' && !address.trim())}>
                  {orderLoading ? 'Envoi en cours...' : `Confirmer la commande · $${cartTotal}`}
                </button>
              </>
            )}
          </div>
        </div>
      )}
      {/* ── Loyalty Checkout Drawer ── */}
      {loyaltyCheckoutOpen && (
        <div className={s.checkoutOverlay} onClick={e => { if (e.target === e.currentTarget && !loyaltyOrderLoading) setLoyaltyCheckoutOpen(false); }}>
          <div className={s.checkoutDrawer}>
            {loyaltyOrderSuccess ? (
              <div className={s.successView}>
                <div className={s.successIcon}><CheckIcon /></div>
                <h2 className={s.successTitle}>Commande envoyée !</h2>
                <p className={s.successSub}>{loyaltyCost} pts ont été déduits de ton solde.</p>
              </div>
            ) : (
              <>
                <div className={s.checkoutHeader}>
                  <h2 className={s.checkoutTitle}>Récapitulatif fidélité</h2>
                  <button className={s.checkoutClose} onClick={() => setLoyaltyCheckoutOpen(false)} disabled={loyaltyOrderLoading}><CloseIcon /></button>
                </div>

                <div className={s.checkoutItems}>
                  {loyaltyCartItems.map(item => (
                    <div key={item.id} className={s.checkoutItem}>
                      <div className={s.checkoutItemName}>{item.name}</div>
                      <div className={s.checkoutItemQty}>×{item.qty}</div>
                      <div className={s.checkoutItemPrice}>{item.qty * 100} pts</div>
                    </div>
                  ))}
                </div>

                <div className={s.checkoutTotal}>
                  <span>Total</span>
                  <span className={s.checkoutTotalAmt} style={{ color: '#8b5cf6' }}>{loyaltyCost} pts</span>
                </div>
                <div className={s.loyaltyBalanceRow}>
                  <span>Solde disponible</span>
                  <span style={{ color: loyaltyCost > loyaltyPoints ? '#ef4444' : '#10b981', fontWeight: 600 }}>{loyaltyPoints} pts</span>
                </div>
                {loyaltyCost > loyaltyPoints && (
                  <div className={s.loyaltyInsufficient}>
                    Solde insuffisant — il te manque {loyaltyCost - loyaltyPoints} pts
                  </div>
                )}

                <div className={s.deliverySection}>
                  <span className={s.deliveryLabel}>Mode de retrait</span>
                  <div className={s.deliveryOptions}>
                    <button className={`${s.deliveryOption} ${loyaltyDelivery === 'pickup' ? s.deliveryOptionActive : ''}`} onClick={() => setLoyaltyDelivery('pickup')}>
                      <StoreIcon />
                      <div>
                        <div className={s.deliveryOptionTitle}>Retrait en magasin</div>
                        <div className={s.deliveryOptionSub}>Disponible dès que ta commande est prête</div>
                      </div>
                    </button>
                    <button
                      className={`${s.deliveryOption} ${loyaltyDelivery === 'delivery' ? s.deliveryOptionActive : ''} ${!settings.delivery_enabled ? s.deliveryOptionDisabled : ''}`}
                      onClick={() => settings.delivery_enabled && setLoyaltyDelivery('delivery')}
                      disabled={!settings.delivery_enabled}
                    >
                      <TruckIcon />
                      <div>
                        <div className={s.deliveryOptionTitle}>
                          Livraison à domicile
                          {!settings.delivery_enabled && <span className={s.soonBadge}>Bientôt</span>}
                        </div>
                        <div className={s.deliveryOptionSub}>{settings.delivery_enabled ? 'Livraison directement chez toi' : 'Disponible à l\'ouverture'}</div>
                      </div>
                    </button>
                  </div>
                </div>

                {loyaltyDelivery === 'delivery' && (
                  <div className={s.checkoutField}>
                    <label className={s.checkoutLabel}>Adresse de livraison</label>
                    <input type="text" className={s.checkoutInput} placeholder="Rue, numéro, ville..." value={loyaltyAddress} onChange={e => setLoyaltyAddress(e.target.value)} required />
                  </div>
                )}

                <button
                  className={s.checkoutBtn}
                  onClick={handleLoyaltyOrder}
                  disabled={loyaltyOrderLoading || loyaltyCost > loyaltyPoints || (loyaltyDelivery === 'delivery' && !loyaltyAddress.trim())}
                >
                  {loyaltyOrderLoading ? 'Envoi en cours...' : `Confirmer · ${loyaltyCost} pts`}
                </button>
              </>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
