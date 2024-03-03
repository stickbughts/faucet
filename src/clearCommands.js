import { REST } from "discord.js";
import { Routes } from "discord-api-types/v9";
import {
  DISCORD_CLIENT_ID,
  DISCORD_SERVER_ID,
  DISCORD_TOKEN,
} from "../config.js";

const rest = new REST({ version: "9" }).setToken(DISCORD_TOKEN);

(async () => {
  try {
    console.log("Started refreshing application (/) commands.");

    const commands = await rest.get(
      Routes.applicationGuildCommands(DISCORD_CLIENT_ID, DISCORD_SERVER_ID)
    );

    for (let command of commands) {
      await rest.delete(
        Routes.applicationGuildCommand(
          DISCORD_CLIENT_ID,
          DISCORD_SERVER_ID,
          command.id
        )
      );
    }

    console.log("Successfully reloaded application (/) commands.");
  } catch (error) {
    console.error(error);
  }
})();
