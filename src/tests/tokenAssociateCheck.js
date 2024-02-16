import fetch from "node-fetch";
import * as config from "../../config.js";

const hederaBaseUrl = config.HEDERA_BASE_URL;
const tokenId = config.HEDERA_TOKEN_ID;

const testWallet = "";

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

tokenAssociationCheck(testWallet)
  .then((result) => console.log(result))
  .catch((error) => console.error(error));
