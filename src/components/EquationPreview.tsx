import React from 'react';
import { Box, Typography } from '@mui/material';
import type { ValidationResult } from '../logic/types';

interface EquationPreviewProps {
  validation: ValidationResult;
  selectedCount: number;
}

const EquationPreview: React.FC<EquationPreviewProps> = ({
  validation,
  selectedCount,
}) => {
  if (selectedCount < 3) {
    return (
      <Box
        sx={{
          height: 36,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant="caption" sx={{ color: 'rgba(144,224,239,0.4)', fontSize: 12 }}>
          Select 3+ cards to form an equation
        </Typography>
      </Box>
    );
  }

  if (validation.valid) {
    // Highlight the result part
    const [lhsPart, rhsPart] = validation.preview.split(' = ');
    return (
      <Box
        sx={{
          height: 36,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(82,183,136,0.15)',
          borderRadius: '8px',
          border: '1px solid rgba(82,183,136,0.4)',
          px: 2,
        }}
      >
        <Typography
          variant="body2"
          sx={{ color: '#52b788', fontWeight: 600, fontFamily: 'monospace', fontSize: 14 }}
        >
          {lhsPart}
          <Box component="span" sx={{ color: 'rgba(144,224,239,0.6)', mx: 0.5 }}>
            =
          </Box>
          <Box component="span" sx={{ color: '#ADE8F4', fontWeight: 800 }}>
            {rhsPart}
          </Box>
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: 36,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(230,57,70,0.1)',
        borderRadius: '8px',
        border: '1px solid rgba(230,57,70,0.3)',
        px: 2,
      }}
    >
      <Typography variant="caption" sx={{ color: '#e63946', fontSize: 12 }}>
        {validation.reason ?? 'Not a valid equation'}
      </Typography>
    </Box>
  );
};

export default EquationPreview;
