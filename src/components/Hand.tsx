import React, { useRef, useEffect } from 'react';
import { Box } from '@mui/material';
import type { Card as CardType } from '../logic/types';
import CardComponent from './Card';

interface HandProps {
  hand: CardType[];
  selectedIds: Set<string>;
  resultCard: CardType | null;
  focusedIndex: number;
  selectionDepth: number;
  onCardClick: (cardId: string) => void;
  onFocusChange: (index: number) => void;
  isShaking: boolean;
}

const Hand: React.FC<HandProps> = ({
  hand,
  selectedIds,
  resultCard,
  focusedIndex,
  selectionDepth,
  onCardClick,
  onFocusChange,
  isShaking,
}) => {
  const cardRefs = useRef<Array<HTMLElement | null>>([]);

  // Focus the focused card element when focusedIndex changes
  useEffect(() => {
    const el = cardRefs.current[focusedIndex];
    if (el) el.focus();
  }, [focusedIndex]);

  return (
    <Box
      role="group"
      aria-label="Your Hand"
      sx={{
        display: 'flex',
        gap: 1.5,
        alignItems: 'flex-end',
        justifyContent: 'center',
        minHeight: 116,
        flexWrap: 'nowrap',
        padding: '8px 12px',
      }}
    >
      {/* Render 7 slots */}
      {Array.from({ length: 7 }).map((_, i) => {
        const card = hand[i];
        const isFocused = i === focusedIndex;
        const isSelected = card ? selectedIds.has(card.id) : false;
        const isResult = card ? card.id === resultCard?.id : false;

        if (!card) {
          // Empty slot placeholder
          return (
            <Box
              key={`slot-${i}`}
              sx={{
                width: 72,
                height: 100,
                borderRadius: '6px',
                border: '1.5px dashed rgba(144,224,239,0.15)',
                flexShrink: 0,
              }}
            />
          );
        }

        return (
          <Box
            key={card.id}
            ref={(el: HTMLElement | null) => {
              cardRefs.current[i] = el;
            }}
            tabIndex={isFocused ? 0 : -1}
            onFocus={() => onFocusChange(i)}
            sx={{ outline: 'none', flexShrink: 0 }}
          >
            <CardComponent
              card={card}
              isSelected={isSelected}
              isResult={isResult}
              isFocused={isFocused}
              selectionDepth={isSelected ? selectionDepth : 0}
              onClick={() => onCardClick(card.id)}
              size="normal"
              shake={isShaking && isSelected}
            />
          </Box>
        );
      })}
    </Box>
  );
};

export default Hand;
