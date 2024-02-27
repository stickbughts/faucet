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
      case "fetch":
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
            `Hello Saucy explorer, you have used /fetch already today, try again in ${hrs} hours and ${mins} minutes.`
          );
          break;
        } else {
          const isAssociated = await tokenAssociationCheck(accountId);
          if (!isAssociated) {
            interaction.reply(
              `You have not associated Sauce Inu: ${config.HEDERA_TOKEN_ID}`
            );
            break;
          }

          // Call the nftCheck function with the account ID
          const { isNftOwner, serials } = await nftCheck(accountId);

          // If the user doesn't own any NFTs, send a reply and break
          if (!isNftOwner) {
            interaction.reply(
              `You do not own the FLAGSHIP V2 NFT :  ${config.NFT_ID}`
            );
            break;
          }

          let unclaimedNFT = null;

          // Loop through each serial number owned by the user
          for (let serial of serials) {
            // Query the database for the serial number
            let { data, error } = await supabase
              .from("serials")
              .select("serial")
              .eq("serial", serial);

            // If there's an error, log it, send a reply, and break
            if (error) {
              console.error(`NFT serial query Error: ${error.data}`);
              interaction.reply(`Something went wrong - try again!`);
              break;
            }
            // If the serial number isn't in the database (i.e., it hasn't claimed the faucet yet),
            // set unclaimedNFT to the serial number and break the loop
            else if (data.length === 0) {
              unclaimedNFT = serial;

              break;
            }
          }

          // If no unclaimed NFT was found, send a reply and break
          if (!unclaimedNFT) {
            const { hrs, mins } = getResetTime();
            interaction.reply(
              `All your NFTs have already claimed the faucet. Check back in  ${hrs} hours and ${mins} minutes.`
            );
            break;
          }

          // Defer the reply to prevent the interaction from failing due to a timeout
          await interaction.deferReply();

          // Pay out the token to the account
          await tokenPayout(accountId);

          // Record the transaction in the "pulls" table in the database
          await supabase.from("pulls").insert([{ accountId }]);

          // Insert the unclaimed NFT's serial number into the "serials" table to indicate that it has claimed the faucet
          let { supaError } = await supabase
            .from("serials")
            .insert([{ serial: unclaimedNFT }]);

          // If there's an error, log it
          if (supaError) {
            console.error(`Serial push into table Error: ${supaError.message}`);
          }

          // Edit the reply to the user to indicate that the token has been successfully pulled
          interaction.editReply(
            `Congratulations you’ve received FLAGSHIP V2 rewards +10 SauceInu was sent to your linked account. See you tomorrow.`
          );
          break;
          // ...
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
