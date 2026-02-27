import { useEffect, useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import ChatModal from '../components/Modal/ChatModal';
import PhysicalSaleModal from '../components/Modal/PhysicalSaleModal';
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
function SalesIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
      <line x1="3" y1="6" x2="21" y2="6"/>
      <path d="M16 10a4 4 0 01-8 0"/>
    </svg>
  );
}
function ExternalLinkIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
      <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
    </svg>
  );
}
function CatalogueIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="7" height="7" rx="1"/><rect x="15" y="3" width="7" height="7" rx="1"/>
      <rect x="2" y="14" width="7" height="7" rx="1"/><rect x="15" y="14" width="7" height="7" rx="1"/>
    </svg>
  );
}
function ImgIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
      <polyline points="21 15 16 10 5 21"/>
    </svg>
  );
}

/* ── Chart Components ── */

function RevenueChart({ orders, sales }) {
  const days = 14;
  const now = new Date();
  const buckets = Array.from({ length: days }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (days - 1 - i));
    d.setHours(0, 0, 0, 0);
    return { date: d, label: d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }), total: 0 };
  });

  [...orders, ...sales].forEach(item => {
    const d = new Date(item.created_at);
    d.setHours(0, 0, 0, 0);
    const bucket = buckets.find(b => b.date.getTime() === d.getTime());
    if (bucket) bucket.total += item.total || 0;
  });

  const maxVal = Math.max(...buckets.map(b => b.total), 1);
  const W = 560, H = 140, PL = 38, PR = 8, PT = 14, PB = 24;
  const cw = W - PL - PR, ch = H - PT - PB;

  const pts = buckets.map((b, i) => ({
    x: +(PL + (i / (days - 1)) * cw).toFixed(1),
    y: +(PT + ch - (b.total / maxVal) * ch).toFixed(1),
    total: b.total, label: b.label,
  }));

  const polyline = pts.map(p => `${p.x},${p.y}`).join(' ');
  const fillPath = `M${pts[0].x},${PT + ch} ` +
    pts.map(p => `L${p.x},${p.y}`).join(' ') +
    ` L${pts[pts.length - 1].x},${PT + ch} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block', overflow: 'visible' }}>
      <defs>
        <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 0.5, 1].map((t, i) => (
        <g key={i}>
          <line x1={PL} y1={+(PT + ch * (1 - t)).toFixed(1)} x2={PL + cw} y2={+(PT + ch * (1 - t)).toFixed(1)}
            stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
          <text x={PL - 5} y={+(PT + ch * (1 - t) + 3.5).toFixed(1)}
            textAnchor="end" fontSize="8" fill="rgba(255,255,255,0.28)">
            ${Math.round(maxVal * t)}
          </text>
        </g>
      ))}
      <path d={fillPath} fill="url(#revGrad)" />
      <polyline points={polyline} fill="none" stroke="#8b5cf6" strokeWidth="2"
        strokeLinejoin="round" strokeLinecap="round" />
      {pts.filter(p => p.total > 0).map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3" fill="#8b5cf6"
          stroke="rgba(10,5,20,0.9)" strokeWidth="1.5" />
      ))}
      {pts.filter((_, i) => i % 2 === 0).map((p, i) => (
        <text key={i} x={p.x} y={H - 4} textAnchor="middle"
          fontSize="7.5" fill="rgba(255,255,255,0.25)">{p.label}</text>
      ))}
    </svg>
  );
}

function StatusChart({ orders }) {
  const defs = [
    { key: 'pending',   label: 'En attente', color: '#f59e0b' },
    { key: 'ready',     label: 'Prête',      color: '#06b6d4' },
    { key: 'delivered', label: 'Livrée',     color: '#10b981' },
    { key: 'picked_up', label: 'Retirée',    color: '#8b5cf6' },
    { key: 'cancelled', label: 'Annulée',    color: '#ef4444' },
  ];
  const counts = defs.map(d => ({ ...d, count: orders.filter(o => o.status === d.key).length }));
  const max = Math.max(...counts.map(c => c.count), 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {counts.map(c => (
        <div key={c.key}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{c.label}</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: c.color }}>{c.count}</span>
          </div>
          <div style={{ height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.07)' }}>
            <div style={{
              width: `${(c.count / max) * 100}%`, height: '100%', background: c.color,
              borderRadius: 3, transition: 'width 0.6s ease', minWidth: c.count > 0 ? 5 : 0,
            }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function TopProductsChart({ orders, sales }) {
  const counts = {};
  [...orders, ...sales].forEach(item => {
    (item.items || []).forEach(p => { counts[p.name] = (counts[p.name] || 0) + (p.qty || 1); });
  });
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const maxQty = sorted[0]?.[1] || 1;
  const colors = ['#8b5cf6', '#a78bfa', '#7c3aed', '#c4b5fd', '#6d28d9'];

  if (!sorted.length) return (
    <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.28)', textAlign: 'center', padding: '16px 0' }}>
      Aucune donnée
    </p>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {sorted.map(([name, qty], i) => (
        <div key={name}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{name}</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: colors[i] }}>×{qty}</span>
          </div>
          <div style={{ height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.07)' }}>
            <div style={{
              width: `${(qty / maxQty) * 100}%`, height: '100%',
              background: colors[i], borderRadius: 3, transition: 'width 0.6s ease',
            }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Signature generation helpers ── */
function _xmlEsc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function generateSignatureBlob(vendorName, role) {
  const W = 620, H = 200;
  const name = vendorName || 'Purple CBD';
  const roleStr = (role || 'Administrateur').toUpperCase();

  // ── Embed Pinyon Script font (true calligraphic, high stroke contrast) ──
  let fontCss = '';
  try {
    const r = await fetch(
      'https://fonts.gstatic.com/s/pinyonscript/v25/6xKpdSJbL9-e9LuoeQiDRQR8aOLQO4bhiDY.woff2'
    );
    const buf = await r.arrayBuffer();
    const bytes = new Uint8Array(buf);
    let bin = '';
    for (let i = 0; i < bytes.length; i += 8192) {
      bin += String.fromCharCode(...bytes.subarray(i, i + 8192));
    }
    const b64 = btoa(bin);
    fontCss = `@font-face{font-family:'SigScript';src:url('data:font/woff2;base64,${b64}') format('woff2');font-weight:normal;font-style:normal;}`;
  } catch (e) { /* fallback */ }

  const ff = fontCss ? "'SigScript', cursive" : 'cursive';

  // ── Build SVG — transparent background, white ink ──
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <style>${fontCss}</style>
    <filter id="ink" x="-2%" y="-10%" width="104%" height="130%">
      <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="4" seed="2" result="noise"/>
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.1"
        xChannelSelector="R" yChannelSelector="G" result="displaced"/>
      <feGaussianBlur in="displaced" stdDeviation="0.3"/>
    </filter>
  </defs>

  <!-- Signature name — white ink, calligraphic font -->
  <text x="22" y="122"
    font-family="${ff}"
    font-size="100"
    fill="rgba(255,255,255,0.94)"
    filter="url(#ink)"
  >${_xmlEsc(name)}</text>

  <!-- Flourish swash underline -->
  <path d="M 22,138 C 90,152 240,132 390,148 C 430,153 455,158 475,164 C 484,168 480,160 474,155"
    stroke="rgba(255,255,255,0.78)" stroke-width="1.7"
    fill="none" stroke-linecap="round" stroke-linejoin="round"/>

  <!-- Hairline start-of-swash upstroke -->
  <path d="M 22,138 C 18,130 16,122 20,116"
    stroke="rgba(255,255,255,0.35)" stroke-width="0.9"
    fill="none" stroke-linecap="round"/>

  <!-- Separator -->
  <line x1="22" y1="174" x2="330" y2="174"
    stroke="rgba(167,139,250,0.55)" stroke-width="0.7"/>

  <!-- Role — spaced small caps -->
  <text x="22" y="190"
    font-family="'Helvetica Neue', Helvetica, Arial, sans-serif"
    font-size="10" letter-spacing="3.5"
    fill="rgba(196,181,253,0.85)" font-weight="500"
  >${_xmlEsc(roleStr)}</text>

  <!-- Brand -->
  <text x="${W - 22}" y="190"
    font-family="'Helvetica Neue', Helvetica, Arial, sans-serif"
    font-size="10" text-anchor="end"
    fill="rgba(167,139,250,0.38)"
  >Purple CBD</text>
</svg>`;

  // ── Render SVG → canvas (transparent, 2× retina) ──
  return new Promise((resolve, reject) => {
    const img = new Image();
    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const url  = URL.createObjectURL(blob);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width  = W * 2;
      canvas.height = H * 2;
      const ctx = canvas.getContext('2d');
      ctx.scale(2, 2);
      ctx.clearRect(0, 0, W, H);   // transparent background
      ctx.drawImage(img, 0, 0, W, H);
      URL.revokeObjectURL(url);
      canvas.toBlob(resolve, 'image/png');
    };
    img.onerror = e => { URL.revokeObjectURL(url); reject(e); };
    img.src = url;
  });
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

  /* Physical Sales */
  const [physicalSales, setPhysicalSales] = useState([]);
  const [physicalSalesLoading, setPhysicalSalesLoading] = useState(false);
  const [physicalSalesError, setPhysicalSalesError] = useState('');
  const [newSaleModal, setNewSaleModal]         = useState(false);
  const [receiptLightbox, setReceiptLightbox]   = useState(null); // URL du reçu à afficher
  const [copiedInvoice, setCopiedInvoice]       = useState(null); // id de la vente dont le N° est copié
  const [copiedLightbox, setCopiedLightbox]     = useState(false);

  /* Search / filters */
  const [orderSearch, setOrderSearch]         = useState('');
  const [orderDateFilter, setOrderDateFilter] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('');
  const [salesSearch, setSalesSearch]         = useState('');
  const [salesDateFilter, setSalesDateFilter] = useState('');

  /* Catalogue */
  const [products, setProducts]               = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productForm, setProductForm]         = useState(null);
  const [productSaving, setProductSaving]     = useState(false);
  const [productImgUploading, setProductImgUploading] = useState(false);

  /* Vendor profile (Settings tab) */
  const [profileForm, setProfileForm]           = useState({ displayName: '', birthdate: '', address: '', avatarUrl: '', role: 'Administrateur' });
  const [profileLoading, setProfileLoading]     = useState(false);
  const [profileSaving, setProfileSaving]       = useState(false);
  const [profileSaveSuccess, setProfileSaveSuccess] = useState(false);
  const [passForm, setPassForm]                 = useState({ newPass: '', confirmPass: '' });
  const [passSaving, setPassSaving]             = useState(false);
  const [passMsg, setPassMsg]                   = useState(null); // { ok, text }
  const [generatedSigUrl, setGeneratedSigUrl]   = useState('');
  const [customSigUrl, setCustomSigUrl]         = useState('');
  const [sigGenerating, setSigGenerating]       = useState(false);
  const [sigCopied, setSigCopied]               = useState(false);
  const [sigAvatarUploading, setSigAvatarUploading] = useState(false);

  /* Member detail */
  const [memberDetail, setMemberDetail] = useState(null);

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
  useEffect(() => { fetchOrders(); fetchPhysicalSales(); fetchProducts(); }, []);


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

  async function fetchPhysicalSales() {
    setPhysicalSalesLoading(true);
    setPhysicalSalesError('');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setPhysicalSalesError('Non authentifié.'); setPhysicalSalesLoading(false); return; }
      const res = await fetch(`${BACKEND_URL}/api/physical-sales`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setPhysicalSales(json.sales || []);
    } catch (e) {
      setPhysicalSalesError('Impossible de charger les ventes.');
      console.error(e);
    } finally { setPhysicalSalesLoading(false); }
  }

  async function copyInvoiceNumber(invoiceNumber, saleId) {
    try {
      await navigator.clipboard.writeText(invoiceNumber);
      setCopiedInvoice(saleId);
      setTimeout(() => setCopiedInvoice(null), 2000);
    } catch { /* ignore */ }
  }

  async function copyReceiptUrl(url) {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedLightbox(true);
      setTimeout(() => setCopiedLightbox(false), 2000);
    } catch { /* ignore */ }
  }

  function handleTabChange(tab) {
    setActiveTab(tab);
    if (tab === 'orders'    || tab === 'dashboard') fetchOrders();
    if (tab === 'sales'     || tab === 'dashboard') fetchPhysicalSales();
    if (tab === 'catalogue' || tab === 'dashboard') fetchProducts();
    if (tab === 'settings') loadVendorProfile();
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
    navigate('/');
  }

  /* ── Catalogue ── */
  async function fetchProducts() {
    setProductsLoading(true);
    try {
      const token = await getToken();
      const res = await fetch(`${BACKEND_URL}/api/products/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setProducts(json.products || []);
    } catch (e) { console.error(e); }
    finally { setProductsLoading(false); }
  }

  async function saveProduct(form) {
    setProductSaving(true);
    try {
      const token  = await getToken();
      const method = form.id ? 'PUT' : 'POST';
      const url    = form.id ? `${BACKEND_URL}/api/products/${form.id}` : `${BACKEND_URL}/api/products`;
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Save failed');
      await fetchProducts();
      setProductForm(null);
    } catch (e) { console.error(e); }
    finally { setProductSaving(false); }
  }

  async function softDeleteProduct(id) {
    try {
      const token = await getToken();
      await fetch(`${BACKEND_URL}/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ active: false }),
      });
      setProducts(prev => prev.map(p => p.id === id ? { ...p, active: false } : p));
    } catch (e) { console.error(e); }
  }

  async function hardDeleteProduct(id) {
    try {
      const token = await getToken();
      await fetch(`${BACKEND_URL}/api/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (e) { console.error(e); }
  }

  async function reactivateProduct(prod) {
    try {
      const token = await getToken();
      await fetch(`${BACKEND_URL}/api/products/${prod.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ active: true }),
      });
      setProducts(prev => prev.map(p => p.id === prod.id ? { ...p, active: true } : p));
    } catch (e) { console.error(e); }
  }

  async function uploadProductImage(file) {
    setProductImgUploading(true);
    try {
      const reader = new FileReader();
      const base64 = await new Promise((resolve, reject) => {
        reader.onload  = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const token = await getToken();
      const res = await fetch(`${BACKEND_URL}/api/upload-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ imageBase64: base64 }),
      });
      const data = await res.json();
      return data.url || null;
    } catch (e) { console.error(e); return null; }
    finally { setProductImgUploading(false); }
  }

  /* ── Member detail ── */
  async function openMemberDetail(member) {
    setMemberDetail({ member, orders: [], loading: true });
    try {
      const token = await getToken();
      const res = await fetch(`${BACKEND_URL}/api/members/${member.discord_id}/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      setMemberDetail(prev => prev ? { ...prev, orders: json.orders || [], loading: false } : null);
    } catch (e) {
      console.error(e);
      setMemberDetail(prev => prev ? { ...prev, loading: false } : null);
    }
  }

  /* ── Vendor profile (Settings) ── */
  async function loadVendorProfile() {
    setProfileLoading(true);
    try {
      const { data: { user: u } } = await supabase.auth.getUser();
      const meta = u?.user_metadata || {};
      setProfileForm({
        displayName: meta.display_name || u?.email?.split('@')[0] || '',
        birthdate:   meta.birthdate   || '',
        address:     meta.address     || '',
        avatarUrl:   meta.avatar_url  || '',
        role:        meta.role        || 'Administrateur',
      });
      setCustomSigUrl(meta.signature_url     || '');
      setGeneratedSigUrl(meta.signature_gen_url || '');
    } catch (e) { console.error(e); }
    finally { setProfileLoading(false); }
  }

  async function saveVendorProfile() {
    setProfileSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          display_name:      profileForm.displayName,
          birthdate:         profileForm.birthdate,
          address:           profileForm.address,
          avatar_url:        profileForm.avatarUrl,
          role:              profileForm.role,
          signature_url:     customSigUrl || generatedSigUrl,
          signature_gen_url: generatedSigUrl,
        },
      });
      if (error) throw error;
      const { data: { user: u } } = await supabase.auth.getUser();
      setUser(u);
      setProfileSaveSuccess(true);
      setTimeout(() => setProfileSaveSuccess(false), 2500);
    } catch (e) { console.error(e); }
    finally { setProfileSaving(false); }
  }

  async function changePassword() {
    if (passForm.newPass !== passForm.confirmPass) {
      setPassMsg({ ok: false, text: 'Les mots de passe ne correspondent pas.' });
      return;
    }
    if (passForm.newPass.length < 6) {
      setPassMsg({ ok: false, text: 'Minimum 6 caractères requis.' });
      return;
    }
    setPassSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: passForm.newPass });
      if (error) throw error;
      setPassMsg({ ok: true, text: 'Mot de passe modifié avec succès.' });
      setPassForm({ newPass: '', confirmPass: '' });
    } catch (e) {
      setPassMsg({ ok: false, text: e.message || 'Erreur lors du changement.' });
    } finally {
      setPassSaving(false);
      setTimeout(() => setPassMsg(null), 4000);
    }
  }

  async function generateVendorSignature() {
    setSigGenerating(true);
    try {
      const blob = await generateSignatureBlob(
        profileForm.displayName || displayName,
        profileForm.role || 'Administrateur',
      );
      const reader = new FileReader();
      const base64 = await new Promise((resolve, reject) => {
        reader.onload  = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
      const token = await getToken();
      const res = await fetch(`${BACKEND_URL}/api/upload-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ imageBase64: base64 }),
      });
      const data = await res.json();
      if (data.url) {
        setGeneratedSigUrl(data.url);
        await supabase.auth.updateUser({ data: { signature_gen_url: data.url } });
      }
    } catch (e) { console.error(e); }
    finally { setSigGenerating(false); }
  }

  async function resetSignature() {
    setCustomSigUrl('');
    await supabase.auth.updateUser({ data: { signature_url: generatedSigUrl } });
  }

  async function uploadVendorAvatar(file) {
    setSigAvatarUploading(true);
    try {
      const reader = new FileReader();
      const base64 = await new Promise((resolve, reject) => {
        reader.onload  = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const token = await getToken();
      const res = await fetch(`${BACKEND_URL}/api/upload-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ imageBase64: base64 }),
      });
      const data = await res.json();
      if (data.url) setProfileForm(p => ({ ...p, avatarUrl: data.url }));
    } catch (e) { console.error(e); }
    finally { setSigAvatarUploading(false); }
  }

  const displayName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'Admin';
  const pendingCount = orders.filter(o => o.status === 'pending').length;

  /* Dashboard stats */
  const totalRevenue = orders.reduce((s, o) => s + (o.total || 0), 0);
  const physicalSalesRevenue = physicalSales.reduce((s, sale) => s + (sale.total || 0), 0);
  const caTotal = totalRevenue + physicalSalesRevenue;
  const deliveredCount = orders.filter(o => o.status === 'delivered' || o.status === 'picked_up').length;
  const activeOrdersCount = orders.filter(o => o.status === 'pending' || o.status === 'ready').length;

  const filteredOrders = orders.filter(o => {
    const q = orderSearch.trim().toLowerCase();
    if (q && !`${o.rp_name || ''} ${o.username || ''} ${o.guest_name || ''}`.toLowerCase().includes(q)) return false;
    if (orderDateFilter && new Date(o.created_at).toISOString().slice(0, 10) !== orderDateFilter) return false;
    if (orderStatusFilter && o.status !== orderStatusFilter) return false;
    return true;
  });

  const filteredSales = physicalSales.filter(s => {
    const q = salesSearch.trim().toLowerCase();
    if (q && !`${s.rp_name || ''} ${s.guest_name || ''}`.toLowerCase().includes(q)) return false;
    if (salesDateFilter && new Date(s.created_at).toISOString().slice(0, 10) !== salesDateFilter) return false;
    return true;
  });

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
            <button className={`${s.navItem} ${activeTab === 'sales' ? s.navItemActive : ''}`} onClick={() => handleTabChange('sales')}>
              <SalesIcon /> Ventes
              {physicalSales.length > 0 && <span className={s.navBadge}>{physicalSales.length}</span>}
            </button>
            <button className={`${s.navItem} ${activeTab === 'catalogue' ? s.navItemActive : ''}`} onClick={() => handleTabChange('catalogue')}>
              <CatalogueIcon /> Catalogue
              {products.filter(p => p.active).length > 0 && <span className={s.navBadge}>{products.filter(p => p.active).length}</span>}
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

              {/* ── Store controls (top) ── */}
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
                      <button className={`${s.toggle} ${settings.store_open ? s.toggleOn : ''}`}
                        onClick={() => toggleSetting('store_open')} disabled={settingsSaving !== null} aria-label="Boutique ouverte">
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
                      <button className={`${s.toggle} ${settings.delivery_enabled ? s.toggleOn : ''}`}
                        onClick={() => toggleSetting('delivery_enabled')} disabled={settingsSaving !== null} aria-label="Livraison activée">
                        <span className={s.toggleKnob} />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* ── KPI cards ── */}
              <div className={s.kpiRow}>
                <div className={s.kpiCard}>
                  <span className={s.kpiNum}>${caTotal}</span>
                  <span className={s.kpiLabel}>CA Total</span>
                  <span className={s.kpiSub}>Commandes + ventes physiques</span>
                </div>
                <div className={s.kpiCard}>
                  <span className={s.kpiNum} style={{ color: '#f59e0b' }}>{activeOrdersCount}</span>
                  <span className={s.kpiLabel}>Commandes actives</span>
                  <span className={s.kpiSub}>{pendingCount} en attente · {orders.length} total</span>
                </div>
                <div className={s.kpiCard}>
                  <span className={s.kpiNum} style={{ color: '#8b5cf6' }}>{physicalSales.length}</span>
                  <span className={s.kpiLabel}>Ventes physiques</span>
                  <span className={s.kpiSub}>${physicalSalesRevenue} encaissés</span>
                </div>
                <div className={s.kpiCard}>
                  <span className={s.kpiNum}>{members.length}</span>
                  <span className={s.kpiLabel}>Membres inscrits</span>
                  <span className={s.kpiSub}>{deliveredCount} commandes livrées</span>
                </div>
              </div>

              {/* ── Revenue line chart ── */}
              <div className={s.chartCard}>
                <div className={s.chartCardHeader}>
                  <h3 className={s.chartTitle}>Revenus — 14 derniers jours</h3>
                  <span className={s.chartBadge}>${caTotal} total</span>
                </div>
                <div className={s.chartBody}>
                  <RevenueChart orders={orders} sales={physicalSales} />
                </div>
              </div>

              {/* ── Status + Top Products ── */}
              <div className={s.chartGrid}>
                <div className={s.chartCard}>
                  <div className={s.chartCardHeader}>
                    <h3 className={s.chartTitle}>Commandes par statut</h3>
                    <span className={s.chartBadge}>{orders.length} total</span>
                  </div>
                  <div className={s.chartBody}>
                    <StatusChart orders={orders} />
                  </div>
                </div>
                <div className={s.chartCard}>
                  <div className={s.chartCardHeader}>
                    <h3 className={s.chartTitle}>Produits populaires</h3>
                  </div>
                  <div className={s.chartBody}>
                    <TopProductsChart orders={orders} sales={physicalSales} />
                  </div>
                </div>
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
                        <tr key={m.discord_id} className={`${m.banned ? s.rowBanned : ''} ${s.clickableRow}`} onClick={() => openMemberDetail(m)}>
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
                          <td onClick={e => e.stopPropagation()}>
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
                          <td onClick={e => e.stopPropagation()}>
                            <div className={s.memberActions}>
                              <button
                                className={s.actionBtnSmall}
                                onClick={e => { e.stopPropagation(); setConfirmModal({ label: `Réinitialiser ${m.username || m.rp_name} ?`, onConfirm: () => resetMember(m.discord_id) }); }}
                                disabled={actionLoading[m.discord_id]}
                              >Reset</button>
                              {m.banned ? (
                                <button
                                  className={`${s.actionBtnSmall} ${s.actionBtnGreen}`}
                                  onClick={e => { e.stopPropagation(); saveBan(m.discord_id, false, null); }}
                                  disabled={actionLoading[m.discord_id]}
                                >Débannir</button>
                              ) : (
                                <button
                                  className={`${s.actionBtnSmall} ${s.actionBtnRed}`}
                                  onClick={e => { e.stopPropagation(); setBanModal({ discordId: m.discord_id, username: m.username }); setBanMessage(''); }}
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
              {/* Filter bar */}
              <div className={s.filterBar}>
                <div className={s.filterSearch}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={s.filterSearchIcon}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  <input
                    className={s.filterInput}
                    type="text"
                    placeholder="Rechercher un client..."
                    value={orderSearch}
                    onChange={e => setOrderSearch(e.target.value)}
                  />
                </div>
                <input
                  className={s.filterDate}
                  type="date"
                  value={orderDateFilter}
                  onChange={e => setOrderDateFilter(e.target.value)}
                  title="Filtrer par date"
                />
                <select
                  className={s.filterSelect}
                  value={orderStatusFilter}
                  onChange={e => setOrderStatusFilter(e.target.value)}
                >
                  <option value="">Tous les statuts</option>
                  {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                {(orderSearch || orderDateFilter || orderStatusFilter) && (
                  <button className={s.filterReset} onClick={() => { setOrderSearch(''); setOrderDateFilter(''); setOrderStatusFilter(''); }}>
                    ✕
                  </button>
                )}
              </div>

              {ordersLoading && <p className={s.stateMsg}>Chargement...</p>}
              {ordersError && <p className={s.stateError}>{ordersError}</p>}
              {!ordersLoading && !ordersError && orders.length === 0 && (
                <p className={s.stateMsg}>Aucune commande pour l'instant.</p>
              )}
              {!ordersLoading && !ordersError && orders.length > 0 && filteredOrders.length === 0 && (
                <p className={s.stateMsg}>Aucune commande ne correspond aux filtres.</p>
              )}
              {!ordersLoading && !ordersError && filteredOrders.length > 0 && (
                <div className={s.ordersList}>
                  {filteredOrders.map(order => {
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
                            {!['delivered', 'picked_up', 'cancelled'].includes(order.status) && (
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
                            )}
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

        {/* ── Ventes Physiques ── */}
        {activeTab === 'sales' && (
          <>
            <header className={s.header}>
              <div>
                <h1 className={s.pageTitle}>Ventes</h1>
                <p className={s.pageSubtitle}>{physicalSales.length} vente{physicalSales.length !== 1 ? 's' : ''} physique{physicalSales.length !== 1 ? 's' : ''}</p>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className={s.refreshBtn} onClick={fetchPhysicalSales} disabled={physicalSalesLoading} title="Actualiser">
                  <RefreshIcon />
                </button>
              </div>
            </header>
            <div className={s.content}>
              {/* Big new sale button */}
              <button className={s.newSaleBtn} onClick={() => setNewSaleModal(true)}>
                <span className={s.newSaleBtnIcon}>+</span>
                <span className={s.newSaleBtnText}>Nouvelle vente physique</span>
              </button>

              {/* Filter bar */}
              <div className={s.filterBar}>
                <div className={s.filterSearch}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={s.filterSearchIcon}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  <input
                    className={s.filterInput}
                    type="text"
                    placeholder="Rechercher un client..."
                    value={salesSearch}
                    onChange={e => setSalesSearch(e.target.value)}
                  />
                </div>
                <input
                  className={s.filterDate}
                  type="date"
                  value={salesDateFilter}
                  onChange={e => setSalesDateFilter(e.target.value)}
                  title="Filtrer par date"
                />
                {(salesSearch || salesDateFilter) && (
                  <button className={s.filterReset} onClick={() => { setSalesSearch(''); setSalesDateFilter(''); }}>
                    ✕
                  </button>
                )}
              </div>

              {physicalSalesLoading && <p className={s.stateMsg}>Chargement...</p>}
              {physicalSalesError && <p className={s.stateError}>{physicalSalesError}</p>}
              {!physicalSalesLoading && !physicalSalesError && physicalSales.length === 0 && (
                <div className={s.emptySales}>
                  <div className={s.emptySalesIcon}><SalesIcon /></div>
                  <p className={s.emptySalesText}>Aucune vente physique pour l'instant.</p>
                  <p className={s.emptySalesSub}>Les ventes créées apparaîtront ici.</p>
                </div>
              )}
              {!physicalSalesLoading && !physicalSalesError && physicalSales.length > 0 && filteredSales.length === 0 && (
                <p className={s.stateMsg}>Aucune vente ne correspond aux filtres.</p>
              )}
              {!physicalSalesLoading && !physicalSalesError && filteredSales.length > 0 && (
                <div className={s.salesList}>
                  {filteredSales.map(sale => (
                    <div key={sale.id} className={s.saleCard}>
                      <div className={s.saleCardTop}>
                        <div className={s.saleClientInfo}>
                          <span className={s.saleClientName}>{sale.rp_name || sale.guest_name || 'Client anonyme'}</span>
                          {sale.discord_id && <span className={s.saleAccountBadge}>✓ Compte client</span>}
                        </div>
                        <div className={s.saleMeta}>
                          <span className={s.saleRef}>#{sale.id.slice(-6).toUpperCase()}</span>
                          <span className={s.saleDate}>
                            {new Date(sale.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                            {' '}
                            {new Date(sale.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>

                      <div className={s.saleItems}>
                        {(sale.items || []).map((item, i) => (
                          <span key={i} className={s.saleItem}>{item.name} ×{item.qty}</span>
                        ))}
                      </div>

                      <div className={s.saleFooter}>
                        <div className={s.saleFooterLeft}>
                          <span className={s.saleTotal}>${sale.total}</span>
                          {(sale.points_earned || 0) > 0 && (
                            <span className={s.salePoints}>⭐ +{sale.points_earned} pts</span>
                          )}
                          <span className={s.saleVendor}>par {sale.vendor_name || 'Vendeur'}</span>
                        </div>
                        <div className={s.saleFooterRight}>
                          {sale.invoice_number && (
                            <div className={s.saleInvoiceRow}>
                              <span className={s.saleInvoice}>{sale.invoice_number}</span>
                              <button
                                className={`${s.saleInvoiceCopy} ${copiedInvoice === sale.id ? s.saleInvoiceCopied : ''}`}
                                onClick={() => copyInvoiceNumber(sale.invoice_number, sale.id)}
                                title="Copier le numéro de facture"
                              >
                                {copiedInvoice === sale.id ? '✓' : '⎘'}
                              </button>
                            </div>
                          )}
                          {sale.receipt_url && (
                            <button className={s.saleReceiptLink} onClick={() => { setReceiptLightbox(sale.receipt_url); setCopiedLightbox(false); }}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="9" y1="7" x2="15" y2="7"/><line x1="9" y1="11" x2="15" y2="11"/><line x1="9" y1="15" x2="13" y2="15"/></svg>
                              Ticket
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* ── Catalogue ── */}
        {activeTab === 'catalogue' && (
          <>
            <header className={s.header}>
              <div>
                <h1 className={s.pageTitle}>Catalogue</h1>
                <p className={s.pageSubtitle}>{products.filter(p => p.active).length} produit{products.filter(p => p.active).length !== 1 ? 's' : ''} actif{products.filter(p => p.active).length !== 1 ? 's' : ''}</p>
              </div>
              <button className={s.refreshBtn} onClick={fetchProducts} disabled={productsLoading} title="Actualiser"><RefreshIcon /></button>
            </header>
            <div className={s.content}>
              <button className={s.newSaleBtn} onClick={() => setProductForm({ name: '', description: '', strain: '', badge: '', tags: [], price: 150, loyalty_price: 100, image_url: '', active: true })}>
                <span className={s.newSaleBtnIcon}>+</span>
                <span className={s.newSaleBtnText}>Nouveau produit</span>
              </button>

              {productsLoading && <p className={s.stateMsg}>Chargement...</p>}
              {!productsLoading && products.length === 0 && (
                <p className={s.stateMsg}>Aucun produit — cliquez sur + pour en ajouter.</p>
              )}
              {!productsLoading && products.length > 0 && (
                <div className={s.productGrid}>
                  {products.map(p => (
                    <div key={p.id} className={`${s.productCard} ${!p.active ? s.productCardInactive : ''}`}>
                      {p.image_url ? (
                        <img src={p.image_url} alt={p.name} className={s.productCardImg} />
                      ) : (
                        <div className={s.productCardImgPlaceholder}><ImgIcon /></div>
                      )}
                      <div className={s.productCardBody}>
                        <div className={s.productCardNameRow}>
                          <span className={s.productCardName}>{p.name}</span>
                          {!p.active && <span className={s.productCardInactiveBadge}>Inactif</span>}
                        </div>
                        {p.strain && <span className={s.productCardStrain}>{p.strain}</span>}
                        <div className={s.productCardPrices}>
                          <span className={s.productCardPrice}>${p.price}</span>
                          <span className={s.productCardLoyalty}>{p.loyalty_price} pts</span>
                        </div>
                      </div>
                      <div className={s.productCardActions}>
                        <button className={s.actionBtnSmall} onClick={() => setProductForm({ ...p, tags: p.tags || [] })}>Modifier</button>
                        {p.active ? (
                          <button className={`${s.actionBtnSmall} ${s.actionBtnRed}`}
                            onClick={() => setConfirmModal({ label: `Désactiver "${p.name}" ?`, onConfirm: () => softDeleteProduct(p.id) })}>
                            Désactiver
                          </button>
                        ) : (
                          <button className={`${s.actionBtnSmall} ${s.actionBtnGreen}`} onClick={() => reactivateProduct(p)}>
                            Réactiver
                          </button>
                        )}
                        <button
                          className={`${s.actionBtnSmall} ${s.actionBtnRed} ${s.actionBtnIcon}`}
                          title="Supprimer définitivement"
                          onClick={() => setConfirmModal({ label: `Supprimer définitivement "${p.name}" ? Cette action est irréversible.`, onConfirm: () => hardDeleteProduct(p.id) })}
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </div>
                  ))}
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
                <p className={s.pageSubtitle}>Profil vendeur &amp; configuration</p>
              </div>
            </header>
            <div className={s.content}>
              {profileLoading ? (
                <p className={s.stateMsg}>Chargement du profil...</p>
              ) : (
                <div className={s.settingsGrid}>

                  {/* ── Card : Profil ── */}
                  <div className={s.settingsCard}>
                    <div className={s.settingsCardTitleRow}>
                      <h3 className={s.settingsCardTitle}>Profil vendeur</h3>
                      <p className={s.settingsCardSub}>Photo, nom affiché, coordonnées</p>
                    </div>

                    {/* Avatar row */}
                    <div className={s.profileAvatarRow}>
                      <div className={s.profileAvatarPreview}>
                        {profileForm.avatarUrl
                          ? <img src={profileForm.avatarUrl} alt="avatar" className={s.profileAvatarImg} />
                          : <div className={s.profileAvatarFallback}>{(profileForm.displayName || displayName)[0]?.toUpperCase() || '?'}</div>
                        }
                      </div>
                      <div className={s.profileAvatarActions}>
                        <label className={`${s.actionBtnSmall} ${s.profileAvatarUploadBtn}`}>
                          {sigAvatarUploading ? 'Upload...' : 'Changer la photo'}
                          <input type="file" accept="image/*" style={{ display: 'none' }}
                            onChange={e => e.target.files[0] && uploadVendorAvatar(e.target.files[0])} />
                        </label>
                        {profileForm.avatarUrl && (
                          <button className={s.actionBtnSmall} onClick={() => setProfileForm(p => ({ ...p, avatarUrl: '' }))}>
                            Retirer
                          </button>
                        )}
                      </div>
                    </div>

                    <div className={s.settingsFormGrid}>
                      <div className={s.productFormField}>
                        <label className={s.productFormLabel}>Nom affiché</label>
                        <input className={s.productFormInput}
                          value={profileForm.displayName}
                          onChange={e => setProfileForm(p => ({ ...p, displayName: e.target.value }))}
                          placeholder="Votre prénom ou pseudo" />
                      </div>
                      <div className={s.productFormField}>
                        <label className={s.productFormLabel}>Rôle</label>
                        <select className={s.productFormInput}
                          value={profileForm.role}
                          onChange={e => setProfileForm(p => ({ ...p, role: e.target.value }))}>
                          <option value="Administrateur">Administrateur</option>
                          <option value="CEO">CEO</option>
                          <option value="CO-CEO">CO-CEO</option>
                          <option value="Gérant">Gérant</option>
                          <option value="Vendeur">Vendeur</option>
                          <option value="Autre">Autre</option>
                        </select>
                      </div>
                      <div className={s.productFormField}>
                        <label className={s.productFormLabel}>Date de naissance</label>
                        <input className={s.productFormInput} type="date"
                          value={profileForm.birthdate}
                          onChange={e => setProfileForm(p => ({ ...p, birthdate: e.target.value }))} />
                      </div>
                      <div className={s.productFormField}>
                        <label className={s.productFormLabel}>Adresse</label>
                        <input className={s.productFormInput}
                          value={profileForm.address}
                          onChange={e => setProfileForm(p => ({ ...p, address: e.target.value }))}
                          placeholder="123 rue de la Paix, Montréal" />
                      </div>
                    </div>

                    <div className={s.settingsCardFooter}>
                      <button className={s.actionBtnSmall} onClick={saveVendorProfile} disabled={profileSaving}>
                        {profileSaving ? 'Sauvegarde...' : 'Enregistrer le profil'}
                      </button>
                      {profileSaveSuccess && <span className={s.passSuccess}>✓ Profil mis à jour</span>}
                    </div>
                  </div>

                  {/* ── Card : Compte ── */}
                  <div className={s.settingsCard}>
                    <div className={s.settingsCardTitleRow}>
                      <h3 className={s.settingsCardTitle}>Informations du compte</h3>
                      <p className={s.settingsCardSub}>Données de votre compte administrateur</p>
                    </div>
                    <ul className={s.accountInfoList}>
                      <li className={s.accountInfoRow}>
                        <span className={s.accountInfoLabel}>Adresse e-mail</span>
                        <span className={s.accountInfoVal}>{user?.email || '—'}</span>
                      </li>
                      <li className={s.accountInfoRow}>
                        <span className={s.accountInfoLabel}>Date d'inscription</span>
                        <span className={s.accountInfoVal}>
                          {user?.created_at
                            ? new Date(user.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
                            : '—'}
                        </span>
                      </li>
                      <li className={s.accountInfoRow}>
                        <span className={s.accountInfoLabel}>Dernière connexion</span>
                        <span className={s.accountInfoVal}>
                          {user?.last_sign_in_at
                            ? new Date(user.last_sign_in_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                            : '—'}
                        </span>
                      </li>
                    </ul>
                  </div>

                  {/* ── Card : Sécurité ── */}
                  <div className={s.settingsCard}>
                    <div className={s.settingsCardTitleRow}>
                      <h3 className={s.settingsCardTitle}>Sécurité</h3>
                      <p className={s.settingsCardSub}>Modifier votre mot de passe</p>
                    </div>
                    <div className={s.settingsFormGrid}>
                      <div className={s.productFormField}>
                        <label className={s.productFormLabel}>Nouveau mot de passe</label>
                        <input className={s.productFormInput} type="password"
                          value={passForm.newPass}
                          onChange={e => setPassForm(p => ({ ...p, newPass: e.target.value }))}
                          placeholder="••••••••" autoComplete="new-password" />
                      </div>
                      <div className={s.productFormField}>
                        <label className={s.productFormLabel}>Confirmer le mot de passe</label>
                        <input className={s.productFormInput} type="password"
                          value={passForm.confirmPass}
                          onChange={e => setPassForm(p => ({ ...p, confirmPass: e.target.value }))}
                          placeholder="••••••••" autoComplete="new-password" />
                      </div>
                    </div>
                    <div className={s.settingsCardFooter}>
                      <button className={s.actionBtnSmall} onClick={changePassword}
                        disabled={passSaving || !passForm.newPass}>
                        {passSaving ? 'Modification...' : 'Changer le mot de passe'}
                      </button>
                      {passMsg && (
                        <span className={passMsg.ok ? s.passSuccess : s.passError}>{passMsg.text}</span>
                      )}
                    </div>
                  </div>

                  {/* ── Card : Signature ── */}
                  <div className={`${s.settingsCard} ${s.settingsCardFull}`}>
                    <div className={s.settingsCardTitleRow}>
                      <h3 className={s.settingsCardTitle}>Signature automatique</h3>
                      <p className={s.settingsCardSub}>Image générée pour vos messages et documents</p>
                    </div>

                    {/* Preview */}
                    <div className={s.sigPreview}>
                      {(customSigUrl || generatedSigUrl) ? (
                        <img src={customSigUrl || generatedSigUrl} alt="Signature" className={s.sigPreviewImg} />
                      ) : (
                        <div className={s.sigPreviewEmpty}>
                          <span>Aucune signature générée</span>
                          <span className={s.sigPreviewEmptySub}>Cliquez sur Générer pour créer votre signature</span>
                        </div>
                      )}
                    </div>

                    <div className={s.sigActions}>
                      <button className={s.actionBtnSmall} onClick={generateVendorSignature} disabled={sigGenerating}>
                        {sigGenerating ? 'Génération...' : generatedSigUrl ? '↺ Regénérer' : '✦ Générer ma signature'}
                      </button>
                      {(customSigUrl || generatedSigUrl) && (
                        <button
                          className={`${s.actionBtnSmall} ${s.sigCopyBtn} ${sigCopied ? s.sigCopyDone : ''}`}
                          onClick={async () => {
                            await navigator.clipboard.writeText(customSigUrl || generatedSigUrl);
                            setSigCopied(true);
                            setTimeout(() => setSigCopied(false), 2000);
                          }}>
                          {sigCopied ? '✓ Copié !' : '⎘ Copier le lien'}
                        </button>
                      )}
                      {customSigUrl && (
                        <button className={`${s.actionBtnSmall} ${s.actionBtnRed}`} onClick={resetSignature}>
                          Réinitialiser
                        </button>
                      )}
                    </div>

                    <div className={s.sigCustomSection}>
                      <label className={s.productFormLabel}>Utiliser ma propre signature (URL d'image)</label>
                      <div className={s.sigCustomRow}>
                        <input
                          className={s.productFormInput}
                          value={customSigUrl}
                          onChange={e => setCustomSigUrl(e.target.value)}
                          placeholder="https://exemple.com/ma-signature.png"
                        />
                        {customSigUrl && (
                          <button className={`${s.actionBtnSmall} ${s.actionBtnRed}`}
                            onClick={() => setCustomSigUrl('')} title="Effacer">✕</button>
                        )}
                      </div>
                      {customSigUrl && (
                        <p className={s.sigCustomNote}>L'aperçu et le lien copié utilisent votre signature personnalisée.</p>
                      )}
                    </div>

                    <div className={s.settingsCardFooter}>
                      <button className={s.actionBtnSmall} onClick={saveVendorProfile} disabled={profileSaving}>
                        {profileSaving ? 'Sauvegarde...' : 'Enregistrer les préférences de signature'}
                      </button>
                      {profileSaveSuccess && <span className={s.passSuccess}>✓ Sauvegardé</span>}
                    </div>
                  </div>

                </div>
              )}
            </div>
          </>
        )}

      </main>

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
                onClick={() => copyReceiptUrl(receiptLightbox)}
              >
                {copiedLightbox ? '✓ Copié' : '⎘ Copier le lien'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Physical Sale Modal ── */}
      {newSaleModal && (
        <PhysicalSaleModal
          onClose={() => setNewSaleModal(false)}
          members={members}
          vendorName={displayName}
          getToken={getToken}
          products={products.filter(p => p.active)}
          onSaleCreated={() => {
            setNewSaleModal(false);
            fetchPhysicalSales();
          }}
        />
      )}

      {/* ── Member Detail Popup ── */}
      {memberDetail && (
        <div className={s.modalOverlay} onClick={e => { if (e.target === e.currentTarget) setMemberDetail(null); }}>
          <div className={`${s.modal} ${s.memberDetailModal}`}>
            <div className={s.memberDetailHead}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {memberDetail.member.avatar_url
                  ? <img src={memberDetail.member.avatar_url} alt="" className={s.memberDetailAvatar} />
                  : <div className={s.memberAvatarFallback}>{(memberDetail.member.username || '?')[0].toUpperCase()}</div>
                }
                <div>
                  <h3 className={s.modalTitle} style={{ marginBottom: 2 }}>
                    {memberDetail.member.rp_name || memberDetail.member.username || '—'}
                  </h3>
                  {memberDetail.member.rp_name && (
                    <span className={s.memberDetailSub}>@{memberDetail.member.username}</span>
                  )}
                  {memberDetail.member.banned && <span className={s.bannedBadge} style={{ marginLeft: 8 }}>Banni</span>}
                </div>
              </div>
              <button className={s.receiptLightboxClose} onClick={() => setMemberDetail(null)}>✕</button>
            </div>

            <div className={s.memberDetailStats}>
              <div className={s.memberDetailStat}>
                <span className={s.memberDetailStatNum}>
                  ${memberDetail.orders.filter(o => o.order_type !== 'loyalty').reduce((acc, o) => acc + (o.total || 0), 0)}
                </span>
                <span className={s.memberDetailStatLabel}>Dépenses totales</span>
              </div>
              <div className={s.memberDetailStat}>
                <span className={s.memberDetailStatNum}>{memberDetail.orders.length}</span>
                <span className={s.memberDetailStatLabel}>Commandes & achats</span>
              </div>
              <div className={s.memberDetailStat}>
                <span className={s.memberDetailStatNum} style={{ color: '#8b5cf6' }}>
                  {memberDetail.member.loyalty_points ?? 0}
                </span>
                <span className={s.memberDetailStatLabel}>Points fidélité</span>
              </div>
            </div>

            <div className={s.memberDetailHistory}>
              <h4 className={s.memberDetailHistoryTitle}>Historique complet</h4>
              {memberDetail.loading ? (
                <p className={s.stateMsg}>Chargement...</p>
              ) : memberDetail.orders.length === 0 ? (
                <p className={s.stateMsg}>Aucune commande pour ce membre.</p>
              ) : (
                <div className={s.memberDetailOrders}>
                  {memberDetail.orders.map(order => {
                    const st = STATUS_OPTIONS.find(o => o.value === order.status) || STATUS_OPTIONS[0];
                    return (
                      <div key={order.id} className={s.memberDetailOrder}>
                        <div className={s.memberDetailOrderTop}>
                          <span className={s.memberDetailOrderId}>#{order.id.slice(-6).toUpperCase()}</span>
                          {order.order_type === 'physical' && <span className={s.saleAccountBadge}>🏪 Physique</span>}
                          {order.order_type === 'loyalty'  && <span className={s.loyaltyOrderBadge}>⭐ Fidélité</span>}
                          <span className={s.memberDetailOrderDate}>
                            {new Date(order.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                          <span style={{ fontSize: 10, fontWeight: 700, color: st.color, marginLeft: 'auto' }}>{st.label}</span>
                        </div>
                        <div className={s.orderItems}>
                          {(order.items || []).map((item, i) => (
                            <span key={i} className={s.orderItem}>{item.name} ×{item.qty}</span>
                          ))}
                        </div>
                        <div className={s.memberDetailOrderFooter}>
                          {order.order_type === 'loyalty'
                            ? <span className={s.loyaltyOrderBadge}>⭐ {order.points_cost} pts</span>
                            : <span className={s.orderTotal}>${order.total}</span>
                          }
                          {order.points_earned > 0 && <span className={s.orderPointsEarn}>+{order.points_earned} pts</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Product Form Modal ── */}
      {productForm !== null && (
        <div className={s.modalOverlay} onClick={e => { if (e.target === e.currentTarget) setProductForm(null); }}>
          <div className={`${s.modal} ${s.productModal}`}>
            <div className={s.productModalHeader}>
              <h3 className={s.modalTitle}>{productForm.id ? 'Modifier le produit' : 'Nouveau produit'}</h3>
              <button className={s.receiptLightboxClose} onClick={() => setProductForm(null)}>✕</button>
            </div>

            <div className={s.productFormGrid}>
              <div className={s.productFormField}>
                <label className={s.productFormLabel}>Nom *</label>
                <input className={s.productFormInput} value={productForm.name}
                  onChange={e => setProductForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="Purple Haze" autoFocus />
              </div>
              <div className={s.productFormField}>
                <label className={s.productFormLabel}>Variété</label>
                <input className={s.productFormInput} value={productForm.strain || ''}
                  onChange={e => setProductForm(p => ({ ...p, strain: e.target.value }))}
                  placeholder="Sativa Dominante" />
              </div>
              <div className={s.productFormField}>
                <label className={s.productFormLabel}>Badge</label>
                <input className={s.productFormInput} value={productForm.badge || ''}
                  onChange={e => setProductForm(p => ({ ...p, badge: e.target.value }))}
                  placeholder="Signature" />
              </div>
              <div className={s.productFormField}>
                <label className={s.productFormLabel}>Tags (virgule)</label>
                <input className={s.productFormInput}
                  value={(productForm.tags || []).join(', ')}
                  onChange={e => setProductForm(p => ({ ...p, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) }))}
                  placeholder="Créatif, Euphorisant" />
              </div>
              <div className={s.productFormField}>
                <label className={s.productFormLabel}>Prix ($)</label>
                <input className={s.productFormInput} type="number" min={0} value={productForm.price}
                  onChange={e => setProductForm(p => ({ ...p, price: Number(e.target.value) }))} />
              </div>
              <div className={s.productFormField}>
                <label className={s.productFormLabel}>Prix fidélité (pts)</label>
                <input className={s.productFormInput} type="number" min={0} value={productForm.loyalty_price}
                  onChange={e => setProductForm(p => ({ ...p, loyalty_price: Number(e.target.value) }))} />
              </div>
            </div>

            <div className={s.productFormField} style={{ marginTop: 14 }}>
              <label className={s.productFormLabel}>Description</label>
              <textarea className={`${s.productFormInput} ${s.productFormTextarea}`}
                value={productForm.description || ''}
                onChange={e => setProductForm(p => ({ ...p, description: e.target.value }))}
                placeholder="Description du produit..." rows={3} />
            </div>

            <div className={s.productFormField} style={{ marginTop: 14 }}>
              <label className={s.productFormLabel}>Image</label>
              <div className={s.productFormImageRow}>
                <input className={s.productFormInput} value={productForm.image_url || ''}
                  onChange={e => setProductForm(p => ({ ...p, image_url: e.target.value }))}
                  placeholder="https://... ou uploader" />
                <label className={s.productFormUploadBtn}>
                  {productImgUploading ? '...' : '↑ Upload'}
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={async e => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const url = await uploadProductImage(file);
                    if (url) setProductForm(p => ({ ...p, image_url: url }));
                  }} />
                </label>
              </div>
              {productForm.image_url && (
                <img src={productForm.image_url} alt="Preview" className={s.productFormPreview} />
              )}
            </div>

            <div className={s.modalBtns} style={{ marginTop: 20 }}>
              <button className={s.modalCancelBtn} onClick={() => setProductForm(null)}>Annuler</button>
              <button className={s.modalConfirmBtn} onClick={() => saveProduct(productForm)}
                disabled={productSaving || !productForm.name.trim()}>
                {productSaving ? 'Sauvegarde...' : (productForm.id ? 'Enregistrer' : 'Créer le produit')}
              </button>
            </div>
          </div>
        </div>
      )}

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
