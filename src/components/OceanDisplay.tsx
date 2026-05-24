import React from 'react';
import { Box } from '@mui/material';
import type { PlayedEquation } from '../logic/types';
import OceanZone from './OceanZone';

interface OceanDisplayProps {
  equations: PlayedEquation[];
}

const OceanDisplay: React.FC<OceanDisplayProps> = ({ equations }) => {
  const daylight = equations.filter(e => e.zone === 'daylight');
  const twilight = equations.filter(e => e.zone === 'twilight');
  const midnight = equations.filter(e => e.zone === 'midnight');

  return (
    // minHeight: 100% so zones fill the scroll container on desktop
    // when there are few equations; content expands naturally when more are added
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      <OceanZone zone="daylight" equations={daylight} />
      <OceanZone zone="twilight" equations={twilight} />
      <OceanZone zone="midnight" equations={midnight} />
    </Box>
  );
};

export default OceanDisplay;
