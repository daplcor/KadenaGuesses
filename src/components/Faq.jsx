import { useState } from 'react'

export default function Faq() {
  const [isOpen, setIsOpen] = useState([false, false])

  function toggleOpen(index) {
    setIsOpen(isOpen.map((open, i) => (i === index ? !open : open)))
  }

  return (
    <>
      <div className="faq">
        <h2 className="learnmore">Learn More</h2>
        <p className="faqtext">Click the text boxes below for help.</p>
      </div>
      <div className="faq">
        <div className="faq-box">
          <div className="faq-title">
            <h4 className="faqh2">How it works?</h4>
            <div onClick={() => toggleOpen(0)}>
              <p className="faqplus">+</p>
            </div>
          </div>
        </div>
        {isOpen[0] && (
          <div className="faq-content">
            <p>
              Every turn starts with a new random number.
              <br />
              Click any number to make your guess.
              <br />
              Depending on your guess, a new popup will appear letting you know
              if you won.
            </p>
          </div>
        )}
        <div className="faq-box">
          <div className="faq-title">
            <h4 className="faqh2">What can I win?</h4>
            <div onClick={() => toggleOpen(1)}>
              <p className="faqplus">+</p>
            </div>
          </div>
        </div>
        {isOpen[1] && (
          <div className="faq-content">
            <p>
              If you guess correct within three tries an NFT
              <br />
              will be minted, cementing your achievement!
            </p>
          </div>
        )}
      </div>
    </>
  )
}
