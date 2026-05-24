import React from 'react';
import { Box } from '@mui/material';
import type { OceanZone as OceanZoneType, PlayedEquation } from '../logic/types';
import EquationStack from './EquationStack';

interface OceanZoneProps {
  zone: OceanZoneType;
  equations: PlayedEquation[];
}

const ZONE_CONFIG: Record<OceanZoneType, { background: string; emoji: string; minHeight: number }> = {
  daylight: {
    background: 'linear-gradient(180deg, #90E0EF 0%, #ADE8F4 40%, #48CAE4 100%)',
    emoji: '☀️',
    minHeight: 80,
  },
  twilight: {
    background: 'linear-gradient(180deg, #0077B6 0%, #023e8a 100%)',
    emoji: '🌙',
    minHeight: 80,
  },
  midnight: {
    background: 'linear-gradient(180deg, #03045E 0%, #010b1a 100%)',
    emoji: '🌑',
    minHeight: 80,
  },
};

const OceanZone: React.FC<OceanZoneProps> = ({ zone, equations }) => {
  const cfg = ZONE_CONFIG[zone];

  return (
    <Box
      sx={{
        background: cfg.background,
        minHeight: cfg.minHeight,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-start',
      }}
    >
      {/* Zone emoji — fixed to the left, always visible */}
      <Box
        sx={{
          width: 48,
          minHeight: cfg.minHeight,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          fontSize: 28,
          borderRight: zone === 'daylight'
            ? '1px solid rgba(0,100,150,0.2)'
            : zone === 'twilight'
            ? '1px solid rgba(144,224,239,0.15)'
            : '1px solid rgba(144,224,239,0.08)',
        }}
      >
        {cfg.emoji}
      </Box>

      {/* Equations — flow to the right of the emoji */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexWrap: 'wrap',
          gap: '10px',
          padding: '10px 12px',
          alignContent: 'flex-start',
          alignItems: 'flex-start',
          minHeight: cfg.minHeight,
        }}
      >
        {equations.map(eq => (
          <EquationStack key={eq.id} equation={eq} />
        ))}
      </Box>
    </Box>
  );
};

export default OceanZone;
