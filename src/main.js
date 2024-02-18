import { Client as DiscordClient, IntentsBitField } from "discord.js";
import { tokenPayout, tokenAssociationCheck, nftCheck } from "./hedera.js";
import { registerCommands } from "./commands.js";
import { supabase } from "./db.js";
import { clearTableEvery24Hours } from "./cronjob.js";
import * as config from "../config.js";

const discordBot = new DiscordClient({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});

discordBot.on("ready", (c) => {
  console.log(`${c.user.tag} has logged in`);
  registerCommands();
});

discordBot.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  try {
    switch (interaction.commandName) {
      case "pull":
        const accountId = interaction.options.get("account-id").value;
        // Checks against accountId including:
        // Null or Empty Check, Length Check
        // Regex Check for 0.0.1234567... format
        if (
          !accountId ||
          accountId.length > 32 ||
          !/^\d{1}\.\d{1}\.\d{2,16}$/.test(accountId)
        ) {
          interaction.reply(`That account ID is not valid.`);
          break;
        }
        let { data, error } = await supabase
          .from("pulls")
          .select("accountId")
          .eq("accountId", accountId);
        if (error || data.length > 1) {
          console.error(`Account pull query Error: ${error.data}`);
          console.error(`Data: ${data}`);
          interaction.reply(`Something went wrong - try again!`);
          break;
        } else if (data.length === 1) {
          const { hrs, mins } = getResetTime();
          interaction.reply(
            `Your allotment of token was given, check back in ${hrs} hours and ${mins} minutes.`
          );
          break;
        } else {
          const isAssociated = await tokenAssociationCheck(accountId);
          if (!isAssociated) {
            interaction.reply(
              `You have not associated with the token ID: ${config.HEDERA_TOKEN_ID}`
            );
            break;
          }

          const { isNftOwner, serial } = await nftCheck(accountId);
          if (!isNftOwner) {
            interaction.reply(
              `You do not own the NFT with ID: ${config.NFT_ID}`
            );
            break;
          }

          let { data, error } = await supabase
            .from("serials")
            .select("serial")
            .eq("serial", serial);

          if (error) {
            console.error(`NFT serial query Error: ${error.data}`);
            interaction.reply(`Something went wrong - try again!`);
            break;
          } else if (data.length > 0) {
            const { hrs, mins } = getResetTime();
            interaction.reply(
              `This NFT has already claimed the faucet. Check back in  ${hrs} hours and ${mins} minutes.`
            );
            break;
          }

          await interaction.deferReply();
          await tokenPayout(accountId);
          await supabase.from("pulls").insert([{ accountId }]);
          let { supaError } = await supabase
            .from("serials")
            .insert([{ serial }]);
          if (supaError) {
            console.error(`Serial push into table Error: ${supaError.message}`);
          }
          interaction.editReply(`Token pulled succesfully.`);
          break;
        }
      default:
        interaction.reply(`I don't know that command!`);
        break;
    }
  } catch (e) {
    console.error(e);
  }
});

const getResetTime = () => {
  const resetTime =
    24 * 60 - Math.floor((new Date().getTime() / (1000 * 60)) % (24 * 60));
  const hrs = Math.floor(resetTime / 60);
  const mins = Math.floor(resetTime % 60);
  return { hrs, mins };
};

clearTableEvery24Hours();
discordBot.login(config.DISCORD_TOKEN);
