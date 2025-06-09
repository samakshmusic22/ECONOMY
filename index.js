// --- Required Modules ---
const fs = require('fs');
const express = require('express');
const { Client, GatewayIntentBits, Collection } = require('discord.js');
require('dotenv').config();

// --- Express Server for UptimeRobot Ping ---
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('✅ Bot is alive!');
});

app.listen(port, () => {
  console.log(`🌐 Express server running at http://localhost:${port}`);
});

// 🔁 Self-ping to avoid sleep on free hosting (Render/Replit)
setInterval(() => {
  fetch('https://economy-x66r.onrender.com') // <-- replace with your actual render URL
    .then(() => console.log('🔁 Self-pinged to prevent sleeping.'))
    .catch(err => console.error('Ping failed:', err));
}, 4 * 60 * 1000); // every 4 minutes

// --- Discord Bot Setup ---
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.commands = new Collection();

// --- Load Commands Dynamically from ./commands folder ---
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

// --- Bot Ready Event ---
client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

// --- Handle Commands ---
client.on('messageCreate', message => {
  if (!message.content.startsWith(process.env.PREFIX) || message.author.bot) return;

  const args = message.content.slice(process.env.PREFIX.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  const command = client.commands.get(commandName);
  if (!command) return;

  try {
    command.execute(message, args);
  } catch (error) {
    console.error('❌ Error executing command:', error);
    message.reply('❌ There was an error executing that command!');
  }
});

// --- Login Bot ---
client.login(process.env.TOKEN);
