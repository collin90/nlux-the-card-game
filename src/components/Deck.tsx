import React from 'react';
import { Box, Typography, keyframes } from '@mui/material';

interface DeckProps {
  cardCount: number;
  canDraw?: boolean;   // manual mode + hand not full + deck not empty
  onDraw?: () => void;
}

const pulseGlow = keyframes`
  0%, 100% { box-shadow: 0 4px 12px rgba(0,0,0,0.5), 0 0 0 0 rgba(0,180,216,0); }
  50%       { box-shadow: 0 4px 12px rgba(0,0,0,0.5), 0 0 0 6px rgba(0,180,216,0.35); }
`;

const Deck: React.FC<DeckProps> = ({ cardCount, canDraw = false, onDraw }) => {
  const isEmpty = cardCount === 0;

  return (
    <Box
      sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}
      onClick={canDraw ? onDraw : undefined}
      title={canDraw ? 'Click to draw a card (Shift)' : undefined}
    >
      <Box sx={{ position: 'relative', width: 72, height: 100 }}>
        {/* Stack layers */}
        {!isEmpty &&
          [2, 1, 0].map(offset => (
            <Box
              key={offset}
              sx={{
                position: 'absolute',
                width: 72,
                height: 100,
                top: offset * 2,
                left: offset * 2,
                borderRadius: '6px',
                background: canDraw
                  ? 'linear-gradient(135deg, #00B4D8 0%, #0077B6 50%, #023e8a 100%)'
                  : 'linear-gradient(135deg, #0077B6 0%, #023e8a 50%, #03045E 100%)',
                border: canDraw
                  ? '1.5px solid rgba(0,180,216,0.7)'
                  : '1.5px solid rgba(144,224,239,0.3)',
                boxShadow:
                  offset === 0
                    ? '0 4px 12px rgba(0,0,0,0.5)'
                    : '0 2px 6px rgba(0,0,0,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: canDraw ? 'pointer' : 'default',
                // Pulse animation only on top card when drawable
                animation: offset === 0 && canDraw ? `${pulseGlow} 2s ease-in-out infinite` : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              {offset === 0 && (
                <Box sx={{ fontSize: 20, opacity: canDraw ? 0.85 : 0.5 }}>
                  {canDraw ? '✋' : '🌊'}
                </Box>
              )}
            </Box>
          ))}

        {/* Empty deck */}
        {isEmpty && (
          <Box
            sx={{
              width: 72,
              height: 100,
              borderRadius: '6px',
              border: '2px dashed rgba(144,224,239,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 0.4,
            }}
          >
            <Typography sx={{ fontSize: 20 }}>✓</Typography>
          </Box>
        )}
      </Box>

      <Typography
        variant="caption"
        sx={{
          color: isEmpty ? 'success.main' : canDraw ? '#00B4D8' : 'primary.light',
          fontWeight: 600,
          fontSize: 11,
          textAlign: 'center',
          letterSpacing: 0.5,
        }}
      >
        {isEmpty ? 'Empty' : canDraw ? `Draw (${cardCount})` : `${cardCount} left`}
      </Typography>
    </Box>
  );
};

export default Deck;
