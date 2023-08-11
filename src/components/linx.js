
// const linx = (...args) =>window.flutter_inappwebview.callHandler("LinxWallet", ...args) ;
const consoleg = (...args) => window.flutter_inappwebview.callHandler("consoleLog", ...args);

let linx = () => { };

if (window.flutter_inappwebview) {
  linx = (...args) => window.flutter_inappwebview.callHandler("LinxWallet", ...args);
}

export { linx }

/**
 * @param {Object} signingRequest SigningRequest, https://kadena-io.github.io/signing-api/#definition-SigningRequest
 * @param {string} itemDescription A discription of what is signed for or what is bought, example: "Verify OwnerShip" or "SpynXXX Cats #600"
 * @param {string} imageUrl String or null, show for example the image of the item that is being bought
 * @param {number} chainId integer, chain where transactions takes place
 * @param {string} tokenId Token Symbol, "KDA" or "ADK" etc.
 * @param {number} amount integer, amount of token needed for the transaction
 * @param {number} dappFee decimal / float, amount that is charged by the DApp as fee
 * @param {string} feeTokenId contract id, "coin" | "free.anedak" etc 
 * @param {boolean} chainless boolean, true if the wallet takes care of gathering balance and sending transaction
 */
export const requestData = function(signingRequest, itemDescription, imageUrl, chainId, tokenId, amount, dappFee, feeTokenId, chainless) {
  return {
    signingRequest: signingRequest,
    itemDescription: itemDescription,
    imageUrl: imageUrl,
    chainId: chainId,
    tokenId: tokenId,
    amount: amount,
    dappFee: dappFee,
    feeTokenId: feeTokenId,
    chainless: chainless
  }
}

/**
 * @param {string} request Type of request for the wallet: Send, Swap, Mint, Buy, Balance
 * @param {string} description Description that is shown to the user
 * @param {Object} requestData Object that has all the transactional data the wallet needs to know 
 * @param {bool} needsApproval Boolean if user should manually approve the request
 */
const newRequest = function(request, description, requestData, needsApproval) {
  return {
    request: request, // Example: "Buy"
    description: description, // Example: "Wizard #1477"
    data: requestData,
    needsApproval: needsApproval, // Example true
  }
}

export async function send(sendRequest, description) {
  const signRequest = await linx(newRequest("Send", description, sendRequest, true))
  return signRequest
}

export async function buy(buyRequest, description) {
  const signRequest = await linx(newRequest("Buy", description, buyRequest, true))
  return signRequest
}

export async function mint(mintRequest, description) {
  const signRequest = await linx(newRequest("Mint", description, mintRequest, true))
  return signRequest
}

export async function swap(swapToken) {
  await linx(newRequest("Swap", "buy token", { token: swapToken }, false));
}

export async function balance(tokenList) {
  const balanceRequest = await linx(newRequest("Balance", "get balance", { tokens: tokenList }, false));
  return balanceRequest
}

export async function network() {
  const networkRequest = await linx(newRequest("Network", "get current network", {},false ))
  return networkRequest
}

// Returns active account on wallet
export async function getAccount() {
  const account = await linx(newRequest("Account", "get address", {}, false));
  return account;
}

// Param is a string that can be send to the wallet to log data in the wallet (debug only)
export function logs(message) {
  console(message);
}

// Checks if there is an active connection between browser and LinxWallet
export async function isConnected() {
  console.log("Is Connected?")
  const result = await linx(newRequest("Connected", "get address", {}, false, false))
  if (result == null) {
    return false;
  }
  return result;
}



