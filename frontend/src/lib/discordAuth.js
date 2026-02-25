const DISCORD_CLIENT_ID = import.meta.env.VITE_DISCORD_CLIENT_ID;

export function getDiscordLoginUrl() {
  const redirectUri = `${window.location.origin}/auth/callback`;
  const params = new URLSearchParams({
    client_id: DISCORD_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'identify',
  });
  return `https://discord.com/oauth2/authorize?${params}`;
}

export function storeUser(user) {
  localStorage.setItem('purple_cbd_user', JSON.stringify(user));
}

export function getStoredUser() {
  try {
    const data = localStorage.getItem('purple_cbd_user');
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function clearUser() {
  localStorage.removeItem('purple_cbd_user');
}

export function updateStoredUser(updates) {
  const user = getStoredUser();
  if (user) storeUser({ ...user, ...updates });
}
