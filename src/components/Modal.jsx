import axios from 'axios'
import SadFace from '../../public/sadface.svg'
import SadCry from '../../public/sadcry.svg'
import FaceParty from '../../public/faceparty.svg'
const apiHost = import.meta.env.VITE_API_HOST

export default function Modal({
  onClose,
  result,
  mintNft,
  account,
  resetGuesses,
}) {
  const { won, tokenId, ipfsHash, noMoreGuesses, guess } = result
  const handleTryAgain = async () => {
    try {
      const resetFeePaid = true
      // Retrieve the token from localStorage
      const token = localStorage.getItem('token')

      await axios({
        url: `${apiHost}/guess/reset`,
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: {
          address: account,
          resetFeePaid,
        },
      })

      resetGuesses() // Call the function after resetting
      onClose()
    } catch (error) {
      alert('Error resetting guesses. Please try again.')
    }
  }

  const handleMint = async () => {
    const mintNftResponse = await mintNft(account, ipfsHash, tokenId)
    alert()
    onClose()
  }

  if (noMoreGuesses) {
    return (
      <div className="modal">
        <div className="modal-content-reset">
          <p className="ohno">
            <img className="circsadface" src={SadFace} />
            <br></br>Oh no, you used all <br /> 3 chances to guess
            <br></br>
            <span className="hinttext">
              {' '}
              Pay 0.1 KDA and you get 3 more
              <br />
              tries to win an NFT.
              <br />
              on your next try.
            </span>
          </p>
          <button className="linearbutton" onClick={handleTryAgain}>
            Reset Guesses
          </button>
          <button className="resetbutton" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    )
  }

  if (won) {
    return (
      <div className="modal">
        <div className="modal-content">
          <p className="ohno">
            <img className="circsadface" src={FaceParty} />
            Wohoooo, <br />
            {guess} is the lucky number
          </p>
          <button className="linearbutton" onClick={handleMint}>
            Mint Your NFT Now
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="modal">
      <div className="modal-content">
        <p className="ohno">
          <img className="circsadface" src={SadFace} />
          <br></br>Oh no, <br></br> {guess} isn't the lucky number
          <br></br>
          <span className="hint">Hint:</span>
          <span className="hinttext">
            {' '}
            You can use the same number
            <br />
            on your next try.
          </span>
        </p>
        <button className="linearbutton" onClick={onClose}>
          Try Again
        </button>
      </div>
    </div>
  )
}
