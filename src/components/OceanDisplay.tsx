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

  // Fill the parent height; each OceanZone takes flex:1 of that height.
  // No overflow/scroll here — zones shrink their content to fit.
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <OceanZone zone="daylight" equations={daylight} />
      <OceanZone zone="twilight" equations={twilight} />
      <OceanZone zone="midnight" equations={midnight} />
    </Box>
  );
};

export default OceanDisplay;
