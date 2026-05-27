import { useCallback, useRef } from 'react';

type SoundName = 'select' | 'cast' | 'hint' | 'win';

const NOTES: Record<SoundName, Array<[number, number]>> = {
  select: [[660, 0.055]],
  hint: [[784, 0.06], [988, 0.08]],
  cast: [[440, 0.06], [660, 0.08], [880, 0.1]],
  win: [[523, 0.09], [659, 0.09], [784, 0.12], [1047, 0.18]],
};

export function useGameSounds(enabled: boolean) {
  const contextRef = useRef<AudioContext | null>(null);

  const getContext = useCallback(() => {
    contextRef.current ??= new AudioContext();
    return contextRef.current;
  }, []);

  return useCallback((name: SoundName) => {
    if (!enabled) return;

    const context = getContext();
    const start = context.currentTime;

    NOTES[name].forEach(([frequency, duration], index) => {
      const noteStart = start + index * 0.075;
      const oscillator = context.createOscillator();
      const gain = context.createGain();

      oscillator.type = name === 'win' ? 'triangle' : 'sine';
      oscillator.frequency.setValueAtTime(frequency, noteStart);
      gain.gain.setValueAtTime(0.0001, noteStart);
      gain.gain.exponentialRampToValueAtTime(0.045, noteStart + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + duration);

      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(noteStart);
      oscillator.stop(noteStart + duration + 0.015);
    });
  }, [enabled, getContext]);
}
