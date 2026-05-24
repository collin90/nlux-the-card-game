import { useReducer, useMemo } from 'react';
import type { GameState, GamePhase, Card } from '../logic/types';
import { createDeck, shuffle } from '../logic/deck';
import {
  validateEquation,
  hasAnyValidEquation,
  computeScore,
  getEquationPointValue,
  getZone,
  assignBadge,
  uuid,
} from '../logic/gameLogic';

// ─── Actions ─────────────────────────────────────────────────────────────────

type GameAction =
  | { type: 'NEW_GAME' }
  | { type: 'TOGGLE_SELECT'; cardId: string }
  | { type: 'PLAY_EQUATION' }
  | { type: 'CLEAR_SELECTION' }
  | { type: 'FOCUS_NEXT' }
  | { type: 'FOCUS_PREV' }
  | { type: 'SET_FOCUS'; index: number }
  | { type: 'CLEAR_SHAKE' }
  | { type: 'REQUEST_GIVE_UP' }
  | { type: 'CANCEL_GIVE_UP' }
  | { type: 'CONFIRM_GIVE_UP' };

// ─── Initial state factory ────────────────────────────────────────────────────

function createInitialState(): GameState {
  const deck = shuffle(createDeck());
  const hand = deck.slice(0, 7);
  const remainingDeck = deck.slice(7);
  return {
    deck: remainingDeck,
    hand,
    ocean: [],
    phase: 'playing',
    score: 0,
    selectedIds: new Set(),
    focusedIndex: 0,
    lastPlayWasInvalid: false,
    showGiveUpConfirm: false,
    badge: null,
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function determinePhase(hand: Card[], deck: Card[]): GamePhase {
  if (hand.length === 0 && deck.length === 0) return 'win';
  if (!hasAnyValidEquation(hand)) {
    return deck.length === 0 ? 'gameover' : 'playing';
    // Note: we only auto-trigger 'gameover' when deck is empty.
    // When deck has cards, the player might draw better cards — we never auto-lose.
    // (The deck.length > 0 case returns 'playing'; user clicks Give Up if stuck.)
  }
  return 'playing';
}

// ─── Reducer ─────────────────────────────────────────────────────────────────

function reducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'NEW_GAME':
      return createInitialState();

    case 'TOGGLE_SELECT': {
      if (state.phase !== 'playing') return state;
      const next = new Set(state.selectedIds);
      if (next.has(action.cardId)) {
        next.delete(action.cardId);
      } else {
        next.add(action.cardId);
      }
      return { ...state, selectedIds: next, lastPlayWasInvalid: false };
    }

    case 'PLAY_EQUATION': {
      if (state.phase !== 'playing') return state;
      const selectedCards = state.hand.filter(c => state.selectedIds.has(c.id));
      const result = validateEquation(selectedCards);
      if (!result.valid) {
        return { ...state, lastPlayWasInvalid: true };
      }

      const { lhs, rhs } = result;
      const pointValue = getEquationPointValue(lhs, rhs);
      const zone = getZone(pointValue);

      const playedIds = new Set([...lhs.map(c => c.id), rhs.id]);
      const newHand = state.hand.filter(c => !playedIds.has(c.id));

      const drawCount = Math.min(7 - newHand.length, state.deck.length);
      const drawnCards = state.deck.slice(0, drawCount);
      const newDeck = state.deck.slice(drawCount);
      const filledHand = [...newHand, ...drawnCards];

      const newOcean = [
        ...state.ocean,
        { id: uuid(), lhs, rhs, zone, pointValue },
      ];

      const phase = determinePhase(filledHand, newDeck);
      const badge =
        phase !== 'playing' ? assignBadge(newOcean) : null;
      const score = phase !== 'playing' ? computeScore(filledHand) : 0;

      return {
        ...state,
        deck: newDeck,
        hand: filledHand,
        ocean: newOcean,
        phase,
        score,
        badge,
        selectedIds: new Set(),
        lastPlayWasInvalid: false,
        focusedIndex: Math.min(state.focusedIndex, Math.max(0, filledHand.length - 1)),
      };
    }

    case 'CLEAR_SELECTION':
      return { ...state, selectedIds: new Set(), lastPlayWasInvalid: false };

    case 'FOCUS_NEXT':
      return {
        ...state,
        focusedIndex: Math.min(state.focusedIndex + 1, state.hand.length - 1),
      };

    case 'FOCUS_PREV':
      return {
        ...state,
        focusedIndex: Math.max(state.focusedIndex - 1, 0),
      };

    case 'SET_FOCUS':
      return {
        ...state,
        focusedIndex: Math.max(0, Math.min(action.index, state.hand.length - 1)),
      };

    case 'CLEAR_SHAKE':
      return { ...state, lastPlayWasInvalid: false };

    case 'REQUEST_GIVE_UP':
      return { ...state, showGiveUpConfirm: true };

    case 'CANCEL_GIVE_UP':
      return { ...state, showGiveUpConfirm: false };

    case 'CONFIRM_GIVE_UP': {
      return {
        ...state,
        phase: 'giveup',
        score: 0,
        badge: null,
        showGiveUpConfirm: false,
      };
    }

    default:
      return state;
  }
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useGameState() {
  const [state, dispatch] = useReducer(reducer, undefined, createInitialState);

  const selectedCards = useMemo(
    () => state.hand.filter(c => state.selectedIds.has(c.id)),
    [state.hand, state.selectedIds]
  );

  const validation = useMemo(
    () => validateEquation(selectedCards),
    [selectedCards]
  );

  const resultCard = useMemo(
    () => (validation.valid ? validation.rhs : null),
    [validation]
  );

  const selectionDepth = useMemo(
    () => (validation.valid ? selectedCards.length : 0),
    [validation, selectedCards.length]
  );

  return { state, dispatch, selectedCards, validation, resultCard, selectionDepth };
}
