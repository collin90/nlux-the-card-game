export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type FaceRank = 'J' | 'Q' | 'K';
export type NumberRank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10';
export type Rank = NumberRank | FaceRank;

export interface Card {
  id: string;
  rank: Rank;
  suit: Suit;
  isFace: boolean;
  value: number; // Ace=1, 2-10=face value, J/Q/K=0 (no numeric role in equations)
}

export type OceanZone = 'daylight' | 'twilight' | 'midnight';

export interface PlayedEquation {
  id: string;
  lhs: Card[];
  rhs: Card;
  zone: OceanZone;
  pointValue: number; // sum of all cards, faces=15
}

export interface BadgeAnimal {
  name: string;
  emoji: string;
  zone: OceanZone;
}

export type GamePhase = 'playing' | 'win' | 'giveup' | 'gameover';

export type DrawMode = 'auto' | 'manual';

export type ValidationResult =
  | { valid: false; reason?: string }
  | { valid: true; lhs: Card[]; rhs: Card; preview: string };

export interface GameState {
  deck: Card[];
  hand: Card[];
  ocean: PlayedEquation[];
  phase: GamePhase;
  score: number;
  selectedIds: Set<string>;
  focusedIndex: number;
  lastPlayWasInvalid: boolean;
  showGiveUpConfirm: boolean;
  badge: BadgeAnimal | null;
  drawMode: DrawMode;
  hintsUsed: number;
}
