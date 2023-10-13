import { useState, useEffect, useRef } from 'react'
import Card from './Card'
import axios from 'axios'

const Deck = () => {
  const [deck, setDeck] = useState(null)
  const [drawnCards, setDrawnCards] = useState([])
  const [autoDeal, setAutoDeal] = useState(false)
  const timerId = useRef(null)

  const baseURL = 'http://deckofcardsapi.com/api/deck'

  /** Fetch a new deck from Deck of Cards API */
  useEffect(
    function fetchDeckWhenMounted() {
      async function fetchDeck() {
        const result = await axios.get(`${baseURL}/new/shuffle`)
        setDeck(result.data)
      }
      fetchDeck()
    },
    [setDeck]
  )

  /** Draw a card every second from Deck of Cards API if autoDeal is set to true */
  useEffect(() => {
    /**draw a card and add it to the drawnCard array */
    async function fetchCard() {
      let { deck_id } = deck

      try {
        let result = await axios.get(`${baseURL}/${deck_id}/draw/`)

        if (result.data.remaining == 0) {
          setAutoDeal(false)
          throw new Error('no more cards to deal!')
        }

        const card = result.data.cards[0]

        setDrawnCards((drawnCard) => [
          ...drawnCard,
          {
            id: card.code,
            name: `${card.suit} card`,
            image: card.image,
          },
        ])
      } catch (e) {
        alert(e)
      }
    }

    if (autoDeal && !timerId.current) {
      timerId.current = setInterval(async () => {
        await fetchCard()
      }, 1000)
    }

    return () => {
      clearInterval(timerId.current)
      timerId.current = null
    }
  }, [autoDeal, setAutoDeal, deck])

  const toggleAutoDeal = () => {
    setAutoDeal((auto) => !auto)
  }

  const cards = drawnCards.map((card) => (
    <Card key={card.id} name={card.name} image={card.image} />
  ))

  return (
    <div>
      <button onClick={toggleAutoDeal}>Hit Me!</button>
      <div>{cards}</div>
    </div>
  )
}

export default Deck
