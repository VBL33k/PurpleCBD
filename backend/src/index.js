import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';

const app = express();
const PORT = process.env.PORT || 3001;

// ── Supabase Admin ──
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// ── Middleware ──
app.use(express.json({ limit: '5mb' }));
const ALLOWED_ORIGINS = new Set([
  process.env.FRONTEND_URL,
  'https://purplecbd.store',
  'https://www.purplecbd.store',
].filter(Boolean));

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || ALLOWED_ORIGINS.has(origin)) callback(null, true);
    else callback(new Error('CORS: Not allowed'));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── Helper: valide JWT admin Supabase ──
async function requireAdmin(req, res) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) { res.status(401).json({ error: 'Non autorisé.' }); return null; }
  const { data: { user }, error } = await supabase.auth.getUser(auth.slice(7));
  if (error || !user) { res.status(401).json({ error: 'Token invalide.' }); return null; }
  return user;
}

// ── Health ──
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'Purple CBD API', version: '1.0.0' });
});

// ── Discord notify ──
const DISCORD_CHANNEL_ID = '1476199936508039304';
const DISCORD_COLOR_PURPLE = 0x7C3AED;
const DISCORD_COLOR_GREEN  = 0x22C55E;
const DISCORD_COLOR_RED    = 0xEF4444;
const DISCORD_COLOR_ORANGE = 0xF97316;
const DISCORD_FOOTER       = { text: 'Purple CBD — Espace Client' };

async function sendDiscordEmbed(embed) {
  const token = process.env.DISCORD_BOT_TOKEN;
  if (!token) { console.log('[Discord notify skipped — no DISCORD_BOT_TOKEN]'); return; }
  try {
    const res = await fetch(`https://discord.com/api/v10/channels/${DISCORD_CHANNEL_ID}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bot ${token}` },
      body: JSON.stringify({ embeds: [{ ...embed, footer: DISCORD_FOOTER, timestamp: new Date().toISOString() }] }),
    });
    if (!res.ok) console.error('Discord API error:', await res.text());
  } catch (err) { console.error('Discord send error:', err); }
}

// ── Discord OAuth ──
app.post('/api/auth/discord/callback', async (req, res) => {
  const { code, redirectUri } = req.body;
  if (!code || !redirectUri) return res.status(400).json({ error: 'code et redirectUri requis.' });

  const clientId = process.env.DISCORD_CLIENT_ID;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET;
  if (!clientId || !clientSecret) return res.status(500).json({ error: 'Discord OAuth non configuré.' });

  try {
    const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ client_id: clientId, client_secret: clientSecret, grant_type: 'authorization_code', code, redirect_uri: redirectUri }),
    });
    if (!tokenRes.ok) { console.error('Discord token error:', await tokenRes.text()); return res.status(400).json({ error: 'Échange de code Discord échoué.' }); }
    const { access_token } = await tokenRes.json();
    const userRes = await fetch('https://discord.com/api/users/@me', { headers: { Authorization: `Bearer ${access_token}` } });
    if (!userRes.ok) return res.status(400).json({ error: 'Impossible de récupérer les infos Discord.' });
    const discordUser = await userRes.json();
    const avatarUrl = discordUser.avatar
      ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
      : `https://cdn.discordapp.com/embed/avatars/${Number(BigInt(discordUser.id) % 5n)}.png`;
    res.json({ discordId: discordUser.id, username: discordUser.global_name || discordUser.username, avatarUrl });
  } catch (err) {
    console.error('Erreur Discord OAuth:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// ── Membres ──
app.post('/api/members/register', async (req, res) => {
  const { discordId, username, avatarUrl, rpName } = req.body;
  if (!discordId || !rpName) return res.status(400).json({ error: 'discordId et rpName requis.' });

  // ── Vérification ban ──
  const { data: existing } = await supabase
    .from('members')
    .select('id, banned, ban_message, rp_name')
    .eq('discord_id', discordId)
    .maybeSingle();

  if (existing?.banned) {
    return res.status(403).json({
      error: 'banned',
      message: existing.ban_message || 'Votre compte a été banni. Contactez l\'administration.',
    });
  }

  // "Nouveau" si jamais inscrit, ou si rp_name a été effacé (reset)
  const isNew = !existing || !existing.rp_name;

  const { error } = await supabase.from('members').upsert(
    { discord_id: discordId, username, avatar_url: avatarUrl, rp_name: rpName, updated_at: new Date().toISOString() },
    { onConflict: 'discord_id' }
  );
  if (error) { console.error('Supabase upsert error:', error); return res.status(500).json({ error: 'Erreur sauvegarde membre.' }); }

  // ── Notification Discord nouveau membre (direct via bot token) ──
  if (isNew) {
    sendDiscordEmbed({
      title: '👤 Nouveau membre inscrit',
      color: DISCORD_COLOR_PURPLE,
      thumbnail: avatarUrl ? { url: avatarUrl } : undefined,
      fields: [
        { name: 'Pseudo Discord', value: username || 'Inconnu', inline: true },
        { name: 'Nom RP',         value: rpName,                inline: true },
        { name: 'ID Discord',     value: `\`${discordId}\``,    inline: false },
      ],
    }).catch(() => {});
  }

  res.json({ ok: true, isNew });
});

// Vérification ban (utilisée côté client au chargement)
app.get('/api/members/check', async (req, res) => {
  const { discord_id } = req.query;
  if (!discord_id) return res.status(400).json({ error: 'discord_id requis.' });

  const [memberResult, ordersResult] = await Promise.all([
    supabase.from('members').select('banned, ban_message, rp_name, loyalty_points').eq('discord_id', discord_id).maybeSingle(),
    supabase.from('orders').select('order_type, points_earned, points_cost, status').eq('discord_id', discord_id),
  ]);
  const data   = memberResult.data;
  const orders = ordersResult.data || [];

  if (data?.banned) {
    return res.json({ banned: true, message: data.ban_message || 'Votre compte a été banni.' });
  }

  const pendingPoints = orders
    .filter(o => o.order_type === 'regular' && !['delivered', 'picked_up', 'cancelled'].includes(o.status))
    .reduce((sum, o) => sum + (o.points_earned || 0), 0);
  const totalSpent = orders
    .filter(o => o.order_type === 'loyalty')
    .reduce((sum, o) => sum + (o.points_cost || 0), 0);

  res.json({ banned: false, rpName: data?.rp_name || null, loyaltyPoints: data?.loyalty_points ?? 0, pendingPoints, totalSpent });
});

app.get('/api/members', async (req, res) => {
  const user = await requireAdmin(req, res);
  if (!user) return;
  const { data, error } = await supabase
    .from('members')
    .select('discord_id, username, avatar_url, rp_name, loyalty_points, joined_at, banned, ban_message')
    .order('joined_at', { ascending: false });
  if (error) return res.status(500).json({ error: 'Erreur récupération membres.' });
  res.json({ members: data });
});

// Reset compte membre (pts + commandes + nom RP)
app.post('/api/members/:discordId/reset', async (req, res) => {
  const user = await requireAdmin(req, res);
  if (!user) return;
  const { discordId } = req.params;
  await supabase.from('orders').delete().eq('discord_id', discordId);
  const { error } = await supabase
    .from('members')
    .update({ loyalty_points: 0, rp_name: null, updated_at: new Date().toISOString() })
    .eq('discord_id', discordId);
  if (error) return res.status(500).json({ error: 'Erreur reset.' });
  res.json({ ok: true });
});

// Ban / unban membre
app.post('/api/members/:discordId/ban', async (req, res) => {
  const user = await requireAdmin(req, res);
  if (!user) return;
  const { discordId } = req.params;
  const { banned, banMessage } = req.body;
  const { error } = await supabase
    .from('members')
    .update({ banned: banned ?? true, ban_message: banMessage || null, updated_at: new Date().toISOString() })
    .eq('discord_id', discordId);
  if (error) return res.status(500).json({ error: 'Erreur ban.' });
  res.json({ ok: true });
});

// Modifier points de fidélité
app.patch('/api/members/:discordId/points', async (req, res) => {
  const user = await requireAdmin(req, res);
  if (!user) return;
  const { discordId } = req.params;
  const { points } = req.body;
  if (typeof points !== 'number' || points < 0) return res.status(400).json({ error: 'points invalide.' });
  const { error } = await supabase
    .from('members')
    .update({ loyalty_points: points, updated_at: new Date().toISOString() })
    .eq('discord_id', discordId);
  if (error) return res.status(500).json({ error: 'Erreur mise à jour points.' });
  res.json({ ok: true });
});

// ── Settings ──
app.get('/api/settings', async (_req, res) => {
  const { data, error } = await supabase.from('settings').select('key, value');
  if (error) return res.status(500).json({ error: 'Erreur lecture paramètres.' });
  const settings = Object.fromEntries(data.map(r => [r.key, r.value === 'true']));
  res.json(settings);
});

app.put('/api/settings', async (req, res) => {
  const user = await requireAdmin(req, res);
  if (!user) return;
  const { delivery_enabled, store_open } = req.body;
  const updates = [];
  if (delivery_enabled !== undefined) updates.push({ key: 'delivery_enabled', value: String(delivery_enabled) });
  if (store_open !== undefined) updates.push({ key: 'store_open', value: String(store_open) });
  if (!updates.length) return res.status(400).json({ error: 'Aucun paramètre fourni.' });
  for (const u of updates) {
    const { error } = await supabase.from('settings').upsert(u, { onConflict: 'key' });
    if (error) return res.status(500).json({ error: 'Erreur mise à jour paramètre.' });
  }

  // Discord notifications for settings changes
  if (store_open !== undefined) {
    sendDiscordEmbed({
      title: store_open ? '🟢 Boutique ouverte' : '🔴 Boutique fermée',
      color: store_open ? DISCORD_COLOR_GREEN : DISCORD_COLOR_RED,
      description: store_open
        ? 'La boutique est maintenant **ouverte**. Les clients peuvent passer commande.'
        : 'La boutique est maintenant **fermée**. Les commandes sont suspendues.',
    }).catch(() => {});
  }
  if (delivery_enabled !== undefined) {
    sendDiscordEmbed({
      title: delivery_enabled ? '🚗 Livraison activée' : '🚫 Livraison désactivée',
      color: delivery_enabled ? DISCORD_COLOR_GREEN : DISCORD_COLOR_ORANGE,
      description: delivery_enabled
        ? 'La livraison à domicile est maintenant **activée**.'
        : 'La livraison à domicile est maintenant **désactivée**. Retrait en magasin uniquement.',
    }).catch(() => {});
  }

  res.json({ ok: true });
});

// ── Commandes ──

// Créer une commande (client)
app.post('/api/orders', async (req, res) => {
  const { discordId, username, rpName, avatarUrl, items, total, deliveryType, address, notes } = req.body;
  if (!discordId || !items?.length) return res.status(400).json({ error: 'discordId et items requis.' });
  if (deliveryType === 'delivery' && !address?.trim()) return res.status(400).json({ error: 'Adresse requise pour la livraison.' });

  const pointsEarned = total; // 1 pt par dollar

  const { data, error } = await supabase.from('orders').insert({
    discord_id: discordId,
    username,
    rp_name: rpName,
    avatar_url: avatarUrl,
    items,
    total,
    delivery_type: deliveryType || 'pickup',
    address: address || null,
    notes: notes || null,
    status: 'pending',
    order_type: 'regular',
    points_earned: pointsEarned,
    points_cost: 0,
  }).select('id').single();

  if (error) { console.error('Order insert error:', error); return res.status(500).json({ error: 'Erreur création commande.' }); }

  // Discord notification — embed
  const ref       = data.id.slice(-6).toUpperCase();
  const itemsStr  = items.map(i => `**${i.name}** ×${i.qty}`).join('\n');
  const modeStr   = (deliveryType === 'delivery') ? '🚗 Livraison à domicile' : '🏪 Retrait en magasin';
  const embedFields = [
    { name: 'Réf. commande', value: `\`#${ref}\``,                   inline: true  },
    { name: 'Total',         value: `**$${total}**`,                  inline: true  },
    { name: 'Mode',          value: modeStr,                          inline: true  },
    { name: 'Client',        value: rpName  || username || 'Inconnu', inline: true  },
    { name: 'Pseudo Discord',value: username || 'Inconnu',            inline: true  },
    { name: 'ID Discord',    value: `\`${discordId}\``,               inline: true  },
    { name: 'Articles',      value: itemsStr,                         inline: false },
    { name: '⭐ Points à gagner', value: `**${pointsEarned} pts** (crédités à la remise)`, inline: false },
  ];
  if (address) embedFields.push({ name: '📍 Adresse', value: address, inline: false });
  if (notes)   embedFields.push({ name: '📝 Notes',   value: notes,   inline: false });

  sendDiscordEmbed({
    title: '🛒 Nouvelle commande',
    color: DISCORD_COLOR_PURPLE,
    thumbnail: avatarUrl ? { url: avatarUrl } : undefined,
    fields: embedFields,
  }).catch(() => {});

  res.json({ ok: true, orderId: data.id });
});

// Créer une commande fidélité (client)
app.post('/api/orders/loyalty', async (req, res) => {
  const { discordId, username, rpName, avatarUrl, items, deliveryType, address, notes } = req.body;
  if (!discordId || !items?.length) return res.status(400).json({ error: 'discordId et items requis.' });
  if (deliveryType === 'delivery' && !address?.trim()) return res.status(400).json({ error: 'Adresse requise pour la livraison.' });

  const pointsCost = items.reduce((sum, i) => sum + (i.qty * 100), 0);

  // Vérifier le solde
  const { data: member } = await supabase.from('members').select('loyalty_points').eq('discord_id', discordId).maybeSingle();
  if (!member || (member.loyalty_points ?? 0) < pointsCost) {
    return res.status(400).json({ error: 'Solde de points insuffisant.', needed: pointsCost, current: member?.loyalty_points ?? 0 });
  }

  const { data, error } = await supabase.from('orders').insert({
    discord_id: discordId,
    username,
    rp_name: rpName,
    avatar_url: avatarUrl,
    items,
    total: 0,
    delivery_type: deliveryType || 'pickup',
    address: address || null,
    notes: notes || null,
    status: 'pending',
    order_type: 'loyalty',
    points_cost: pointsCost,
    points_earned: 0,
  }).select('id').single();

  if (error) { console.error('Loyalty order error:', error); return res.status(500).json({ error: 'Erreur création commande.' }); }

  // Déduire les points
  await supabase.from('members')
    .update({ loyalty_points: member.loyalty_points - pointsCost, updated_at: new Date().toISOString() })
    .eq('discord_id', discordId);

  // Discord notification — embed fidélité
  const ref      = data.id.slice(-6).toUpperCase();
  const itemsStr = items.map(i => `**${i.name}** ×${i.qty}`).join('\n');
  const modeStr  = deliveryType === 'delivery' ? '🚗 Livraison à domicile' : '🏪 Retrait en magasin';
  const loyaltyFields = [
    { name: 'Réf. commande',   value: `\`#${ref}\``,                   inline: true  },
    { name: 'Points déduits',  value: `**${pointsCost} pts**`,          inline: true  },
    { name: 'Mode',            value: modeStr,                          inline: true  },
    { name: 'Client',          value: rpName || username || 'Inconnu',  inline: true  },
    { name: 'Pseudo Discord',  value: username || 'Inconnu',            inline: true  },
    { name: 'ID Discord',      value: `\`${discordId}\``,               inline: true  },
    { name: 'Articles',        value: itemsStr,                         inline: false },
  ];
  if (address) loyaltyFields.push({ name: '📍 Adresse', value: address, inline: false });
  if (notes)   loyaltyFields.push({ name: '📝 Notes',   value: notes,   inline: false });

  sendDiscordEmbed({
    title: '⭐ Commande fidélité',
    color: DISCORD_COLOR_ORANGE,
    thumbnail: avatarUrl ? { url: avatarUrl } : undefined,
    fields: loyaltyFields,
  }).catch(() => {});

  res.json({ ok: true, orderId: data.id, pointsCost });
});

// Liste toutes les commandes en ligne (admin) — exclut les ventes physiques
app.get('/api/orders', async (req, res) => {
  const user = await requireAdmin(req, res);
  if (!user) return;
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .neq('order_type', 'physical')
    .order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: 'Erreur récupération commandes.' });
  res.json({ orders: data });
});

// Commandes d'un client (par discord_id)
app.get('/api/orders/me', async (req, res) => {
  const { discord_id } = req.query;
  if (!discord_id) return res.status(400).json({ error: 'discord_id requis.' });
  const { data, error } = await supabase.from('orders').select('*').eq('discord_id', discord_id).order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: 'Erreur récupération commandes.' });
  res.json({ orders: data });
});

// Supprimer une commande
app.delete('/api/orders/:id', async (req, res) => {
  const user = await requireAdmin(req, res);
  if (!user) return;
  const { error } = await supabase.from('orders').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: 'Erreur suppression commande.' });
  res.json({ ok: true });
});

// Mettre à jour le statut d'une commande (admin)
app.patch('/api/orders/:id/status', async (req, res) => {
  const user = await requireAdmin(req, res);
  if (!user) return;
  const { status } = req.body;
  const validStatuses = ['pending', 'ready', 'delivered', 'picked_up', 'cancelled'];
  if (!validStatuses.includes(status)) return res.status(400).json({ error: 'Statut invalide.' });

  // Récupérer la commande pour gestion des points
  const { data: order } = await supabase
    .from('orders')
    .select('discord_id, order_type, points_earned, points_cost, status')
    .eq('id', req.params.id)
    .maybeSingle();

  const { error } = await supabase.from('orders').update({ status, updated_at: new Date().toISOString() }).eq('id', req.params.id);
  if (error) return res.status(500).json({ error: 'Erreur mise à jour statut.' });

  if (order) {
    const completedStatuses = ['delivered', 'picked_up'];
    const wasCompleted = completedStatuses.includes(order.status);

    // Commande régulière livrée/retirée → créditer les points
    if (order.order_type === 'regular' && completedStatuses.includes(status) && !wasCompleted) {
      const pts = order.points_earned || 0;
      if (pts > 0) {
        const { data: member } = await supabase.from('members').select('loyalty_points').eq('discord_id', order.discord_id).maybeSingle();
        if (member) {
          await supabase.from('members')
            .update({ loyalty_points: (member.loyalty_points ?? 0) + pts, updated_at: new Date().toISOString() })
            .eq('discord_id', order.discord_id);
        }
      }
    }

    // Commande régulière remise en attente depuis complétée → retirer les points (peut être négatif)
    if (order.order_type === 'regular' && wasCompleted && !completedStatuses.includes(status)) {
      const pts = order.points_earned || 0;
      if (pts > 0) {
        const { data: member } = await supabase.from('members').select('loyalty_points').eq('discord_id', order.discord_id).maybeSingle();
        if (member) {
          await supabase.from('members')
            .update({ loyalty_points: (member.loyalty_points ?? 0) - pts, updated_at: new Date().toISOString() })
            .eq('discord_id', order.discord_id);
        }
      }
    }

    // Commande fidélité annulée → rembourser les points
    if (order.order_type === 'loyalty' && status === 'cancelled' && order.status !== 'cancelled') {
      const pts = order.points_cost || 0;
      if (pts > 0) {
        const { data: member } = await supabase.from('members').select('loyalty_points').eq('discord_id', order.discord_id).maybeSingle();
        if (member) {
          await supabase.from('members')
            .update({ loyalty_points: (member.loyalty_points ?? 0) + pts, updated_at: new Date().toISOString() })
            .eq('discord_id', order.discord_id);
        }
      }
    }
  }

  res.json({ ok: true });
});

// ── Physical Sales ──

// Créer une vente physique (admin/vendeur)
app.post('/api/physical-sales', async (req, res) => {
  const user = await requireAdmin(req, res);
  if (!user) return;

  const { clientType, discordId, clientName, items, total, invoiceNumber, receiptBase64 } = req.body;
  if (!items?.length || !total || !invoiceNumber) {
    return res.status(400).json({ error: 'Données manquantes.' });
  }

  const vendorName = user.email?.split('@')[0] || 'Vendeur';
  const vendorUserId = user.id;
  const pointsEarned = clientType === 'account' && discordId ? total : 0;

  // Upload receipt to ImgBB
  const IMGBB_KEY = 'bb5c194616ba0824a34184c2e9faf5ba';
  let receiptUrl = null;
  if (receiptBase64) {
    try {
      const base64Data = receiptBase64.replace(/^data:image\/[a-z]+;base64,/, '');
      const body = new URLSearchParams();
      body.append('key', IMGBB_KEY);
      body.append('image', base64Data);
      body.append('name', invoiceNumber);
      const imgbbRes = await fetch('https://api.imgbb.com/1/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      });
      const imgbbJson = await imgbbRes.json();
      if (imgbbJson.success) {
        receiptUrl = imgbbJson.data.url;
      } else {
        console.error('ImgBB upload failed:', imgbbJson);
      }
    } catch (e) {
      console.error('ImgBB upload error:', e);
    }
  }

  // Create order record
  const { data, error } = await supabase.from('orders').insert({
    discord_id: clientType === 'account' ? (discordId || null) : null,
    username: clientType === 'account' ? clientName : null,
    rp_name: clientName,
    items,
    total,
    delivery_type: 'pickup',
    status: 'picked_up',
    order_type: 'physical',
    points_earned: pointsEarned,
    points_cost: 0,
    vendor_name: vendorName,
    vendor_user_id: vendorUserId,
    guest_name: clientType === 'guest' ? clientName : null,
    receipt_url: receiptUrl,
    invoice_number: invoiceNumber,
  }).select('id').single();

  if (error) { console.error('Physical sale insert error:', error); return res.status(500).json({ error: 'Erreur création vente.' }); }

  // Credit loyalty points immediately
  if (clientType === 'account' && discordId && pointsEarned > 0) {
    const { data: member } = await supabase.from('members').select('loyalty_points').eq('discord_id', discordId).maybeSingle();
    if (member) {
      await supabase.from('members')
        .update({ loyalty_points: (member.loyalty_points ?? 0) + pointsEarned, updated_at: new Date().toISOString() })
        .eq('discord_id', discordId);
    }
  }

  // Discord notification
  const ref = data.id.slice(-6).toUpperCase();
  const itemsStr = items.map(i => `**${i.name}** ×${i.qty}`).join('\n');
  const embedFields = [
    { name: '🏷️ Réf.',      value: `\`#${ref}\``,       inline: true },
    { name: '💰 Total',     value: `**$${total}**`,      inline: true },
    { name: '📄 Facture',   value: `\`${invoiceNumber}\``, inline: true },
    { name: '🧑‍💼 Vendeur', value: vendorName,            inline: true },
    { name: '👤 Client',    value: clientName || 'Anonyme', inline: true },
    { name: '📦 Articles',  value: itemsStr,              inline: false },
  ];
  if (pointsEarned > 0) embedFields.push({ name: '⭐ Points crédités', value: `**+${pointsEarned} pts**`, inline: true });
  if (receiptUrl) embedFields.push({ name: '🧾 Ticket', value: `[Voir le ticket](${receiptUrl})`, inline: false });

  sendDiscordEmbed({
    title: '🏪 Nouvelle Vente Physique',
    color: 0x8B5CF6,
    fields: embedFields,
  }).catch(() => {});

  res.json({ ok: true, orderId: data.id, receiptUrl, invoiceNumber });
});

// Lister les ventes physiques (admin/vendeur)
app.get('/api/physical-sales', async (req, res) => {
  const user = await requireAdmin(req, res);
  if (!user) return;
  // TODO: filter by vendor_user_id = user.id once per-vendor accounts exist
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('order_type', 'physical')
    .order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: 'Erreur récupération ventes.' });
  res.json({ sales: data });
});

// ── 404 ──
app.use((_req, res) => res.status(404).json({ error: 'Route non trouvée.' }));

app.listen(PORT, async () => {
  console.log(`Purple CBD API running on port ${PORT}`);
  // ── Auto-check schema ──
  const { error } = await supabase.from('members').select('banned').limit(0);
  if (error?.code === '42703') {
    console.error('\n╔════════════════════════════════════════════════════════════╗');
    console.error('║  ⚠️  MIGRATION REQUISE — colonnes manquantes               ║');
    console.error('╠════════════════════════════════════════════════════════════╣');
    console.error('║  Ouvre l\'éditeur SQL Supabase et exécute :                ║');
    console.error('║                                                             ║');
    console.error('║  ALTER TABLE members                                        ║');
    console.error('║    ADD COLUMN IF NOT EXISTS banned boolean                  ║');
    console.error('║      DEFAULT false NOT NULL,                                ║');
    console.error('║    ADD COLUMN IF NOT EXISTS ban_message text;               ║');
    console.error('║                                                             ║');
    console.error('║  URL: supabase.com/dashboard/project/                       ║');
    console.error('║       xkcpourzczanfdracack/sql/new                          ║');
    console.error('╚════════════════════════════════════════════════════════════╝\n');
  } else {
    console.log('✓ Schema OK — ban columns present');
  }
});
