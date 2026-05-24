import React from 'react';
import { Box, Typography } from '@mui/material';

interface DeckProps {
  cardCount: number;
}

const Deck: React.FC<DeckProps> = ({ cardCount }) => {
  const isEmpty = cardCount === 0;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
      <Box sx={{ position: 'relative', width: 72, height: 100 }}>
        {/* Stack layers (show up to 3 offset backs) */}
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
                background:
                  'linear-gradient(135deg, #0077B6 0%, #023e8a 50%, #03045E 100%)',
                border: '1.5px solid rgba(144,224,239,0.3)',
                boxShadow:
                  offset === 0
                    ? '0 4px 12px rgba(0,0,0,0.5)'
                    : '0 2px 6px rgba(0,0,0,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {offset === 0 && (
                <Box sx={{ fontSize: 20, opacity: 0.5 }}>🌊</Box>
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
          color: isEmpty ? 'success.main' : 'primary.light',
          fontWeight: 600,
          fontSize: 11,
          textAlign: 'center',
          letterSpacing: 0.5,
        }}
      >
        {isEmpty ? 'Empty' : `${cardCount} left`}
      </Typography>
    </Box>
  );
};

export default Deck;
