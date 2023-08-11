import * as Linx from './linx.js'
import axios from 'axios'

export let account = ''
const apiHost = import.meta.env.VITE_API_HOST;

// Most important Login Function on Earth
export async function loadLinx() {
  if (window.flutter_inappwebview) {
    const connected = await Linx.isConnected()
    // alert(`Connected: ${connected}`);

    if (connected) {
      return await login()
    } else {
      alert('Not connected')
    }
  }
  return null
}

// Called from LoadLinx
export async function login() {
  // Get account from Linx
  const account = await Linx.getAccount()
  // If there's no account, return null
  if (!account) {
    return null
  }
  // Check for existing token
  let token = localStorage.getItem('token')

  if (token) {
    // Token exists, verify the token
    const isValid = await verifyToken(account, token)
    if (!isValid) {
      // Token is not valid, remove it from localStorage
      localStorage.removeItem('token')
      token = null
    }
  }

  if (!token) {
    // No valid token, generate a new one
    token = await jwtLogin(account)
    // If jwtLogin was unsuccessful and did not return a token, return null
    if (!token) {
      alert('Failed to generate new token')
      return null
    }
    localStorage.setItem('token', token)
  }
  // alert("Returning account");

  // Return the account
  return account
}

async function verifyToken(account, token) {
  // use backend API route to validate the token
  const url = `${apiHost}/guess/verifytoken`
  try {
    await axios({
      url: url,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer ${token}`
      },
      data: { walletAddress: account, token },
    })
    return true
  } catch (error) {
    return false
  }
}

export async function logout() {
  if (window.flutter_inappwebview) {
    account = ''
    return true
  }
  return false
}

// Request the address from LinxWallet, returns the active k: account
async function requestLogin() {
  const accountName = await Linx.getAccount()
  if (accountName != null) {
    account = accountName
    document.getElementById(
      'welcomeMessage'
    ).innerHTML = `Welcome ${account.slice(0, 6)}...${account.slice(
      account.length - 5,
      account.length
    )}`
    document.getElementById('getBalance').style.display = 'contents'
  }
}

// Request the wallet for balance with a list of tokens
// The response will give, for the requested token(s), or when empty all tokens with balance:
export let balances = []

export async function getBalance() {
  if (window.flutter_inappwebview) {
    const tokenList = ['coin']
    const balance = await Linx.balance(tokenList)
    if (balance != null && balance.error != null) {
      alert(balance.error)
      return null
    } else if (balance != null) {
      balances = balance
      return balances[0].totalBalance
    }
  }
}

export async function getNetwork() {
  if (window.flutter_inappwebview) {
    const network = await Linx.network()
    if (network.error) {
      alert(network.error)
      return null
    }
    return network
  }
}

export async function signTx(tx) {
  if (window.flutter_inappwebview) {
    return await Linx.send(tx)
  }
}

// Function where you send the user to the swap screen to buy set token
function requestSwap() {
  Linx.swap('free.anedak')
}

// Example for chainless buy, WALLET RETURNS REQUESTKEYS
// In this example in the wallet is only 1 kda on chain 0
async function sendSignRequest() {
  const signingRequest = {
    code: `(validate-principal (read-keyset 'keyset) "${account}")`,
    data: {
      keyset: {
        keys: [account.slice(2)],
      },
    },
    caps: [
      {
        role: 'pay gas',
        description: 'pay for gas',
        cap: {
          args: [],
          name: 'coin.GAS',
        },
      },
    ],
    nonce: Date.now().toLocaleString,
    chainId: '0',
    gasLimit: 1200,
    ttl: 600,
    sender: account,
    extraSigners: [],
  }
  const request = Linx.requestData(
    signingRequest,
    'Verify Account',
    null,
    0,
    'KDA',
    0.0,
    0.0,
    null,
    false
  )
  const result = await Linx.send(
    request,
    'Login to verify ownership of account'
  )
  // Show sig hash
  if (result.error) {
    alert(result.error)
  } else {
    alert(result.hash)
  }
}

// Example for chainless buy, WALLET RETURNS REQUESTKEYS
// In this example in the wallet is only 1 kda on chain 0
function sendBuyRequest() {
  const signingRequest = {
    code: `(coin.transfer "${accountName}" "xxx" 2.0)`,
    data: {
      keyset: {
        keys: [accountName.slice(2)],
      },
    },
    caps: [
      {
        role: 'pay gas',
        description: 'pay for gas',
        cap: {
          args: [],
          name: 'coin.GAS',
        },
      },
      {
        role: 'Transfer',
        description: 'Transfer KDA',
        cap: {
          name: 'coin.TRANSFER',
          args: [accountName, 'xxx', 2.0],
        },
      },
    ],
    nonce: Date.now().toLocaleString,
    chainId: '0',
    gasLimit: 1200,
    ttl: 600,
    sender: accountName,
    extraSigners: [],
  }
  const request = Linx.requestData(
    signingRequest,
    null,
    0,
    'coin',
    2.0,
    0.0,
    null,
    true
  )
  const result = Linx.buy(request, 'Send 2 KDA as Chainless Test')
  // The result will be an object with 2 requestkeys, 1 for gathering balance and the second for the above transaction
  /**
  {
    balance_requestkeys: [],
    tx_requestkey : []
  }
  */
  alert(result)
}

// General example function to verify the wallet owns the given account
// The transaction is created in a SigningRequest format, which you can
// create manually or through pact-api. (https://kadena-io.github.io/signing-api/#definition-SigningRequest)
async function verifyAccount(accountName) {
  const signingRequest = {
    code: `(validate-principal (read-keyset 'keyset) "${accountName}")`,
    data: {
      keyset: {
        keys: [accountName.slice(2)],
      },
    },
    caps: [
      {
        role: 'pay gas',
        description: 'no need to pay for gas on a local tx',
        cap: {
          args: [],
          name: 'coin.GAS',
        },
      },
    ],
    nonce: Date.now().toLocaleString,
    chainId: '0',
    gasLimit: 100,
    ttl: 600,
    sender: accountName,
    extraSigners: [],
  }
  if (LinxWalletAvailable) {
    const request = {
      description: 'Sign in to verify the account', // Description used to show to the user if it needs approval
      request: 'sign', // Request command so the wallet knows what to do with the data
      data: signingRequest, // https://kadena-io.github.io/signing-api/#definition-SigningRequest
      chainless: {}, // Object where you specify which token and amount needs to be available on what chain, empty if none *
      needsApproval: false, // Let the wallet know if the user needs to manually approve **
    }
    const sig = await Linx.sign(request)
    if (sig != null && sig.error != null) {
      alert(sig.error)
    } else if (sig != null) {
      // Send local request
      const result = await sendLocal(sig)
      if (result) {
        account = accountName
        load()
      } else {
        logout()
      }
    }
  }
}

// Recover uri(ipfsHash) and tokenId from response.data
export async function mintNft(accountName, uri, tokenId) {
  const precision = 0
  const marmalade = 'n_42174c7f0ec646f47ba227ffeb24714da378f4d1.ledger'
  const contract = 'free.kadenai-minter.mint'
  const policy = `(n_42174c7f0ec646f47ba227ffeb24714da378f4d1.util-v1.create-policies n_42174c7f0ec646f47ba227ffeb24714da378f4d1.util-v1.DEFAULT)`
  const signingRequest = {
    code: `(${contract} "${accountName}" "${uri}" ${precision} ${policy})`,
    data: {
      keyset: {
        keys: [accountName.slice(2)],
      },
      'minter-guard': {
        keys: [accountName.slice(2)],
      },
      'nfp-mint-guard': {
        keys: [accountName.slice(2)],
      },
    },
    caps: [
      {
        role: 'pay gas',
        description: 'pay for gas',
        cap: {
          args: [],
          name: 'coin.GAS',
        },
      },
      {
        role: 'MINT',
        description: 'Mint an NFT',
        cap: {
          name: `${marmalade}.MINT`,
          args: [tokenId, accountName, 1.0],
        },
      },
    ],
    nonce: Date.now().toLocaleString,
    chainId: '1',
    gasLimit: 4000,
    ttl: 600,
    sender: accountName,
    extraSigners: [],
  }

  const request = Linx.requestData(
    signingRequest,
    'Mint an NFT',
    null,
    1,
    'KDA',
    0.0,
    0.0,
    'coin',
    false
  )
  try {
    const sig = await Linx.send(request, 'Mint an NFT')
    // alert(JSON.stringify(sig))
    const response = await sendLocal(sig)
    alert(JSON.stringify(response))
    if (response.result.status === 'success') {
      alert('success', JSON.stringify(response))
      const sendRes = await sendSend(sig)
      // Alert or log the response from sendRes
      alert(JSON.stringify(sendRes))
      return sendRes
    } else if (response.result.status === 'failure') {
      alert('failure', JSON.stringify(response))
      return response
    } else {
      alert('unexpected response:', JSON.stringify(response))
      return response
    }
  } catch (error) {
    alert('Error in mintNft: ', error.message)
  }
}

async function sendLocal(sig) {
  const host = `https://api.testnet.chainweb.com/chainweb/0.0/testnet04/chain/1/pact/api/v1/local`
  const result = await fetch(host, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(sig),
  })
  // let hi = await result.json();
  // alert(JSON.stringify(hi));
  if (result.ok) {
    const resJson = await result.json()
    return resJson
  } else {
    return false
  }
}

// General example function to send a request to Chainweb without pact-api
async function sendSend(sig) {
  try {
    const host = `https://api.testnet.chainweb.com/chainweb/0.0/testnet04/chain/1/pact/api/v1/send`
    const result = await fetch(host, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ cmds: [sig] }),
    })
    // alert(result.ok);
    // alert(result.status);
    const hi = await result.json()
    alert(JSON.stringify(hi))

    if (result.ok) {
      return hi
    } else {
      return false
    }
  } catch (error) {
    // alert('Error:', error);
    // When JSON parsing fails, try response as text
    const rawResponse = await result.text()
    alert('Raw response:', rawResponse)
  }
}

let jwtInProgress = false
// Process to validate JWT tokens from the API Server
const jwtLogin = async (accountName) => {
  // alert('Inside jwtLogin function');
  try {
    const signedNonce = await signNonce(accountName)
    const response = await axios.post(`${apiHost}/guess/login`, {
      walletAddress: accountName,
      signedNonce,
    })

    // alert(JSON.stringify(response));

    // Get JWT
    const { token } = response.data
    // Save to localStorage
    localStorage.setItem('token', token)

    return token
  } catch (error) {
    console.error('An error occurred:', error)
    alert(`Error: ${error.message}`)
  }
}

// Generate the signature for our JWT process
export async function signNonce(accountName) {
  const signingRequest = {
    code: `(+ 1 1)`,
    data: {
      keyset: {
        keys: [accountName.slice(2)],
      },
    },
    caps: [],
    nonce: Date.now().toLocaleString,
    chainId: '1',
    gasLimit: 4000,
    ttl: 600,
    sender: accountName,
    extraSigners: [],
  }

  const request = Linx.requestData(
    signingRequest,
    'Sign Nonce',
    null,
    1,
    'KDA',
    0.0,
    0.0,
    'coin',
    false
  )
  try {
    const response = await Linx.send(request, 'signed nonce')
    // alert(JSON.stringify(sig.sigs[0]))
    // return JSON.stringify(sig.sigs[0]);
    const sig = response.sigs[0]
    const hash = response.hash
    return { sigs: [sig], hash }
  } catch (error) {
    alert('Error signing nonce: ', error.message)
  }
}
