import { Client as DiscordClient, IntentsBitField } from "discord.js";
import { tokenPayout, tokenAssociationCheck, nftCheck } from "./hedera.js";
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
});

discordBot.on("messageCreate", async (message) => {
  if (!message.content.startsWith("!fetch") || message.author.bot) return;

  const accountId = message.content.split(" ")[1];

  if (!accountId) {
    message.channel.send(`Please provide an account ID.`);
    return;
  } else if (
    accountId.length > 32 ||
    !/^\d{1}\.\d{1}\.\d{2,16}$/.test(accountId)
  ) {
    message.channel.send(`That account ID is not valid.`);
    return;
  }

  let { data, error } = await supabase
    .from("fetches")
    .select("accountId")
    .eq("accountId", accountId);

  if (error || data.length > 1) {
    console.error(`Account fetch query Error: ${error.data}`);
    console.error(`Data: ${data}`);
    message.channel.send(`Something went wrong - try again!`);
    return;
  } else if (data.length === 1) {
    const { hrs, mins } = getResetTime();
    message.channel.send(
      `Hello Saucy explorer, you have used !fetch already today, try again in ${hrs} hours and ${mins} minutes.`
    );
    return;
  } else {
    const isAssociated = await tokenAssociationCheck(accountId);
    if (!isAssociated) {
      message.channel.send(
        `You have not associated SauceInu: ${config.HEDERA_TOKEN_ID}`
      );
      return;
    }

    // Call the nftCheck function with the account ID
    const { isNftOwner, serials } = await nftCheck(accountId);

    // If the user doesn't own any NFTs, send a reply and break
    if (!isNftOwner) {
      message.channel.send(
        `You do not own the FLAGSHIP V2 NFT :  ${config.NFT_ID}`
      );
      return;
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
        message.channel.send(`Something went wrong - try again!`);
        return;
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
      message.channel.send(
        `All your NFTs have already claimed the faucet. Check back in  ${hrs} hours and ${mins} minutes.`
      );
      return;
    }

    // Pay out the token to the account
    await tokenPayout(accountId);

    // Record the transaction in the "fetches" table in the database
    await supabase.from("fetches").insert([{ accountId }]);

    // Insert the unclaimed NFT's serial number into the "serials" table to indicate that it has claimed the faucet
    let { supaError } = await supabase
      .from("serials")
      .insert([{ serial: unclaimedNFT }]);

    // If there's an error, log it
    if (supaError) {
      console.error(`Serial push into table Error: ${supaError.message}`);
    }

    // Send a reply to the user to indicate that the token has been successfully fetched
    message.channel.send(
      `Congratulations you've received FLAGSHIP V2 rewards + ${config.HEDERA_TOKEN_DRIP_RATE} SauceInu was sent to your wallet. See you tomorrow!`
    );
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
