import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

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

// ── Auth routes (placeholder — à connecter à une DB) ──
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Identifiant et mot de passe requis.' });
  }
  // TODO: vérifier contre la DB
  res.status(501).json({ message: 'Authentification non encore implémentée.' });
});

app.post('/api/auth/register', (req, res) => {
  const { username, fullName, password } = req.body;
  if (!username || !fullName || !password) {
    return res.status(400).json({ error: 'Tous les champs sont requis.' });
  }
  // TODO: créer l'utilisateur en DB
  res.status(501).json({ message: 'Inscription non encore implémentée.' });
});

// ── Internal dashboard (placeholder) ──
app.post('/api/internal/login', (req, res) => {
  const { agentId, code } = req.body;
  if (!agentId || !code) {
    return res.status(400).json({ error: 'ID agent et code requis.' });
  }
  // TODO: vérifier les credentials équipe
  res.status(501).json({ message: 'Accès interne non encore implémenté.' });
});

// ── Products (données statiques pour l'instant) ──
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
    // Échange code → access token
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
      const err = await tokenRes.text();
      console.error('Discord token error:', err);
      return res.status(400).json({ error: 'Échange de code Discord échoué.' });
    }

    const { access_token } = await tokenRes.json();

    // Récupération infos utilisateur Discord
    const userRes = await fetch('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    if (!userRes.ok) {
      return res.status(400).json({ error: 'Impossible de récupérer les infos Discord.' });
    }

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

// ── Notification nouveau client Discord ──
app.post('/api/notify/new-user', async (req, res) => {
  const { username, discordId, avatarUrl, rpName } = req.body;
  if (!discordId) return res.status(400).json({ error: 'discordId requis.' });

  try {
    const botRes = await fetch(`${process.env.BOT_URL}/notify/new-user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, discordId, avatarUrl, rpName }),
    });
    const data = await botRes.json();
    res.json(data);
  } catch (err) {
    console.error('Erreur appel bot:', err);
    res.status(500).json({ error: 'Impossible de contacter le bot.' });
  }
});

// ── 404 fallback ──
app.use((_req, res) => {
  res.status(404).json({ error: 'Route non trouvée.' });
});

app.listen(PORT, () => {
  console.log(`Purple CBD API running on port ${PORT}`);
});
