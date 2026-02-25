const USER_KEY = 'purple_cbd_user';
const RP_NAMES_KEY = 'purple_cbd_rp_names'; // persisté même après logout, indexé par discordId

function getSavedRpName(discordId) {
  try {
    const data = localStorage.getItem(RP_NAMES_KEY);
    return data ? JSON.parse(data)[discordId] || null : null;
  } catch { return null; }
}

function saveRpName(discordId, rpName) {
  try {
    const data = localStorage.getItem(RP_NAMES_KEY);
    const names = data ? JSON.parse(data) : {};
    names[discordId] = rpName;
    localStorage.setItem(RP_NAMES_KEY, JSON.stringify(names));
  } catch {}
}

export function getDiscordLoginUrl() {
  const clientId = import.meta.env.VITE_DISCORD_CLIENT_ID;
  const redirectUri = `${window.location.origin}/auth/callback`;
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'identify',
  });
  return `https://discord.com/oauth2/authorize?${params}`;
}

export function storeUser(user) {
  // Restaure automatiquement le rpName sauvegardé pour cet utilisateur
  if (user.discordId && !user.rpName) {
    const saved = getSavedRpName(user.discordId);
    if (saved) user.rpName = saved;
  }
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getStoredUser() {
  try {
    const data = localStorage.getItem(USER_KEY);
    return data ? JSON.parse(data) : null;
  } catch { return null; }
}

export function clearUser() {
  localStorage.removeItem(USER_KEY);
  // On ne touche pas purple_cbd_rp_names — le rpName survit au logout
}

export function updateStoredUser(updates) {
  const user = getStoredUser();
  if (!user) return;
  // Si on met à jour le rpName, on le persiste séparément aussi
  if (updates.rpName && user.discordId) {
    saveRpName(user.discordId, updates.rpName);
  }
  localStorage.setItem(USER_KEY, JSON.stringify({ ...user, ...updates }));
}
