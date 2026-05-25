import type { Card, OceanZone, PlayedEquation, ValidationResult, BadgeAnimal } from './types';
import { ZONE_ANIMALS } from './animals';

// ─── Validation ──────────────────────────────────────────────────────────────

export function validateEquation(selected: Card[]): ValidationResult {
  if (selected.length < 3) return { valid: false };

  const faces = selected.filter(c => c.isFace);
  const numbers = selected.filter(c => !c.isFace);

  // Case 1: All non-face cards; one card equals the sum of the rest
  if (faces.length === 0) {
    const totalSum = numbers.reduce((s, c) => s + c.value, 0);
    for (const c of numbers) {
      const rest = totalSum - c.value;
      if (rest === c.value && rest > 0) {
        const lhs = numbers.filter(x => x.id !== c.id);
        const preview = buildPreview(lhs, c);
        return { valid: true, lhs, rhs: c, preview };
      }
    }
    return { valid: false };
  }

  // Case 2: Face result, number LHS — exactly 1 face, all others non-face with EQUAL value, ≥2 non-face
  if (faces.length === 1 && numbers.length >= 2) {
    const allEqual = numbers.every(c => c.value === numbers[0].value);
    if (allEqual) {
      const rhs = faces[0];
      const preview = buildPreview(numbers, rhs);
      return { valid: true, lhs: numbers, rhs, preview };
    }
    return { valid: false };
  }

  // Case 3: Face result, face LHS — all face cards, ≥3, any one as rhs if all others share same rank
  if (faces.length === selected.length && faces.length >= 3) {
    for (const candidate of faces) {
      const rest = faces.filter(c => c.id !== candidate.id);
      const sameRank = rest.every(c => c.rank === rest[0].rank);
      if (sameRank) {
        const preview = buildPreview(rest, candidate);
        return { valid: true, lhs: rest, rhs: candidate, preview };
      }
    }
    return { valid: false };
  }

  return { valid: false };
}

function buildPreview(lhs: Card[], rhs: Card): string {
  const lhsStr = lhs.map(c => c.rank).join(' + ');
  return `${lhsStr} = ${rhs.rank}`;
}

// ─── Subset check for gameover detection ──────────────────────────────────────

export function hasAnyValidEquation(hand: Card[]): boolean {
  const n = hand.length;
  const maxMask = 1 << n;
  for (let mask = 0; mask < maxMask; mask++) {
    const subset: Card[] = [];
    for (let i = 0; i < n; i++) {
      if (mask & (1 << i)) subset.push(hand[i]);
    }
    if (subset.length < 3) continue;
    if (validateEquation(subset).valid) return true;
  }
  return false;
}

// ─── Scoring ─────────────────────────────────────────────────────────────────

export function computeScore(hand: Card[]): number {
  return hand.reduce((sum, c) => sum + (c.isFace ? 15 : c.value), 0);
}

// ─── Zone calculation ────────────────────────────────────────────────────────

export function getEquationPointValue(lhs: Card[], rhs: Card): number {
  const cardScore = (c: Card) => (c.isFace ? 15 : c.value);
  return [...lhs, rhs].reduce((sum, c) => sum + cardScore(c), 0);
}

export function getZone(pointValue: number): OceanZone {
  if (pointValue < 20) return 'daylight';
  if (pointValue <= 30) return 'twilight';
  return 'midnight';
}

// ─── Badge assignment ────────────────────────────────────────────────────────

export function assignBadge(ocean: PlayedEquation[]): BadgeAnimal {
  const counts = { daylight: 0, twilight: 0, midnight: 0 };
  ocean.forEach(eq => counts[eq.zone]++);

  const maxCount = Math.max(counts.daylight, counts.twilight, counts.midnight);
  const winners = (Object.keys(counts) as OceanZone[]).filter(
    z => counts[z] === maxCount
  );
  const winningZone = winners[Math.floor(Math.random() * winners.length)];
  const animals = ZONE_ANIMALS[winningZone];
  return animals[Math.floor(Math.random() * animals.length)];
}

// ─── UUID ────────────────────────────────────────────────────────────────────

export function uuid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}
