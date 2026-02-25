import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';

const app = express();
const PORT = process.env.PORT || 3001;

// ── Supabase Admin (service role — ne jamais exposer au frontend) ──
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// ── Middleware ──
app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── Health check ──
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'Purple CBD API', version: '1.0.0' });
});

// ── Auth routes (placeholder) ──
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Identifiant et mot de passe requis.' });
  res.status(501).json({ message: 'Authentification non encore implémentée.' });
});

app.post('/api/auth/register', (req, res) => {
  const { username, fullName, password } = req.body;
  if (!username || !fullName || !password) return res.status(400).json({ error: 'Tous les champs sont requis.' });
  res.status(501).json({ message: 'Inscription non encore implémentée.' });
});

// ── Discord OAuth Manuel ──
app.post('/api/auth/discord/callback', async (req, res) => {
  const { code, redirectUri } = req.body;
  if (!code || !redirectUri) return res.status(400).json({ error: 'code et redirectUri requis.' });

  const clientId = process.env.DISCORD_CLIENT_ID;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return res.status(500).json({ error: 'Discord OAuth non configuré côté serveur.' });
  }

  try {
    const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenRes.ok) {
      console.error('Discord token error:', await tokenRes.text());
      return res.status(400).json({ error: 'Échange de code Discord échoué.' });
    }

    const { access_token } = await tokenRes.json();

    const userRes = await fetch('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    if (!userRes.ok) return res.status(400).json({ error: 'Impossible de récupérer les infos Discord.' });

    const discordUser = await userRes.json();
    const avatarUrl = discordUser.avatar
      ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
      : `https://cdn.discordapp.com/embed/avatars/${Number(BigInt(discordUser.id) % 5n)}.png`;

    res.json({
      discordId: discordUser.id,
      username: discordUser.global_name || discordUser.username,
      avatarUrl,
    });
  } catch (err) {
    console.error('Erreur Discord OAuth:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// ── Enregistrement membre ──
// Sauvegarde en DB + notifie le bot (nouveaux membres seulement)
app.post('/api/members/register', async (req, res) => {
  const { discordId, username, avatarUrl, rpName } = req.body;
  if (!discordId || !rpName) return res.status(400).json({ error: 'discordId et rpName requis.' });

  // Vérifie si le membre existe déjà
  const { data: existing } = await supabase
    .from('members')
    .select('id')
    .eq('discord_id', discordId)
    .maybeSingle();

  const isNew = !existing;

  // Upsert (insert ou update si discord_id existe déjà)
  const { error } = await supabase.from('members').upsert({
    discord_id: discordId,
    username,
    avatar_url: avatarUrl,
    rp_name: rpName,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'discord_id' });

  if (error) {
    console.error('Supabase upsert error:', error);
    return res.status(500).json({ error: 'Erreur sauvegarde membre.' });
  }

  // Notifie le bot Discord uniquement à la première inscription
  if (isNew) {
    try {
      await fetch(`${process.env.BOT_URL}/notify/new-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, discordId, avatarUrl, rpName }),
      });
    } catch (err) {
      console.error('Bot notification error:', err);
    }
  }

  res.json({ ok: true, isNew });
});

// ── Liste des membres (admin uniquement) ──
app.get('/api/members', async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'Non autorisé.' });

  // Valide le JWT Supabase de l'admin
  const { data: { user }, error: authError } = await supabase.auth.getUser(auth.slice(7));
  if (authError || !user) return res.status(401).json({ error: 'Token invalide.' });

  const { data, error } = await supabase
    .from('members')
    .select('discord_id, username, avatar_url, rp_name, loyalty_points, joined_at')
    .order('joined_at', { ascending: false });

  if (error) return res.status(500).json({ error: 'Erreur récupération membres.' });

  res.json({ members: data });
});

// ── Products ──
app.get('/api/products', (_req, res) => {
  res.json({
    products: [
      { id: 1, name: 'Purple Haze', strain: 'Sativa Dominante', badge: 'Signature' },
      { id: 2, name: 'OG Kush',     strain: 'Indica Dominante', badge: 'VIP Select' },
      { id: 3, name: 'Lemon Haze',  strain: 'Sativa Pure',      badge: 'Fresh Cut'  },
      { id: 4, name: 'Dark Devil',  strain: 'Hybrid Exclusive', badge: 'Ultra Rare' },
    ],
  });
});

// ── 404 fallback ──
app.use((_req, res) => {
  res.status(404).json({ error: 'Route non trouvée.' });
});

app.listen(PORT, () => {
  console.log(`Purple CBD API running on port ${PORT}`);
});
