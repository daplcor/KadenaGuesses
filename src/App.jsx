import React, { useState, useEffect } from 'react'
import './App.css'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import {
  loadLinx,
  logout,
  login,
  getBalance,
  getNetwork,
  mintNft,
} from './components/functions'
import Game from './components/Game'
import Faq from './components/Faq'
import Donate from './components/donate'
import CustomButton from './components/Button'

function App() {
  const [guesses, setGuesses] = useState([])
  const [connected, setConnected] = useState(true)
  const [account, setAccount] = useState()
  // const [balance, setBalance] = useState()
  // const [network, setNetwork] = useState('')

  // Idk why I do this to myself, but lots of loading for the useEffect
  // I purposely left some code commented out to show how others can use it
  const MAX_RETRIES = 3
  const DELAY = 1000 // 1 second

  const fetchAccountWithRetry = async (retries = 0) => {
    const account = await loadLinx()
    if (account || retries >= MAX_RETRIES) return account
    await new Promise((resolve) => setTimeout(resolve, DELAY))
    return fetchAccountWithRetry(retries + 1)
  }

  useEffect(() => {
    const checkConnection = async () => {
      // const account = await loadLinx();
      const account = await fetchAccountWithRetry()
      // alert(account)
      if (account) {
        setConnected(true)
        setAccount(account)
        // const bal = await getBalance();
        // if (bal) setBalance(bal);
        // const net = await getNetwork();
        // if (net) setNetwork(net);
      } else {
        setConnected(false)
        setAccount(null)
      }
    }

    checkConnection()

    const btnLogout = document.getElementById('btnLogout')
    if (btnLogout) {
      btnLogout.addEventListener('click', disconnect)
    }
  }, [])

  const handleDisconnect = () => {
    logout()
    setConnected(false)
    setAccount(null)
    localStorage.removeItem('token')
  }

  const connectWallet = async () => {
    const account = await login()
    if (account) {
      setConnected(true)
      setAccount(account)
    }
  }

  const attachListeners = () => {
    const btnLogout = document.getElementById('btnLogout')
    if (btnLogout) {
      btnLogout.addEventListener('click', disconnect)
    }
  }

  const handleGuess = async (guess) => {
    const result = await makeGuess(guess, account)

    // Destructure data
    const { won, tokenId, uri } = result

    if (won) {
      await mintNft(account, uri, tokenId)
    }
  }

  return (
    <div className="app">
      <header>
        <div className="logo">
          <img
            src="https://storage.googleapis.com/kaipub/cirlogo.png"
            alt="Game Logo"
          />
          <p className="kd">KADENAI</p>
          <CustomButton
            className="connect-wallet-btn accountc"
            connected={connected}
            account={account}
            onConnect={connectWallet}
            onDisconnect={handleDisconnect}
          />
        </div>
        <h1>Welcome To Kadenai Guessing Game</h1>
      </header>
      <main>
        {connected ? (
          <div>
            <p className="bodyp">
              You get 3 chances to guess the number between 1 - 10 and get the
              chance to win an NFT, each round the number resets so you can try
              the same number 3 times, good luck!{' '}
              <span className="pinktext">LEARN MORE</span>{' '}
            </p>
            <Game mintNft={mintNft} account={account} />
          </div>
        ) : (
          <p>Please connect your wallet</p>
        )}
      </main>
      <div style={{ marginBottom: '50px' }}>
        <Faq />
        <Donate />
      </div>
    </div>
  )
}

export default App
