import React from 'react';
import { Box, Button, keyframes } from '@mui/material';
import WavesIcon from '@mui/icons-material/Waves';

interface CastButtonProps {
  disabled: boolean;
  onClick: () => void;
}

const shimmer = keyframes`
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
`;

const ripple = keyframes`
  0% { transform: scale(1); opacity: 0.6; }
  100% { transform: scale(2.5); opacity: 0; }
`;

const CastButton: React.FC<CastButtonProps> = ({ disabled, onClick }) => {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1.5 }}>
      <Button
        variant="contained"
        size="large"
        disabled={disabled}
        onClick={onClick}
        startIcon={<WavesIcon />}
        sx={{
          minWidth: 200,
          py: 1.4,
          px: 4,
          fontSize: 15,
          fontWeight: 700,
          letterSpacing: 0.5,
          borderRadius: '30px',
          position: 'relative',
          overflow: 'hidden',
          background: disabled
            ? 'rgba(30,50,80,0.5)'
            : 'linear-gradient(90deg, #0077B6, #00B4D8, #90E0EF, #00B4D8, #0077B6)',
          backgroundSize: '300% 100%',
          color: disabled ? 'rgba(255,255,255,0.3)' : '#fff',
          boxShadow: disabled
            ? 'none'
            : '0 4px 20px rgba(0,180,216,0.45), 0 2px 8px rgba(0,0,0,0.3)',
          border: disabled ? '1px solid rgba(144,224,239,0.15)' : 'none',
          transition: 'all 0.3s ease',
          animation: disabled ? 'none' : `${shimmer} 3s linear infinite`,
          '&:hover:not(:disabled)': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 28px rgba(0,180,216,0.6), 0 4px 12px rgba(0,0,0,0.3)',
          },
          '&:active:not(:disabled)': {
            transform: 'translateY(0)',
          },
          // Ripple pseudo-element on active
          '&::after': {
            content: '""',
            position: 'absolute',
            borderRadius: '50%',
            width: '100%',
            height: '100%',
            top: 0,
            left: 0,
            pointerEvents: 'none',
          },
          '&:active::before': disabled
            ? {}
            : {
                content: '""',
                position: 'absolute',
                width: 60,
                height: 60,
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.3)',
                animation: `${ripple} 0.5s ease-out`,
              },
        }}
      >
        Cast into Ocean
      </Button>
    </Box>
  );
};

export default CastButton;
