import React, { useRef, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import type { PlayedEquation } from '../logic/types';
import OceanZone from './OceanZone';

interface OceanDisplayProps {
  equations: PlayedEquation[];
}

const OceanDisplay: React.FC<OceanDisplayProps> = ({ equations }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const daylight = equations.filter(e => e.zone === 'daylight');
  const twilight = equations.filter(e => e.zone === 'twilight');
  const midnight = equations.filter(e => e.zone === 'midnight');

  // Auto-scroll to bottom when new equation is added
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [equations.length]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        borderTop: '2px solid rgba(144,224,239,0.15)',
        position: 'relative',
      }}
    >
      <Typography
        variant="caption"
        sx={{
          position: 'absolute',
          top: 4,
          right: 12,
          color: 'rgba(144,224,239,0.4)',
          fontSize: 10,
          letterSpacing: 0.5,
          zIndex: 1,
        }}
      >
        THE OCEAN
      </Typography>

      <Box
        ref={containerRef}
        sx={{
          overflowY: 'auto',
          maxHeight: 300,
          '&::-webkit-scrollbar': { width: 4 },
          '&::-webkit-scrollbar-track': { background: 'rgba(0,0,0,0.2)' },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(144,224,239,0.3)',
            borderRadius: 2,
          },
        }}
      >
        <OceanZone zone="daylight" equations={daylight} />
        <OceanZone zone="twilight" equations={twilight} />
        <OceanZone zone="midnight" equations={midnight} />
      </Box>
    </Box>
  );
};

export default OceanDisplay;
