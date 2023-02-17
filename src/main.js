import { Client, IntentsBitField } from "discord.js";
import { registerCommands } from "./commands.js";
import * as config from "./config.js";

const pactBot = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});

const token = config.DISCORD_TOKEN;

pactBot.on("ready", (client) => {
  console.log(`${client.user.tag} has logged in`);
  registerCommands();
});

pactBot.on("interactionCreate", (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  switch (interaction.commandName) {
    case "pray":
      const accountId = interaction.options.get('account-id');
      interaction.reply(accountId.value);
      break;
    default:
      interaction.reply("I don't know that");
      break;
  }
});

pactBot.login(token);
