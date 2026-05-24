import React from 'react';
import { Box } from '@mui/material';
import type { OceanZone as OceanZoneType, PlayedEquation } from '../logic/types';
import EquationStack from './EquationStack';

interface OceanZoneProps {
  zone: OceanZoneType;
  equations: PlayedEquation[];
}

const ZONE_STYLES: Record<OceanZoneType, { background: string; minHeight: number }> = {
  daylight: {
    background: 'linear-gradient(180deg, #90E0EF 0%, #ADE8F4 40%, #48CAE4 100%)',
    minHeight: 90,
  },
  twilight: {
    background: 'linear-gradient(180deg, #0077B6 0%, #023e8a 100%)',
    minHeight: 90,
  },
  midnight: {
    background: 'linear-gradient(180deg, #03045E 0%, #010b1a 100%)',
    minHeight: 90,
  },
};

const OceanZone: React.FC<OceanZoneProps> = ({ zone, equations }) => {
  const style = ZONE_STYLES[zone];

  return (
    <Box
      sx={{
        background: style.background,
        minHeight: style.minHeight,
        padding: '10px 14px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '10px',
        alignContent: 'flex-start',
        alignItems: 'flex-start',
        transition: 'min-height 0.3s ease',
      }}
    >
      {equations.map(eq => (
        <EquationStack key={eq.id} equation={eq} />
      ))}

      {equations.length === 0 && (
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0.2,
            height: style.minHeight - 20,
          }}
        >
          <Box sx={{ fontSize: 22, mr: 1 }}>
            {zone === 'daylight' ? '☀️' : zone === 'twilight' ? '🌙' : '🌑'}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default OceanZone;
