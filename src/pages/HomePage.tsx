import React from 'react';
import { Box, Button, Typography, Chip, keyframes } from '@mui/material';
import WavesIcon from '@mui/icons-material/Waves';
import AutoModeIcon from '@mui/icons-material/AutoMode';
import TouchAppIcon from '@mui/icons-material/TouchApp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import type { DrawMode } from '../logic/types';

interface HomePageProps {
  bestScore: number | null;
  drawMode: DrawMode;
  soundEnabled: boolean;
  onDrawModeChange: (mode: DrawMode) => void;
  onToggleSound: () => void;
  onStart: () => void;
  onRules: () => void;
}

const wave = keyframes`
  0% { transform: translateX(0); }
  50% { transform: translateX(-60px); }
  100% { transform: translateX(0); }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-12px); }
`;

const shimmer = keyframes`
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
`;

const HomePage: React.FC<HomePageProps> = ({
  bestScore,
  drawMode,
  soundEnabled,
  onDrawModeChange,
  onToggleSound,
  onStart,
  onRules,
}) => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #03045E 0%, #0077B6 60%, #00B4D8 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Animated wave layers */}
      {[0, 1, 2].map(i => (
        <Box
          key={i}
          sx={{
            position: 'absolute',
            bottom: -10 + i * 20,
            left: '-20%',
            width: '140%',
            height: 80,
            borderRadius: '50%',
            background: `rgba(0,180,216,${0.06 + i * 0.04})`,
            animation: `${wave} ${6 + i * 2}s ease-in-out infinite`,
            animationDelay: `${i * 0.8}s`,
          }}
        />
      ))}

      {/* Hero content */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
          textAlign: 'center',
          px: 3,
          zIndex: 1,
        }}
      >
        {/* Ocean emoji floating */}
        <Box sx={{ animation: `${float} 4s ease-in-out infinite`, fontSize: 64, lineHeight: 1 }}>
          🌊
        </Box>

        <Typography
          variant="h2"
          sx={{
            fontWeight: 900,
            letterSpacing: -1,
            background: 'linear-gradient(90deg, #ADE8F4, #90E0EF, #48CAE4, #ADE8F4)',
            backgroundSize: '300% 100%',
            animation: `${shimmer} 5s linear infinite`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Nautilux: The Card Game
        </Typography>

        <Typography
          variant="subtitle1"
          sx={{ color: 'rgba(173,232,244,0.65)', maxWidth: 340, lineHeight: 1.6 }}
        >
          Cast equations into the ocean. Clear your hand. Brave the deep.
        </Typography>

        {/* Best score */}
        {bestScore !== null && (
          <Chip
            icon={<Typography sx={{ fontSize: 14, mr: -0.5 }}>🏆</Typography>}
            label={`Best Score: ${bestScore === 0 ? 'Perfect!' : bestScore}`}
            sx={{
              bgcolor: 'rgba(0,180,216,0.15)',
              color: '#ADE8F4',
              border: '1px solid rgba(0,180,216,0.35)',
              fontSize: 13,
              fontWeight: 600,
              py: 0.5,
            }}
          />
        )}

        {/* Action buttons */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, alignItems: 'center', mt: 1 }}>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
            {[
              { mode: 'auto' as const, label: 'Automatic Draw', icon: <AutoModeIcon fontSize="small" /> },
              { mode: 'manual' as const, label: 'Manual Draw', icon: <TouchAppIcon fontSize="small" /> },
            ].map(option => {
              const selected = drawMode === option.mode;
              return (
                <Button
                  key={option.mode}
                  variant={selected ? 'contained' : 'outlined'}
                  size="small"
                  startIcon={option.icon}
                  onClick={() => onDrawModeChange(option.mode)}
                  sx={{
                    minWidth: 154,
                    borderRadius: '999px',
                    py: 0.8,
                    px: 1.5,
                    fontSize: 12,
                    fontWeight: 800,
                    textTransform: 'none',
                    color: selected ? '#023e8a' : '#ADE8F4',
                    background: selected ? '#ADE8F4' : 'rgba(3, 4, 94, 0.18)',
                    border: selected ? '1px solid #ADE8F4' : '1px solid rgba(173,232,244,0.35)',
                    boxShadow: selected ? '0 4px 14px rgba(173,232,244,0.28)' : 'none',
                    '&:hover': {
                      background: selected ? '#CAF0F8' : 'rgba(173,232,244,0.1)',
                      borderColor: selected ? '#CAF0F8' : 'rgba(173,232,244,0.55)',
                    },
                  }}
                >
                  {option.label}
                </Button>
              );
            })}
          </Box>

          <Button
            variant="contained"
            size="large"
            onClick={onStart}
            startIcon={<WavesIcon />}
            sx={{
              minWidth: 220,
              py: 1.5,
              fontSize: 16,
              fontWeight: 800,
              borderRadius: '30px',
              background: 'linear-gradient(90deg, #0077B6, #00B4D8, #90E0EF, #00B4D8, #0077B6)',
              backgroundSize: '300% 100%',
              animation: `${shimmer} 3s linear infinite`,
              boxShadow: '0 6px 24px rgba(0,180,216,0.5)',
              letterSpacing: 0.5,
              '&:hover': {
                transform: 'translateY(-3px)',
                boxShadow: '0 10px 32px rgba(0,180,216,0.65)',
              },
            }}
          >
            Begin Voyage
          </Button>

          <Button
            variant="text"
            size="medium"
            onClick={onRules}
            sx={{
              color: 'rgba(144,224,239,0.7)',
              fontWeight: 600,
              '&:hover': { color: '#ADE8F4', background: 'rgba(144,224,239,0.08)' },
            }}
          >
            How to Play
          </Button>

          <Button
            variant="text"
            size="small"
            onClick={onToggleSound}
            startIcon={soundEnabled ? <VolumeUpIcon /> : <VolumeOffIcon />}
            sx={{
              color: soundEnabled ? '#FFD166' : 'rgba(144,224,239,0.58)',
              fontWeight: 700,
              textTransform: 'none',
              '&:hover': {
                color: soundEnabled ? '#FFE08A' : '#ADE8F4',
                background: 'rgba(144,224,239,0.08)',
              },
            }}
          >
            Sound {soundEnabled ? 'On' : 'Off'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default HomePage;
