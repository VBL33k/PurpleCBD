const { Client, GatewayIntentBits, Events } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
  ],
});

client.once(Events.ClientReady, (c) => {
  console.log(`Bot connecté : ${c.user.tag}`);
});

client.login(process.env.DISCORD_BOT_TOKEN);
