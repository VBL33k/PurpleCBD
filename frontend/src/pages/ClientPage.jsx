import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getStoredUser, clearUser, updateStoredUser } from '../lib/discordAuth';
import s from './ClientPage.module.css';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://purplecbd.onrender.com';
const LOGO = 'https://i.imgur.com/CbcU0Qp.png';

const PRODUCTS = [
  {
    id: 1, name: 'Purple Haze', strain: 'Sativa Dominante', badge: 'Signature', number: '01',
    price: 150, theme: 'purple',
    tags: ['Créatif', 'Euphorisant', 'Baies Sauvages', 'Diurne'],
    desc: "Des notes de baies sauvages et de fruits sombres s'épanouissent en un boost créatif d'une rare intensité.",
  },
  {
    id: 2, name: 'OG Kush', strain: 'Indica Dominante', badge: 'VIP Select', number: '02',
    price: 150, theme: 'deep',
    tags: ['Relaxation', 'Intense', 'Terreux', 'Nocturne'],
    desc: "Un arôme terreux, boisé, aux accents de pin et d'épices. Une relaxation d'une profondeur VIP.",
  },
  {
    id: 3, name: 'Lemon Haze', strain: 'Sativa Pure', badge: 'Fresh Cut', number: '03',
    price: 150, theme: 'light',
    tags: ['Énergie', 'Focus', 'Citronné', 'Productivité'],
    desc: "Une fraîcheur citronnée vive et pétillante qui ouvre les sens et affine la concentration.",
  },
  {
    id: 4, name: 'Dark Devil', strain: 'Hybrid Exclusive', badge: 'Ultra Rare', number: '04',
    price: 150, theme: 'dark',
    tags: ['Exclusif', 'Encens', 'Sucré', 'Prestige'],
    desc: "La pièce maîtresse. Des teintes anthracite et améthyste, un goût sucré d'encens qui enveloppe.",
  },
];

/* ── Icons ── */
function ShopIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>;
}
function OrdersIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>;
}
function StarIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
}
function LogoutIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
}
function PlusIcon() {
  return <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
}
function MinusIcon() {
  return <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>;
}
function CartIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg>;
}
function CloseIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
}
function CheckIcon() {
  return <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
}

const THEME_CLASS = { purple: s.themePurple, deep: s.themeDeep, light: s.themeLight, dark: s.themeDark };

export default function ClientPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('shop');
  const [quantities, setQuantities] = useState({});
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [orderNotes, setOrderNotes] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);

  /* RP Popup */
  const [showRpPopup, setShowRpPopup] = useState(false);
  const [rpName, setRpName] = useState('');
  const [rpLoading, setRpLoading] = useState(false);

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
    const trimmed = rpName.trim();
    updateStoredUser({ rpName: trimmed });
    try {
      await fetch(`${BACKEND_URL}/api/members/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ discordId: user.discordId, username: user.username || 'Inconnu', avatarUrl: user.avatarUrl || null, rpName: trimmed }),
      });
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

  async function handleOrder() {
    if (!cartItems.length) return;
    setOrderLoading(true);
    // TODO: POST /api/orders quand l'endpoint sera prêt
    await new Promise(r => setTimeout(r, 1200));
    setOrderSuccess(true);
    setOrderLoading(false);
    setTimeout(() => {
      setQuantities({});
      setCheckoutOpen(false);
      setOrderSuccess(false);
      setOrderNotes('');
    }, 2800);
  }

  if (!user) return null;

  const displayName = user.rpName || user.username || 'Client';
  const avatar = user.avatarUrl;

  return (
    <div className={s.layout}>

      {/* ── RP Popup ── */}
      {showRpPopup && (
        <div className={s.popupOverlay}>
          <div className={s.popup}>
            <div className={s.popupGlow} />
            <img src={LOGO} alt="" className={s.popupLogo} />
            <h2 className={s.popupTitle}>Bienvenue !</h2>
            <p className={s.popupSub}>Avant de continuer, entre ton nom RP</p>
            <form onSubmit={handleRpSubmit} className={s.popupForm}>
              <input type="text" className={s.popupInput} placeholder="Ex: John Smith" value={rpName} onChange={e => setRpName(e.target.value)} required autoFocus maxLength={32} />
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

            <button
              className={`${s.navItem} ${activeTab === 'shop' ? s.navItemActive : ''}`}
              onClick={() => setActiveTab('shop')}
            >
              <ShopIcon /> Commander
              {cartCount > 0 && <span className={s.cartBadge}>{cartCount}</span>}
            </button>

            <button
              className={`${s.navItem} ${activeTab === 'orders' ? s.navItemActive : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              <OrdersIcon /> Mes Commandes
            </button>

            <button
              className={`${s.navItem} ${activeTab === 'loyalty' ? s.navItemActive : ''}`}
              onClick={() => setActiveTab('loyalty')}
            >
              <StarIcon /> Fidélité
            </button>
          </nav>
        </div>

        <div className={s.sidebarBottom}>
          <div className={s.userCard}>
            {avatar
              ? <img src={avatar} alt="" className={s.userAvatar} />
              : <div className={s.userAvatarFallback}>{displayName[0].toUpperCase()}</div>
            }
            <div className={s.userInfo}>
              <span className={s.userName}>{displayName}</span>
              <span className={s.userRole}>Client</span>
            </div>
          </div>
          <button className={s.logoutBtn} onClick={handleLogout}>
            <LogoutIcon /> Déconnexion
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className={s.main}>

        {/* ── Shop ── */}
        {activeTab === 'shop' && (
          <div className={s.shopView}>
            <div className={s.shopHeader}>
              <span className={s.shopLabel}>COLLECTION EXCLUSIVE</span>
              <h1 className={s.shopTitle}>Commander</h1>
              <p className={s.shopSub}>Sélectionne tes produits et passe ta commande en quelques secondes</p>
            </div>

            <div className={s.productGrid}>
              {PRODUCTS.map(p => {
                const qty = quantities[p.id] || 0;
                return (
                  <div key={p.id} className={`${s.productCard} ${THEME_CLASS[p.theme]}`}>
                    <div className={s.cardTopRow}>
                      <span className={s.cardNumber}>{p.number}</span>
                      <span className={s.cardBadge}>{p.badge}</span>
                    </div>
                    <h3 className={s.cardName}>{p.name}</h3>
                    <p className={s.cardStrain}>{p.strain}</p>
                    <p className={s.cardDesc}>{p.desc}</p>
                    <div className={s.cardTags}>
                      {p.tags.map(t => <span key={t} className={s.cardTag}>{t}</span>)}
                    </div>
                    <div className={s.cardFooter}>
                      <span className={s.cardPrice}>${p.price}</span>
                      {qty === 0 ? (
                        <button className={s.addBtn} onClick={() => changeQty(p.id, 1)}>Ajouter</button>
                      ) : (
                        <div className={s.qtyControl}>
                          <button className={s.qtyBtn} onClick={() => changeQty(p.id, -1)} aria-label="Retirer"><MinusIcon /></button>
                          <span className={s.qtyNum}>{qty}</span>
                          <button className={s.qtyBtn} onClick={() => changeQty(p.id, 1)} aria-label="Ajouter"><PlusIcon /></button>
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
          <div className={s.centeredView}>
            <div className={s.emptyIcon}><OrdersIcon /></div>
            <h2 className={s.emptyTitle}>Mes Commandes</h2>
            <p className={s.emptySub}>L'historique de tes commandes sera disponible prochainement.</p>
            <span className={s.emptyBadge}>Bientôt</span>
          </div>
        )}

        {/* ── Fidélité ── */}
        {activeTab === 'loyalty' && (
          <div className={s.centeredView}>
            <div className={s.loyaltyCard}>
              <div className={s.loyaltyPoints}>
                <span className={s.loyaltyNum}>0</span>
                <span className={s.loyaltyUnit}>pts</span>
              </div>
              <h2 className={s.loyaltyTitle}>Points de Fidélité</h2>
              <p className={s.loyaltySub}>
                Gagne des points à chaque commande et débloque des récompenses exclusives réservées à nos membres.
              </p>
              <span className={s.emptyBadge}>Bientôt</span>
            </div>
          </div>
        )}
      </main>

      {/* ── Cart Bar ── */}
      {cartCount > 0 && !checkoutOpen && (
        <div className={s.cartBar}>
          <div className={s.cartBarLeft}>
            <span className={s.cartBarIcon}><CartIcon /></span>
            <span className={s.cartBarCount}>{cartCount} article{cartCount > 1 ? 's' : ''}</span>
            <span className={s.cartBarItems}>{cartItems.map(i => `${i.name} ×${i.qty}`).join(' · ')}</span>
          </div>
          <div className={s.cartBarRight}>
            <span className={s.cartBarTotal}>${cartTotal}</span>
            <button className={s.cartBarBtn} onClick={() => setCheckoutOpen(true)}>
              Passer la commande →
            </button>
          </div>
        </div>
      )}

      {/* ── Checkout Drawer ── */}
      {checkoutOpen && (
        <div
          className={s.checkoutOverlay}
          onClick={e => { if (e.target === e.currentTarget && !orderLoading) setCheckoutOpen(false); }}
        >
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
                  <button className={s.checkoutClose} onClick={() => setCheckoutOpen(false)} disabled={orderLoading}>
                    <CloseIcon />
                  </button>
                </div>

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

                <div className={s.checkoutNotes}>
                  <label className={s.checkoutLabel}>Notes / instructions de livraison</label>
                  <textarea
                    className={s.checkoutTextarea}
                    placeholder="Adresse, créneau horaire, remarques particulières..."
                    value={orderNotes}
                    onChange={e => setOrderNotes(e.target.value)}
                    rows={3}
                  />
                </div>

                <button className={s.checkoutBtn} onClick={handleOrder} disabled={orderLoading}>
                  {orderLoading ? 'Envoi en cours...' : `Confirmer la commande · $${cartTotal}`}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
