import {
  AccountId,
  Client,
  PrivateKey,
  TransferTransaction,
} from "@hashgraph/sdk";
import * as config from "../../config.js";

const operatorId = AccountId.fromString(config.HEDERA_OPERATOR_ID);
const operatorKey = PrivateKey.fromString(config.HEDERA_OPERATOR_PRIVATE_KEY);
const tokenId = config.HEDERA_TOKEN_ID;
const tokenDripRate = Number(config.HEDERA_TOKEN_DRIP_RATE);
const tokenDecimals = Number(config.HEDERA_TOKEN_DECIMALS);
const payout = tokenDripRate * Math.pow(10, tokenDecimals);

export const client = Client.forName(config.HEDERA_NETWORK).setOperator(
  operatorId,
  operatorKey
);

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

const accountId = ""; // replace with your account id
tokenPayout(accountId)
  .then(() => console.log("Token payout completed"))
  .catch((error) => console.error(error));
