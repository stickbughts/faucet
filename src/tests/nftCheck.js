import fetch from "node-fetch";

import * as config from "../../config.js";

const nftId = config.NFT_ID;
const hederaBaseUrl = config.HEDERA_BASE_URL;

const testWallet = "";
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
const accountId = testWallet; // replace with your account id
nftCheck(accountId)
  .then((result) => console.log(result))
  .catch((error) => console.error(error));
