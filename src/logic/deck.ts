import type { Card, Suit, Rank } from './types';

const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
const RANKS: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const FACE_RANKS: Set<Rank> = new Set(['J', 'Q', 'K']);

function getCardValue(rank: Rank): number {
  if (rank === 'A') return 1;
  if (FACE_RANKS.has(rank)) return 0;
  return parseInt(rank, 10);
}

export function createDeck(): Card[] {
  const cards: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      cards.push({
        id: `${rank}-${suit}`,
        rank,
        suit,
        isFace: FACE_RANKS.has(rank),
        value: getCardValue(rank),
      });
    }
  }
  return cards;
}

export function shuffle(deck: Card[]): Card[] {
  const arr = [...deck];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
