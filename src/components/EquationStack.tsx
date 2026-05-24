import React from 'react';
import { Box } from '@mui/material';
import type { PlayedEquation } from '../logic/types';
import CardComponent from './Card';

interface EquationStackProps {
  equation: PlayedEquation;
}

// Normal card dimensions
const CARD_W = 72;
const CARD_H = 100;
const OFFSET_X = 4; // px per card peeking to the right
const OFFSET_Y = 7; // px per card peeking downward

const EquationStack: React.FC<EquationStackProps> = ({ equation }) => {
  const stackDepth = equation.lhs.length;
  const containerW = CARD_W + (stackDepth - 1) * OFFSET_X + 4;
  const containerH = CARD_H + (stackDepth - 1) * OFFSET_Y;

  return (
    <Box
      sx={{
        position: 'relative',
        width: containerW,
        height: containerH,
        flexShrink: 0,
        cursor: 'default',
      }}
    >
      {/* LHS cards — face-down backs, each peeking below the one above */}
      {equation.lhs.map((card, i) => (
        <Box
          key={card.id}
          sx={{
            position: 'absolute',
            // i=0 is the deepest/bottom of the stack (most offset)
            // i=stackDepth-1 is just under the top card (least offset)
            top: (stackDepth - 1 - i) * OFFSET_Y,
            left: (stackDepth - 1 - i) * OFFSET_X,
            zIndex: i + 1,
          }}
        >
          <CardComponent card={card} size="normal" faceDown />
        </Box>
      ))}

      {/* RHS result card — face-up on top of the stack */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: stackDepth + 2,
        }}
      >
        <CardComponent card={equation.rhs} size="normal" faceDown={false} />
      </Box>
    </Box>
  );
};

export default EquationStack;
