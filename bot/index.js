const { Client, GatewayIntentBits, Events, EmbedBuilder } = require('discord.js');
const http = require('http');

const CHANNEL_ID = '1145351530225074239';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
  ],
});

client.once(Events.ClientReady, (c) => {
  console.log(`Bot connecté : ${c.user.tag}`);
});

// Mini serveur HTTP pour recevoir les notifications du backend
const server = http.createServer((req, res) => {
  if (req.method !== 'POST' || req.url !== '/notify/new-user') {
    res.writeHead(404);
    res.end();
    return;
  }

  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', async () => {
    try {
      const { username, discordId, avatarUrl, rpName } = JSON.parse(body);
      const channel = await client.channels.fetch(CHANNEL_ID);

      const embed = new EmbedBuilder()
        .setColor(0x8B5CF6)
        .setTitle('🟣 Nouveau client inscrit')
        .setThumbnail(avatarUrl || null)
        .addFields(
          { name: 'Pseudo Discord', value: username || 'Inconnu', inline: true },
          { name: 'ID Discord', value: discordId || 'Inconnu', inline: true },
          { name: 'Nom RP', value: rpName || 'Non renseigné', inline: false },
        )
        .setTimestamp()
        .setFooter({ text: 'Purple CBD — Espace Client' });

      await channel.send({ embeds: [embed] });

      res.writeHead(200);
      res.end(JSON.stringify({ ok: true }));
    } catch (err) {
      console.error('Erreur notification:', err);
      res.writeHead(500);
      res.end(JSON.stringify({ error: err.message }));
    }
  });
});

server.listen(4000, () => {
  console.log('Bot HTTP server listening on port 4000');
});

client.login(process.env.DISCORD_BOT_TOKEN);
