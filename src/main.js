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
    message.channel.send(
      `<@${message.author.id}>, please provide an account ID.`
    );
    return;
  } else if (
    accountId.length > 32 ||
    !/^\d{1}\.\d{1}\.\d{2,16}$/.test(accountId)
  ) {
    message.channel.send(
      `<@${message.author.id}>, that account ID is not valid.`
    );
    return;
  }

  let { data, error } = await supabase
    .from("fetches")
    .select("accountId")
    .eq("accountId", accountId);

  if (error || data.length > 1) {
    console.error(`Account fetch query Error: ${error.data}`);
    console.error(`Data: ${data}`);
    message.channel.send(
      `<@${message.author.id}>, something went wrong - try again!`
    );
    return;
  } else if (data.length === 1) {
    const { hrs, mins } = getResetTime();
    message.channel.send(
      `<@${message.author.id}> Hello Saucy explorer, you have used !fetch already today, try again in ${hrs} hours and ${mins} minutes.`
    );
    return;
  } else {
    const isAssociated = await tokenAssociationCheck(accountId);
    if (!isAssociated) {
      message.channel.send(
        `<@${message.author.id}>, you have not associated SauceInu: ${config.HEDERA_TOKEN_ID}`
      );
      return;
    }

    const { isNftOwner, serials } = await nftCheck(accountId);

    if (!isNftOwner) {
      message.channel.send(
        `<@${message.author.id}>, you do not own the FLAGSHIP V2 NFT :  ${config.NFT_ID}`
      );
      return;
    }

    let unclaimedNFT = null;

    for (let serial of serials) {
      let { data, error } = await supabase
        .from("serials")
        .select("serial")
        .eq("serial", serial);

      if (error) {
        console.error(`NFT serial query Error: ${error.data}`);
        message.channel.send(
          `<@${message.author.id}>, something went wrong - try again!`
        );
        return;
      } else if (data.length === 0) {
        unclaimedNFT = serial;
        break;
      }
    }

    if (!unclaimedNFT) {
      const { hrs, mins } = getResetTime();
      message.channel.send(
        `<@${message.author.id}>, all your NFTs have already claimed the faucet. Check back in  ${hrs} hours and ${mins} minutes.`
      );
      return;
    }

    await tokenPayout(accountId);
    await supabase.from("fetches").insert([{ accountId }]);
    let { supaError } = await supabase
      .from("serials")
      .insert([{ serial: unclaimedNFT }]);

    if (supaError) {
      console.error(`Serial push into table Error: ${supaError.message}`);
    }

    message.channel.send(
      `<@${message.author.id}>, congratulations you've received FLAGSHIP V2 rewards + ${config.HEDERA_TOKEN_DRIP_RATE} SauceInu was sent to your wallet. See you tomorrow!`
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
