import { useState, useEffect } from 'react'
import axios from 'axios'
import Circle from '../../public/circle.svg'
import Clicked from '../../public/ellipsecomplete.svg'
import Modal from './Modal'
const apiHost = import.meta.env.VITE_API_HOST

export default function Game({ mintNft, account }) {
  const [guess, setGuess] = useState(0)
  const [showModal, setShowModal] = useState(false)
  const [guesses, setGuesses] = useState(0)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState({})
  const resetGuesses = () => setGuesses(0)

  useEffect(() => {
    // Only fetch guesses if account is not null or undefined
    if (account) {
      fetchGuesses()
    }
  }, [account])

  const fetchGuesses = async () => {
    try {
      const count = await getGuesses(account)

      setGuesses(Number(count))
    } catch (error) {
      console.error(error)
    }
  }

  const getGuesses = async (account) => {
    setLoading(true)
    // Retrieve the token from localStorage
    const token = localStorage.getItem('token')
    const url = `${apiHost}/guess/${account}`
    try {
      const result = await axios.get(url)
      return Number(result.data.guesses) || 0 // ensure we return a number, default to 0
    } catch (error) {
      alert(error)
      // console.error(error);
      return 0
    }
  }

  // Logic to call the API server and test guess conditions
  const makeGuessApiCall = async (guess, account) => {
    let data = {
      address: account,
      guess,
    }

    // Retrieve the token from localStorage
    const token = localStorage.getItem('token')

    try {
      const response = await axios({
        url: `${apiHost}/guess`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        data,
      })

      const { won, tokenId, ipfsHash } = response.data

      // Increase the guess count first
      setGuesses((prevGuesses) => {
        const newGuesses = prevGuesses + 1
        if (newGuesses >= 3) {
          setResult({
            ...result,
            noMoreGuesses: true,
          })
        }
        return newGuesses
      })
      if (won) {
        setResult({
          won: true,
          tokenId,
          ipfsHash,
          guess,
        })
      } else {
        setResult({
          won: false,
          tokenId: null,
          ipfsHash: null,
          guess,
        })
      }

      // Show the modal
      setShowModal(true)
    } catch (error) {
      alert(error)
    }
  }

  const handleClick = async (guessNumber) => {
    if (guesses < 3) {
      await makeGuessApiCall(guessNumber, account)
    } else {
      setResult({
        ...result,
        noMoreGuesses: true,
        guess: guessNumber,
      })
      setShowModal(true) // This will trigger the modal when no more guesses are left
    }
  }

  return (
    <div>
      <svg className="dividert">
        <line
          x1="0"
          y1="0"
          x2="100%"
          y2="0"
          stroke="black"
          stroke-dasharray="5,5"
        />
      </svg>
      <div className="grid">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
          <div
            onClick={async () => {
              setGuess(n)
              await handleClick(n)
            }}
            key={n}
            className={n === guess ? 'selected' : ''}
          >
            {n === guess ? (
              <img className="circdone" src={Clicked} />
            ) : (
              <img className="circdone" src={Circle} />
            )}
            <p>{n}</p>
          </div>
        ))}
      </div>

      <p className="pinktry">{3 - guesses} of 3 tries left</p>
      <svg className="dividerb">
        <line
          x1="0"
          y1="0"
          x2="100%"
          y2="0"
          stroke="black"
          stroke-dasharray="5,5"
        />
      </svg>
      {showModal && (
        <Modal
          onClose={() => setShowModal(false)}
          result={result}
          mintNft={mintNft}
          account={account}
          resetGuesses={resetGuesses}
        />
      )}
    </div>
  )
}
