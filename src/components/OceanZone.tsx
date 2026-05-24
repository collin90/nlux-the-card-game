import React from 'react';
import { Box } from '@mui/material';
import type { OceanZone as OceanZoneType, PlayedEquation } from '../logic/types';
import EquationStack from './EquationStack';

interface OceanZoneProps {
  zone: OceanZoneType;
  equations: PlayedEquation[];
}

const ZONE_CONFIG: Record<OceanZoneType, { background: string; emoji: string }> = {
  daylight: {
    background: 'linear-gradient(180deg, #90E0EF 0%, #ADE8F4 40%, #48CAE4 100%)',
    emoji: '☀️',
  },
  twilight: {
    background: 'linear-gradient(180deg, #0077B6 0%, #023e8a 100%)',
    emoji: '🌙',
  },
  midnight: {
    background: 'linear-gradient(180deg, #03045E 0%, #010b1a 100%)',
    emoji: '🌑',
  },
};

const OceanZone: React.FC<OceanZoneProps> = ({ zone, equations }) => {
  const cfg = ZONE_CONFIG[zone];

  return (
    <Box
      data-zone={zone}
      sx={{
        background: cfg.background,
        flex: 1,
        minHeight: 140,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-start',
      }}
    >
      {/* Zone emoji — fixed to the left, always bold and visible */}
      <Box
        sx={{
          width: 56,
          minHeight: 140,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          fontSize: 30,
          borderRight: zone === 'daylight'
            ? '1px solid rgba(0,100,150,0.25)'
            : zone === 'twilight'
            ? '1px solid rgba(144,224,239,0.18)'
            : '1px solid rgba(144,224,239,0.1)',
        }}
      >
        {cfg.emoji}
      </Box>

      {/* Equations — flow to the right, wrap to next row */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexWrap: 'wrap',
          gap: '14px',
          padding: '14px 16px',
          alignContent: 'flex-start',
          alignItems: 'flex-start',
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
