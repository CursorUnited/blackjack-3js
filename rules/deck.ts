const group = ['hearts', 'diamonds', 'clubs', 'spades']
const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'jack', 'queen', 'king', 'ace']

export function createDeck() {
  let deck = []

  for (let x of group) {
    for (let y of values) {

      let points = parseInt(y);
      if (['jack', 'queen', 'king'].includes(y)) points = 10;
      if (y == "ace") points = 11;

      let fileName = `/png/${y}_of_${x}.png`

      deck.push({
        suit: x,
        value: y,
        points: points,
        image: fileName
      })
    }
  }
  return deck
}

export function shuffleDeck(deck: any[]) {
  let shuffled = [...deck]; 
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}


export function calculateScore(hand: any[]) {
  let score = 0
  let aces = 0

  for (let card of hand) {
    score += card.points
    if (card.value === "ace") aces+= 1
  }
  while (score > 21 && aces > 0) {
    score -= 10
    aces -= 1
  }

  return score
}