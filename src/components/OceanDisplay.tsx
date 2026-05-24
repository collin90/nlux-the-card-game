import React, { useRef, useEffect } from 'react';
import { Box } from '@mui/material';
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

  // Auto-scroll to show newly added equation's zone
  useEffect(() => {
    if (equations.length === 0) return;
    const latest = equations[equations.length - 1];
    const zoneOrder = { daylight: 0, twilight: 1, midnight: 2 };
    const zoneIndex = zoneOrder[latest.zone];
    const container = containerRef.current;
    if (!container) return;
    const zones = container.querySelectorAll('[data-zone]');
    if (zones[zoneIndex]) {
      (zones[zoneIndex] as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [equations.length]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      <Box
        ref={containerRef}
        sx={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          '&::-webkit-scrollbar': { width: 5 },
          '&::-webkit-scrollbar-track': { background: 'rgba(0,0,0,0.2)' },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(144,224,239,0.25)',
            borderRadius: 3,
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
