import React, { useState, useEffect } from 'react';
import { Container, Card, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './BlackJack.css';

const Blackjack = () => {

  // Här skapar vi olika states för att hålla koll på speldata
  const [deckId, setDeckId] = useState(null); // Id för kortleken
  const [playerHand, setPlayerHand] = useState([]); 
  const [dealerHand, setDealerHand] = useState([]); 
  const [gameStatus, setGameStatus] = useState('waiting'); // Status på spelet
  const [message, setMessage] = useState('Welcome to Blackjack!'); 

  // Används för att hämta en ny kortlek
  useEffect(() => {
    fetchNewDeck();
  }, []);

  //Vår function som hämtar en ny kortlek från API:t
  const fetchNewDeck = async () => {
    try {
      const response = await fetch('https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1');
      const data = await response.json();
      setDeckId(data.deck_id); // Spara kortleks-ID
    } catch (error) {
      console.error('Problem med att hämta kortlek:', error);
    }
  };

  // Dra ett kort och lägg till i spelarens eller dealerns hand
  const drawCard = async (hand, setHand) => {
    if (!deckId) return;
    try {
      const response = await fetch(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=1`);
      const data = await response.json();
      if (data.cards.length > 0) {
        setHand([...hand, data.cards[0]]); // Lägg till kort i handen
      }
    } catch (error) {
      console.error('Problem med att dra kort:', error);
    }
  };

  // Starta spelet, dra ny kortlek och två kort, ett för spelaren och ett för dealern
const startGame = async () => {
    setPlayerHand([]); 
    setDealerHand([]);
    setGameStatus('waiting'); // Ändra till vänteläge medan ny kortlek laddas
    setMessage('');
  
    await fetchNewDeck(); 
  
    setGameStatus('playing'); // Ändra till spelar-läge
    await drawCard(([]), setPlayerHand); // Dra kort till spelaren
    await drawCard(([]), setPlayerHand);
    await drawCard(([]), setDealerHand); // Dra kort till dealern
  };
  
  
  const hit = async () => {
    await drawCard(playerHand, setPlayerHand);
    checkGameStatus();
  };

  const stand = async () => {
    setGameStatus('dealer-turn');
    await dealerPlay();
  };

  // Dealer spelar tills den når minst 17 poäng
  const dealerPlay = async () => {
    let currentDealerHand = [...dealerHand];
    while (calculateHandValue(currentDealerHand) < 17) {
      const response = await fetch(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=1`);
      const data = await response.json();
      if (data.cards.length > 0) {
        currentDealerHand = [...currentDealerHand, data.cards[0]]; // Lägg till kort till dealerns hand
        setDealerHand(currentDealerHand);
      }
    }
    determineWinner(playerHand, currentDealerHand); // Kolla vem som vann
  };

  // Räkna ut värdet på en hand
  const calculateHandValue = (hand) => {
    let value = 0;
    let aces = 0;
    for (let card of hand) {
      if (card.value === 'ACE') {
        aces += 1; // Håll koll på ess
        value += 11;
      } else if (['KING', 'QUEEN', 'JACK'].includes(card.value)) {
        value += 10; // Klädda kort är värda 10
      } else {
        value += parseInt(card.value);
      }
    }
    while (value > 21 && aces > 0) {
      value -= 10; // Om värdet överstiger 21, räkna ess som 1 istället
      aces -= 1;
    }
    return value;
  };

  // Kolla om spelet är över efter spelarens drag
  const checkGameStatus = () => {
    const playerValue = calculateHandValue(playerHand);
    if (playerValue > 21) {
      setGameStatus('game-over');
      setMessage('Bust! You lose!'); // Spelaren förlorade
    } else if (playerValue === 21) {
      setGameStatus('game-over');
      setMessage('Blackjack! You win!'); // Spelaren fick Blackjack
    }
  };

  // Avgör vem som vann spelet
  const determineWinner = (playerHand, dealerHand) => {
    const playerValue = calculateHandValue(playerHand);
    const dealerValue = calculateHandValue(dealerHand);

    if (dealerValue > 21) {
      setMessage('Dealer busts! You win!');
    } else if (playerValue > dealerValue) {
      setMessage('You win!');
    } else if (playerValue < dealerValue) {
      setMessage('Dealer wins!');
    } else {
      setMessage('It\'s a tie!');
    }
    setGameStatus('game-over'); // Spelet är över
  };

  return (
    <>
      {/* Lägg till titel ovanför container */}
      <h2 style={{ color: 'white', textAlign: 'center', marginBottom: '20px' }}>Uppgift 2</h2> 
      <Container fluid className="blackjack-bg">
        <Card className="game-card">
          <Card.Body>
            <h1>Galactic Blackjack</h1>
            <div className="game-area">
              <div className="hand dealer-hand">
                <h2>Dealer's Hand</h2>
                {dealerHand.map((card, index) => (
                  <img key={index} src={card.image} alt={card.code} className="playing-card" />
                ))}
                {gameStatus !== 'waiting' && <p>Value: {calculateHandValue(dealerHand)}</p>}
              </div>
              <div className="hand player-hand">
                <h2>Your Hand</h2>
                {playerHand.map((card, index) => (
                  <img key={index} src={card.image} alt={card.code} className="playing-card" />
                ))}
                {gameStatus !== 'waiting' && <p>Value: {calculateHandValue(playerHand)}</p>}
              </div>
            </div>
            <div className="controls">
              {gameStatus === 'waiting' && (
                <Button variant="primary" onClick={startGame}>Start Game</Button>
              )}
              {gameStatus === 'playing' && (
                <>
                  <Button variant="primary" onClick={hit}>Hit</Button>
                  <Button variant="secondary" onClick={stand}>Stand</Button>
                </>
              )}
              {gameStatus === 'game-over' && (
                <Button variant="primary" onClick={startGame}>Play Again</Button>
              )}
            </div>
            {message && <div className="message">{message}</div>}
          </Card.Body>
        </Card>
      </Container>
    </>
  );
}

export default Blackjack;
