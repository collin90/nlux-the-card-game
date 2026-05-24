import React from 'react';
import { Box } from '@mui/material';
import type { PlayedEquation } from '../logic/types';
import CardComponent from './Card';

interface EquationStackProps {
  equation: PlayedEquation;
}

const EquationStack: React.FC<EquationStackProps> = ({ equation }) => {
  const stackDepth = equation.lhs.length;

  return (
    <Box
      sx={{
        position: 'relative',
        width: 60,
        height: 62 + stackDepth * 5,
        flexShrink: 0,
        cursor: 'default',
      }}
    >
      {/* LHS cards — face-down backs, stacked with offset */}
      {equation.lhs.map((card, i) => (
        <Box
          key={card.id}
          sx={{
            position: 'absolute',
            top: (stackDepth - 1 - i) * 5,
            left: (stackDepth - 1 - i) * 2,
            zIndex: i,
          }}
        >
          <CardComponent
            card={card}
            size="stack-back"
            faceDown
          />
        </Box>
      ))}

      {/* RHS card — face-up on top */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: stackDepth + 1,
        }}
      >
        <CardComponent
          card={equation.rhs}
          size="mini"
          faceDown={false}
        />
      </Box>
    </Box>
  );
};

export default EquationStack;
