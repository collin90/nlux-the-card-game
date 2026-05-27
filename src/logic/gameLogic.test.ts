import { describe, expect, it } from 'vitest';
import type { Card, Rank, Suit } from './types';
import { findFirstValidEquation, validateEquation } from './gameLogic';

let id = 0;

function card(rank: Rank, suit: Suit = 'spades'): Card {
  const isFace = rank === 'J' || rank === 'Q' || rank === 'K';
  const value = rank === 'A' ? 1 : isFace ? 0 : Number(rank);
  id += 1;
  return {
    id: String(id),
    rank,
    suit,
    isFace,
    value,
  };
}

describe('validateEquation', () => {
  it('accepts a number card equal to the sum of the other number cards', () => {
    const result = validateEquation([card('2'), card('3'), card('5')]);

    expect(result.valid).toBe(true);
    expect(result.valid && result.preview).toBe('2 + 3 = 5');
  });

  it('rejects number cards when no card equals the sum of the rest', () => {
    const result = validateEquation([card('2'), card('3'), card('4')]);

    expect(result.valid).toBe(false);
    expect(!result.valid && result.reason).toContain('sum');
  });

  it('accepts a face result when number cards share the same value', () => {
    const result = validateEquation([card('5'), card('5', 'hearts'), card('Q')]);

    expect(result.valid).toBe(true);
    expect(result.valid && result.preview).toBe('5 + 5 = Q');
  });

  it('rejects a face result when number cards do not share the same value', () => {
    const result = validateEquation([card('2'), card('3'), card('J')]);

    expect(result.valid).toBe(false);
    expect(!result.valid && result.reason).toContain('same value');
  });

  it('accepts face-only equations when the left side shares a rank', () => {
    const result = validateEquation([card('K'), card('K', 'hearts'), card('J')]);

    expect(result.valid).toBe(true);
    expect(result.valid && result.preview).toBe('K + K = J');
  });

  it('rejects face-only equations with mixed left-side ranks', () => {
    const result = validateEquation([card('J'), card('Q'), card('K')]);

    expect(result.valid).toBe(false);
    expect(!result.valid && result.reason).toContain('Face equations');
  });

  it('finds the first valid equation in a hand for hints', () => {
    const hand = [card('2'), card('9'), card('4'), card('4', 'hearts'), card('8')];
    const hint = findFirstValidEquation(hand);

    expect(hint?.map(c => c.rank)).toEqual(['4', '4', '8']);
  });
});
