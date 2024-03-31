import {
  AccountId,
  Client,
  PrivateKey,
  TransferTransaction,
} from "@hashgraph/sdk";
import fetch from "node-fetch";
import * as config from "../config.js";

const hederaBaseUrl = config.HEDERA_BASE_URL;
const operatorId = AccountId.fromString(config.HEDERA_OPERATOR_ID);
const operatorKey = PrivateKey.fromString(config.HEDERA_OPERATOR_PRIVATE_KEY);
const tokenId = config.HEDERA_TOKEN_ID;
const nftId = config.NFT_ID;
const tokenDripRate = Number(config.HEDERA_TOKEN_DRIP_RATE);
const tokenDecimals = Number(config.HEDERA_TOKEN_DECIMALS);
const payout = tokenDripRate * Math.pow(10, tokenDecimals);

export const client = Client.forName(config.HEDERA_NETWORK).setOperator(
  operatorId,
  operatorKey
);

export const tokenAssociationCheck = async (accountId) => {
  try {
    const url = `${hederaBaseUrl}/accounts/${accountId}/tokens?limit=1&token.id=${tokenId}`;
    const data = await fetch(url).then((response) => response.json());
    if (!data || !data.tokens) {
      // Unfortunately rate limitations have been a frequent problems in the past
      // If this occurs, lookup user association status with AccountBalanceQuery (DEPRECATED)
      throw new Error(
        `Fetch at ${url} failed! Are we being rate limited again?`
      );
    }
    // Even if user balance for the queried tokenId is zero
    // The tokens array should still have an entry (length > 0)
    // Otherwise it truly has not been associated yet
    return data.tokens.length > 0;
  } catch (e) {
    console.error(e);
  }
};

export const nftCheck = async (accountId) => {
  try {
    const url = `${hederaBaseUrl}/accounts/${accountId}/nfts?token.id=${nftId}`;
    const data = await fetch(url).then((response) => response.json());
    if (!data || !data.nfts) {
      throw new Error(
        `Fetch at ${url} failed! Are we being rate limited again?`
      );
    }
    if (data.nfts.length === 0) {
      // The user does not own the gating NFT
      return { isNftOwner: false, serials: [] };
    }

    const serials = data.nfts.map((nft) => nft.serial_number);
    return { isNftOwner: true, serials };
  } catch (e) {
    console.error(e);
  }
};

export const tokenPayout = async (accountId) => {
  try {
    const tx = await new TransferTransaction()
      .addTokenTransfer(tokenId, operatorId, -payout)
      .addTokenTransfer(tokenId, accountId, payout)
      .setTransactionMemo("Stickbug faucet pull!")
      .freezeWith(client)
      .sign(operatorKey);
    const txResponse = await tx.execute(client);
    const receipt = await txResponse.getReceipt(client);
    if (receipt.status._code == 22) {
      console.debug(
        `${
          payout / Math.pow(10, tokenDecimals)
        } Token transferred to ${accountId}`
      );
    } else {
      throw new Error(`Receipt status is not a success!`);
    }
  } catch (e) {
    console.error(e);
  }
};
