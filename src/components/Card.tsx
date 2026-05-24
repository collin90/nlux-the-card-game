import React from 'react';
import { Box, keyframes } from '@mui/material';
import type { Card as CardType } from '../logic/types';

// ─── Types ────────────────────────────────────────────────────────────────────

export type CardSize = 'normal' | 'mini' | 'stack-back';

interface CardProps {
  card: CardType;
  isSelected?: boolean;
  isResult?: boolean;
  isFocused?: boolean;
  selectionDepth?: number; // 0 = not in valid selection, 3-7 = depth
  onClick?: () => void;
  size?: CardSize;
  faceDown?: boolean;
  shake?: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SIZE_CONFIG = {
  normal: { width: 72, height: 100, fontSize: 16, rankSize: 13 },
  mini: { width: 44, height: 62, fontSize: 10, rankSize: 9 },
  'stack-back': { width: 40, height: 56, fontSize: 9, rankSize: 8 },
};

const SUIT_SYMBOLS: Record<string, string> = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠',
};

const RED_SUITS = new Set(['hearts', 'diamonds']);

const SELECTION_GREENS: Record<number, string> = {
  3: '#52b788',
  4: '#40916c',
  5: '#2d6a4f',
  6: '#1b4332',
  7: '#081c15',
};

const shakeAnim = keyframes`
  0%, 100% { transform: translateX(0) translateY(-8px); }
  20% { transform: translateX(-4px) translateY(-8px); }
  40% { transform: translateX(4px) translateY(-8px); }
  60% { transform: translateX(-4px) translateY(-8px); }
  80% { transform: translateX(4px) translateY(-8px); }
`;

const shakeAnimIdle = keyframes`
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-4px); }
  40% { transform: translateX(4px); }
  60% { transform: translateX(-4px); }
  80% { transform: translateX(4px); }
`;

// ─── Component ───────────────────────────────────────────────────────────────

const CardComponent: React.FC<CardProps> = ({
  card,
  isSelected = false,
  isResult = false,
  isFocused = false,
  selectionDepth = 0,
  onClick,
  size = 'normal',
  faceDown = false,
  shake = false,
}) => {
  const cfg = SIZE_CONFIG[size];
  const suitSymbol = SUIT_SYMBOLS[card.suit];
  const isRed = RED_SUITS.has(card.suit);
  const suitColor = isRed ? '#C0392B' : '#1a1a2e';

  // Determine background
  let bgColor = '#FAFAF8';
  let border = '1.5px solid rgba(0,0,0,0.12)';
  let boxShadow = '0 2px 8px rgba(0,0,0,0.25)';

  if (!faceDown && size !== 'stack-back') {
    if (isSelected && selectionDepth >= 3) {
      bgColor = SELECTION_GREENS[Math.min(selectionDepth, 7)] ?? '#52b788';
      border = `1.5px solid ${bgColor}`;
    } else if (isSelected && selectionDepth === 0) {
      // Invalid selection
      bgColor = 'rgba(198, 40, 40, 0.15)';
      border = '1.5px solid #e63946';
    }

    if (isResult) {
      boxShadow = '0 0 0 3px #00B4D8, 0 4px 12px rgba(0,0,0,0.35)';
    } else if (isSelected && selectionDepth >= 3) {
      boxShadow = '0 0 0 2px #52b788, 0 6px 16px rgba(0,0,0,0.4)';
    } else if (isSelected && selectionDepth === 0) {
      boxShadow = '0 0 0 2px #e63946, 0 4px 12px rgba(0,0,0,0.35)';
    }
  }

  if (isFocused && size !== 'stack-back') {
    boxShadow = boxShadow + ', 0 0 0 2px #90E0EF';
  }

  const liftY = isSelected && size === 'normal' ? -8 : 0;
  const animation =
    shake && isSelected
      ? `${shakeAnim} 0.4s ease`
      : shake && isFocused
      ? `${shakeAnimIdle} 0.4s ease`
      : undefined;

  // Face-down / stack-back rendering
  if (faceDown || size === 'stack-back') {
    return (
      <Box
        sx={{
          width: cfg.width,
          height: cfg.height,
          borderRadius: '6px',
          background: 'linear-gradient(135deg, #0077B6 0%, #023e8a 50%, #03045E 100%)',
          border: '1.5px solid rgba(144,224,239,0.3)',
          boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: onClick ? 'pointer' : 'default',
          flexShrink: 0,
        }}
      >
        <Box sx={{ fontSize: cfg.fontSize, opacity: 0.4 }}>🌊</Box>
      </Box>
    );
  }

  return (
    <Box
      role="button"
      tabIndex={-1}
      onClick={onClick}
      sx={{
        width: cfg.width,
        height: cfg.height,
        borderRadius: '6px',
        backgroundColor: bgColor,
        border,
        boxShadow,
        cursor: onClick ? 'pointer' : 'default',
        userSelect: 'none',
        transform: `translateY(${liftY}px)`,
        transition: 'transform 0.15s ease, box-shadow 0.15s ease, background-color 0.2s ease',
        animation,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: size === 'normal' ? '4px 5px' : '2px 3px',
        position: 'relative',
        flexShrink: 0,
        '&:hover': onClick
          ? {
              transform: `translateY(${liftY - 3}px)`,
              boxShadow: isResult
                ? '0 0 0 3px #00B4D8, 0 8px 20px rgba(0,0,0,0.5)'
                : '0 6px 18px rgba(0,0,0,0.4)',
            }
          : {},
        outline: 'none',
      }}
    >
      {/* Top-left rank + suit */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1 }}>
        <Box sx={{ fontWeight: 800, fontSize: cfg.rankSize, color: suitColor, lineHeight: 1.1 }}>
          {card.rank}
        </Box>
        <Box sx={{ fontSize: cfg.rankSize - 1, color: suitColor, lineHeight: 1 }}>
          {suitSymbol}
        </Box>
      </Box>

      {/* Center suit (only on normal size) */}
      {size === 'normal' && (
        <Box
          sx={{
            fontSize: 22,
            color: suitColor,
            textAlign: 'center',
            lineHeight: 1,
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        >
          {suitSymbol}
        </Box>
      )}

      {/* Bottom-right rank + suit (rotated) */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          lineHeight: 1,
          transform: 'rotate(180deg)',
        }}
      >
        <Box sx={{ fontWeight: 800, fontSize: cfg.rankSize, color: suitColor, lineHeight: 1.1 }}>
          {card.rank}
        </Box>
        <Box sx={{ fontSize: cfg.rankSize - 1, color: suitColor, lineHeight: 1 }}>
          {suitSymbol}
        </Box>
      </Box>
    </Box>
  );
};

export default CardComponent;
