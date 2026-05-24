import React from 'react';
import { Button } from '@mui/material';
import AnchorIcon from '@mui/icons-material/Anchor';

interface GiveUpButtonProps {
  onClick: () => void;
}

const GiveUpButton: React.FC<GiveUpButtonProps> = ({ onClick }) => {
  return (
    <Button
      variant="outlined"
      size="small"
      onClick={onClick}
      startIcon={<AnchorIcon sx={{ fontSize: 16 }} />}
      sx={{
        px: 1.5,
        py: 0.6,
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: 0.3,
        borderRadius: '8px',
        background: 'linear-gradient(135deg, #22223b 0%, #4a4e69 100%)',
        color: 'rgba(200,200,220,0.75)',
        border: '1px solid rgba(100,100,140,0.4)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
        transition: 'all 0.25s ease',
        textTransform: 'none',
        '&:hover': {
          background: 'linear-gradient(135deg, #2d2d4e 0%, #5a5f80 100%)',
          borderColor: 'rgba(140,140,180,0.6)',
          color: 'rgba(200,200,220,0.95)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
          transform: 'translateY(-1px)',
        },
      }}
    >
      Give Up
    </Button>
  );
};

export default GiveUpButton;
