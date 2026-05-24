import { useState, useCallback } from 'react';

const KEY = 'nlux-best-score';

export function useBestScore() {
  const [bestScore, setBestScore] = useState<number | null>(() => {
    const raw = localStorage.getItem(KEY);
    if (raw === null) return null;
    const n = parseInt(raw, 10);
    return isNaN(n) ? null : n;
  });

  const updateBestScore = useCallback((score: number) => {
    setBestScore(prev => {
      if (prev === null || score < prev) {
        localStorage.setItem(KEY, String(score));
        return score;
      }
      return prev;
    });
  }, []);

  return { bestScore, updateBestScore };
}
