import { useReducer, useMemo } from 'react';
import type { GameState, GamePhase, Card, DrawMode } from '../logic/types';
import { createDeck, shuffle } from '../logic/deck';
import {
  validateEquation,
  hasAnyValidEquation,
  findFirstValidEquation,
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
  | { type: 'DRAW_CARD' }
  | { type: 'SET_DRAW_MODE'; mode: DrawMode }
  | { type: 'CLEAR_SELECTION' }
  | { type: 'SHOW_HINT' }
  | { type: 'FOCUS_NEXT' }
  | { type: 'FOCUS_PREV' }
  | { type: 'SET_FOCUS'; index: number }
  | { type: 'CLEAR_SHAKE' }
  | { type: 'REQUEST_GIVE_UP' }
  | { type: 'CANCEL_GIVE_UP' }
  | { type: 'CONFIRM_GIVE_UP' }
  | { type: 'REORDER_HAND'; fromIndex: number; toIndex: number };

// ─── Initial state factory ────────────────────────────────────────────────────

function createInitialState(drawMode: DrawMode = 'auto'): GameState {
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
    drawMode,
    hintsUsed: 0,
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function determinePhase(hand: Card[], deck: Card[]): GamePhase {
  if (hand.length === 0 && deck.length === 0) return 'win';
  if (!hasAnyValidEquation(hand)) {
    return deck.length === 0 ? 'gameover' : 'playing';
  }
  return 'playing';
}

// ─── Reducer ─────────────────────────────────────────────────────────────────

function reducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'NEW_GAME': {
      // Preserve draw mode preference across new games
      const fresh = createInitialState();
      return { ...fresh, drawMode: state.drawMode };
    }

    case 'SET_DRAW_MODE':
      return { ...state, drawMode: action.mode };

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

      const newOcean = [
        ...state.ocean,
        { id: uuid(), lhs, rhs, zone, pointValue },
      ];

      // In auto mode, draw back up to 7 immediately.
      // In manual mode, leave the hand as-is for the player to draw manually.
      let filledHand = newHand;
      let newDeck = state.deck;
      if (state.drawMode === 'auto') {
        const drawCount = Math.min(7 - newHand.length, state.deck.length);
        const drawnCards = state.deck.slice(0, drawCount);
        newDeck = state.deck.slice(drawCount);
        filledHand = [...newHand, ...drawnCards];
      }

      const phase = determinePhase(filledHand, newDeck);
      const badge = phase !== 'playing' ? assignBadge(newOcean) : null;
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

    case 'DRAW_CARD': {
      if (state.phase !== 'playing') return state;
      if (state.drawMode !== 'manual') return state;
      if (state.deck.length === 0) return state;
      if (state.hand.length >= 7) return state;

      const drawnCard = state.deck[0];
      const newDeck = state.deck.slice(1);
      const newHand = [...state.hand, drawnCard];

      const phase = determinePhase(newHand, newDeck);
      const badge = phase !== 'playing' ? assignBadge(state.ocean) : null;
      const score = phase !== 'playing' ? computeScore(newHand) : 0;

      return {
        ...state,
        deck: newDeck,
        hand: newHand,
        phase,
        score,
        badge,
      };
    }

    case 'CLEAR_SELECTION':
      return { ...state, selectedIds: new Set(), lastPlayWasInvalid: false };

    case 'SHOW_HINT': {
      if (state.phase !== 'playing') return state;
      const hint = findFirstValidEquation(state.hand);
      if (state.hintsUsed >= 2) return state;
      if (!hint) return state;
      return {
        ...state,
        selectedIds: new Set(hint.map(c => c.id)),
        focusedIndex: Math.max(0, state.hand.findIndex(c => c.id === hint[0].id)),
        lastPlayWasInvalid: false,
        hintsUsed: state.hintsUsed + 1,
      };
    }

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

    case 'REORDER_HAND': {
      if (state.phase !== 'playing') return state;
      const newHand = [...state.hand];
      const [moved] = newHand.splice(action.fromIndex, 1);
      newHand.splice(action.toIndex, 0, moved);
      return {
        ...state,
        hand: newHand,
        focusedIndex: action.toIndex,
      };
    }

    default:
      return state;
  }
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useGameState(initialDrawMode: DrawMode = 'auto') {
  const [state, dispatch] = useReducer(
    reducer,
    initialDrawMode,
    createInitialState
  );

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
    () => (validation.valid || selectedCards.length < 3 ? selectedCards.length : 0),
    [validation, selectedCards.length]
  );

  const canDraw = useMemo(
    () =>
      state.drawMode === 'manual' &&
      state.phase === 'playing' &&
      state.deck.length > 0 &&
      state.hand.length < 7,
    [state.drawMode, state.phase, state.deck.length, state.hand.length]
  );

  return { state, dispatch, selectedCards, validation, resultCard, selectionDepth, canDraw };
}
