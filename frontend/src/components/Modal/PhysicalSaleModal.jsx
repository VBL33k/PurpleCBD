import { useState, useRef } from 'react';
import s from './PhysicalSaleModal.module.css';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://purple-cbd-api.onrender.com';
const LOGO_URL = 'https://i.imgur.com/CbcU0Qp.png';

const PRODUCTS = [
  { id: 1, name: 'Purple Haze',  strain: 'Sativa Dominante',  price: 150 },
  { id: 2, name: 'OG Kush',      strain: 'Indica Dominante',  price: 150 },
  { id: 3, name: 'Lemon Haze',   strain: 'Sativa Pure',        price: 150 },
  { id: 4, name: 'Dark Devil',   strain: 'Hybrid Exclusive',   price: 150 },
];

/* ── Receipt PNG generator ── */
async function loadImg(src) {
  return new Promise(resolve => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    let done = false;
    const fin = r => { if (!done) { done = true; resolve(r); } };
    img.onload = () => fin(img);
    img.onerror = () => fin(null);
    setTimeout(() => fin(null), 3000);
    img.src = src;
  });
}

function dash(ctx, x1, y, x2) {
  ctx.save();
  ctx.setLineDash([5, 5]);
  ctx.strokeStyle = '#ddd';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x1, y);
  ctx.lineTo(x2, y);
  ctx.stroke();
  ctx.restore();
}

async function generateReceiptBlob({ items, total, clientName, vendorName, createdAt, pointsEarned, invoiceNumber }) {
  const W = 460;
  const PAD = 38;
  const IH = 30;
  const n = items.length;
  const hasPoints = pointsEarned > 0;
  const H = 390 + n * IH + (hasPoints ? 30 : 0);

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  // Paper background
  ctx.fillStyle = '#f7f6f3';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(12, 0, W - 24, H);

  let y = 0;

  // Top stripe
  ctx.fillStyle = '#6d28d9';
  ctx.fillRect(12, 0, W - 24, 7);
  y = 7 + 16;

  // Logo
  const logo = await loadImg(LOGO_URL);
  if (logo) {
    const LS = 58;
    ctx.drawImage(logo, (W - LS) / 2, y, LS, LS);
    y += LS + 10;
  } else {
    const cx = W / 2;
    const cy = y + 27;
    ctx.beginPath();
    ctx.fillStyle = '#7c3aed';
    ctx.moveTo(cx, cy - 24); ctx.lineTo(cx + 18, cy);
    ctx.lineTo(cx, cy + 24); ctx.lineTo(cx - 18, cy);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 20px serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('P', cx, cy);
    ctx.textBaseline = 'alphabetic';
    y += 62;
  }

  // Company name
  ctx.fillStyle = '#1a0f2e';
  ctx.font = 'bold 21px "Courier New", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('PURPLE CBD', W / 2, y); y += 6;

  ctx.fillStyle = '#8b5cf6';
  ctx.font = '10px "Courier New", monospace';
  ctx.fillText('• TICKET DE CAISSE •', W / 2, y + 14); y += 28;

  dash(ctx, PAD, y, W - PAD); y += 14;

  // Date / time
  const now = new Date(createdAt || Date.now());
  const dateStr = now.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  ctx.fillStyle = '#555';
  ctx.font = '12px "Courier New", monospace';
  ctx.textAlign = 'left';
  ctx.fillText(`Date     : ${dateStr}`, PAD, y);
  ctx.textAlign = 'right';
  ctx.fillText(timeStr, W - PAD, y); y += 20;

  ctx.textAlign = 'left';
  ctx.fillText(`Client   : ${clientName}`, PAD, y); y += 18;
  ctx.fillText(`Vendeur  : ${vendorName}`, PAD, y); y += 18;

  dash(ctx, PAD, y, W - PAD); y += 14;

  // Column headers
  ctx.fillStyle = '#aaa';
  ctx.font = 'bold 10px "Courier New", monospace';
  ctx.textAlign = 'left';  ctx.fillText('ARTICLE', PAD, y);
  ctx.textAlign = 'center'; ctx.fillText('QTÉ', W / 2, y);
  ctx.textAlign = 'right';  ctx.fillText('MONTANT', W - PAD, y); y += 5;
  dash(ctx, PAD, y, W - PAD); y += 13;

  // Items
  for (const item of items) {
    ctx.fillStyle = '#1a1a1a';
    ctx.font = '13px "Courier New", monospace';
    ctx.textAlign = 'left';
    ctx.fillText(item.name, PAD, y);
    ctx.fillStyle = '#666';
    ctx.font = '12px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`×${item.qty}`, W / 2, y);
    ctx.fillStyle = '#1a1a1a';
    ctx.font = '13px "Courier New", monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`$${item.price * item.qty}`, W - PAD, y);
    y += IH;
  }

  dash(ctx, PAD, y, W - PAD); y += 14;

  // Total
  ctx.fillStyle = '#1a0f2e';
  ctx.font = 'bold 16px "Courier New", monospace';
  ctx.textAlign = 'left';  ctx.fillText('TOTAL', PAD, y);
  ctx.textAlign = 'right'; ctx.fillText(`$${total}`, W - PAD, y); y += 32;

  // Points
  if (hasPoints) {
    ctx.fillStyle = '#7c3aed';
    ctx.font = 'bold 11px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`\u2605 +${pointsEarned} points fidelite credites`, W / 2, y); y += 28;
  }

  dash(ctx, PAD, y, W - PAD); y += 13;

  // Invoice
  ctx.fillStyle = '#7c3aed';
  ctx.font = 'bold 10px "Courier New", monospace';
  ctx.textAlign = 'center';
  ctx.fillText(`N\u00b0 Facture : ${invoiceNumber}`, W / 2, y); y += 20;

  // Thank you
  ctx.fillStyle = '#bbb';
  ctx.font = '10px "Courier New", monospace';
  ctx.fillText('Merci pour votre achat !', W / 2, y); y += 14;

  // Bottom stripe
  ctx.fillStyle = '#6d28d9';
  ctx.fillRect(12, H - 7, W - 24, 7);

  return new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
}

function generateInvoiceNumber() {
  const d = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const r = String(Math.floor(1000 + Math.random() * 9000));
  return `PCBD-${d}-${r}`;
}

/* ── Icons ── */
function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}
function CopyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
    </svg>
  );
}
function LinkIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
    </svg>
  );
}

/* ── Component ── */
export default function PhysicalSaleModal({ onClose, members, vendorName, getToken, onSaleCreated }) {
  const [step, setStep] = useState(1);
  const [hasAccount, setHasAccount] = useState(null);
  const [memberSearch, setMemberSearch] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);
  const [guestFirst, setGuestFirst] = useState('');
  const [guestLast, setGuestLast] = useState('');
  const [quantities, setQuantities] = useState({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); // { receiptUrl, invoiceNumber }
  const [copied, setCopied] = useState(null); // 'link' | 'invoice'
  const searchRef = useRef(null);

  const filteredMembers = memberSearch.trim().length >= 1
    ? (members || []).filter(m => {
        const q = memberSearch.toLowerCase();
        return (m.username || '').toLowerCase().includes(q) || (m.rp_name || '').toLowerCase().includes(q);
      }).slice(0, 6)
    : [];

  const total = PRODUCTS.reduce((s, p) => s + (quantities[p.id] || 0) * p.price, 0);
  const selectedItems = PRODUCTS
    .filter(p => (quantities[p.id] || 0) > 0)
    .map(p => ({ name: p.name, qty: quantities[p.id], price: p.price }));

  const clientName = hasAccount
    ? (selectedMember?.rp_name || selectedMember?.username || '')
    : `${guestFirst} ${guestLast}`.trim();

  const canNext = hasAccount === false
    ? (guestFirst.trim() || guestLast.trim()).length > 0
    : hasAccount === true
    ? selectedMember !== null
    : false;

  function changeQty(id, delta) {
    setQuantities(prev => {
      const v = Math.max(0, (prev[id] || 0) + delta);
      return v === 0 ? (({ [id]: _, ...rest }) => rest)(prev) : { ...prev, [id]: v };
    });
  }

  async function handleConfirm() {
    if (!selectedItems.length) return;
    setLoading(true);

    const invoiceNumber = generateInvoiceNumber();
    const now = new Date().toISOString();
    const pointsEarned = hasAccount && selectedMember ? total : 0;

    let receiptBase64 = null;
    try {
      const blob = await generateReceiptBlob({
        items: selectedItems,
        total,
        clientName: clientName || 'Client',
        vendorName: vendorName || 'Vendeur',
        createdAt: now,
        pointsEarned,
        invoiceNumber,
      });
      receiptBase64 = await new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });
    } catch (e) {
      console.error('Receipt generation error:', e);
    }

    try {
      const token = getToken ? await getToken() : null;
      const res = await fetch(`${BACKEND_URL}/api/physical-sales`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          clientType: hasAccount ? 'account' : 'guest',
          discordId: hasAccount ? (selectedMember?.discord_id || null) : null,
          clientName: clientName || 'Client',
          items: selectedItems,
          total,
          invoiceNumber,
          receiptBase64,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setResult({ receiptUrl: json.receiptUrl, invoiceNumber });
      setStep(3);
      onSaleCreated && onSaleCreated({ ...json, clientName, vendorName, items: selectedItems, total, createdAt: now });
    } catch (e) {
      console.error('Physical sale error:', e);
      alert('Erreur lors de la création de la vente. Vérifiez la console.');
    } finally {
      setLoading(false);
    }
  }

  async function copyText(text, key) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    } catch { /* ignore */ }
  }

  return (
    <div className={s.overlay} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={s.modal}>
        {/* Header */}
        <div className={s.header}>
          <div className={s.headerLeft}>
            <span className={s.headerTitle}>
              {step === 3 ? '✓ Vente confirmée' : 'Nouvelle vente physique'}
            </span>
            {step < 3 && (
              <div className={s.steps}>
                {[1, 2].map(i => (
                  <span key={i} className={`${s.stepDot} ${step >= i ? s.stepDotActive : ''}`} />
                ))}
                <span className={s.stepLabel}>Étape {step}/2</span>
              </div>
            )}
          </div>
          <button className={s.closeBtn} onClick={onClose}>✕</button>
        </div>

        {/* ── Step 1: Client ── */}
        {step === 1 && (
          <div className={s.body}>
            <p className={s.question}>Le client a-t-il un compte sur l'espace client ?</p>

            <div className={s.accountChoice}>
              <button
                className={`${s.choiceBtn} ${hasAccount === true ? s.choiceBtnActive : ''}`}
                onClick={() => { setHasAccount(true); setSelectedMember(null); setMemberSearch(''); setTimeout(() => searchRef.current?.focus(), 50); }}
              >
                <span className={s.choiceBtnIcon}>✓</span>
                <span className={s.choiceBtnLabel}>Oui, il a un compte</span>
                <span className={s.choiceBtnSub}>Points crédités automatiquement</span>
              </button>
              <button
                className={`${s.choiceBtn} ${hasAccount === false ? s.choiceBtnActive : ''}`}
                onClick={() => { setHasAccount(false); setSelectedMember(null); setMemberSearch(''); }}
              >
                <span className={s.choiceBtnIcon}>✗</span>
                <span className={s.choiceBtnLabel}>Non, client sans compte</span>
                <span className={s.choiceBtnSub}>Vente anonyme ou avec nom</span>
              </button>
            </div>

            {hasAccount === true && (
              <div className={s.searchSection}>
                <label className={s.fieldLabel}>Rechercher le client</label>
                <input
                  ref={searchRef}
                  type="text"
                  className={s.searchInput}
                  placeholder="Pseudo Discord ou nom RP..."
                  value={memberSearch}
                  onChange={e => { setMemberSearch(e.target.value); setSelectedMember(null); }}
                />
                {filteredMembers.length > 0 && !selectedMember && (
                  <div className={s.memberDropdown}>
                    {filteredMembers.map(m => (
                      <button key={m.discord_id} className={s.memberOption} onClick={() => { setSelectedMember(m); setMemberSearch(m.rp_name || m.username || ''); }}>
                        {m.avatar_url
                          ? <img src={m.avatar_url} alt="" className={s.memberAvatar} />
                          : <div className={s.memberAvatarFallback}>{(m.username || '?')[0].toUpperCase()}</div>
                        }
                        <div className={s.memberOptionInfo}>
                          <span className={s.memberOptionName}>{m.rp_name || m.username}</span>
                          {m.rp_name && <span className={s.memberOptionSub}>@{m.username}</span>}
                        </div>
                        <span className={s.memberOptionPts}>{m.loyalty_points ?? 0} pts</span>
                      </button>
                    ))}
                  </div>
                )}
                {selectedMember && (
                  <div className={s.selectedMember}>
                    {selectedMember.avatar_url
                      ? <img src={selectedMember.avatar_url} alt="" className={s.memberAvatar} />
                      : <div className={s.memberAvatarFallback}>{(selectedMember.username || '?')[0].toUpperCase()}</div>
                    }
                    <div className={s.selectedMemberInfo}>
                      <span className={s.selectedMemberName}>{selectedMember.rp_name || selectedMember.username}</span>
                      <span className={s.selectedMemberSub}>{selectedMember.loyalty_points ?? 0} pts • Achat = +{total > 0 ? total : '?'} pts</span>
                    </div>
                    <button className={s.clearMember} onClick={() => { setSelectedMember(null); setMemberSearch(''); }}>✕</button>
                  </div>
                )}
              </div>
            )}

            {hasAccount === false && (
              <div className={s.guestSection}>
                <label className={s.fieldLabel}>Identité du client (optionnel)</label>
                <div className={s.nameRow}>
                  <input type="text" className={s.nameInput} placeholder="Prénom" value={guestFirst} onChange={e => setGuestFirst(e.target.value)} />
                  <input type="text" className={s.nameInput} placeholder="Nom" value={guestLast} onChange={e => setGuestLast(e.target.value)} />
                </div>
              </div>
            )}

            <div className={s.footer}>
              <button className={s.cancelBtn} onClick={onClose}>Annuler</button>
              <button
                className={s.nextBtn}
                onClick={() => setStep(2)}
                disabled={!canNext}
              >
                Suivant →
              </button>
            </div>
          </div>
        )}

        {/* ── Step 2: Products ── */}
        {step === 2 && (
          <div className={s.body}>
            <p className={s.question}>
              Sélectionner les produits achetés
              <span className={s.clientTag}>{clientName || 'Client'}</span>
            </p>

            <div className={s.productList}>
              {PRODUCTS.map(p => {
                const qty = quantities[p.id] || 0;
                return (
                  <div key={p.id} className={`${s.productRow} ${qty > 0 ? s.productRowActive : ''}`}>
                    <div className={s.productInfo}>
                      <span className={s.productName}>{p.name}</span>
                      <span className={s.productStrain}>{p.strain}</span>
                    </div>
                    <span className={s.productPrice}>${p.price}</span>
                    <div className={s.qtyControl}>
                      <button className={s.qtyBtn} onClick={() => changeQty(p.id, -1)} disabled={qty === 0}>−</button>
                      <span className={`${s.qtyNum} ${qty > 0 ? s.qtyNumActive : ''}`}>{qty}</span>
                      <button className={s.qtyBtn} onClick={() => changeQty(p.id, 1)}>+</button>
                    </div>
                  </div>
                );
              })}
            </div>

            {total > 0 && (
              <div className={s.totalBar}>
                <span className={s.totalLabel}>Total</span>
                <span className={s.totalAmount}>${total}</span>
                {hasAccount && selectedMember && (
                  <span className={s.pointsPreview}>+{total} pts pour {selectedMember.rp_name || selectedMember.username}</span>
                )}
              </div>
            )}

            <div className={s.footer}>
              <button className={s.cancelBtn} onClick={() => setStep(1)}>← Retour</button>
              <button
                className={s.confirmBtn}
                onClick={handleConfirm}
                disabled={!selectedItems.length || loading}
              >
                {loading ? (
                  <span className={s.loadingRow}><span className={s.spinner} /> Génération...</span>
                ) : (
                  '✓ Confirmer la vente'
                )}
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Result ── */}
        {step === 3 && result && (
          <div className={s.body}>
            <div className={s.successBadge}><CheckIcon /> Vente enregistrée avec succès</div>

            {result.receiptUrl && (
              <div className={s.receiptPreview}>
                <div className={s.receiptPreviewLabel}>Aperçu du ticket</div>
                <div className={s.receiptImageWrap}>
                  <img src={result.receiptUrl} alt="Ticket de caisse" className={s.receiptImg} />
                </div>
              </div>
            )}

            <div className={s.resultFields}>
              {result.receiptUrl && (
                <div className={s.resultField}>
                  <span className={s.resultFieldLabel}><LinkIcon /> Lien direct du ticket</span>
                  <div className={s.resultFieldRow}>
                    <input className={s.resultInput} value={result.receiptUrl} readOnly />
                    <button
                      className={`${s.copyBtn} ${copied === 'link' ? s.copyBtnDone : ''}`}
                      onClick={() => copyText(result.receiptUrl, 'link')}
                    >
                      {copied === 'link' ? <><CheckIcon /> Copié</> : <><CopyIcon /> Copier</>}
                    </button>
                  </div>
                </div>
              )}
              <div className={s.resultField}>
                <span className={s.resultFieldLabel}>N° Facture</span>
                <div className={s.resultFieldRow}>
                  <input className={s.resultInput} value={result.invoiceNumber} readOnly />
                  <button
                    className={`${s.copyBtn} ${copied === 'invoice' ? s.copyBtnDone : ''}`}
                    onClick={() => copyText(result.invoiceNumber, 'invoice')}
                  >
                    {copied === 'invoice' ? <><CheckIcon /> Copié</> : <><CopyIcon /> Copier</>}
                  </button>
                </div>
              </div>
            </div>

            <div className={s.footer}>
              <button className={s.confirmBtn} onClick={onClose}>Fermer</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
