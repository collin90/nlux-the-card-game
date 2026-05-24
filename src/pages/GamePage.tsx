import React, { useEffect, useCallback, useState } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Tooltip,
  Chip,
  keyframes,
} from '@mui/material';
import HelpOutlinedIcon from '@mui/icons-material/HelpOutlined';
import AddIcon from '@mui/icons-material/Add';
import { useGameState } from '../hooks/useGameState';
import { useBestScore } from '../hooks/useBestScore';
import Hand from '../components/Hand';
import Deck from '../components/Deck';
import OceanDisplay from '../components/OceanDisplay';
import EquationPreview from '../components/EquationPreview';
import CastButton from '../components/CastButton';
import GiveUpButton from '../components/GiveUpButton';
import WinDialog from '../components/WinDialog';
import RulesPage from './RulesPage';

interface GamePageProps {
  onGoHome: () => void;
}

const waveAnim = keyframes`
  0% { transform: translateX(0) scaleY(1); }
  50% { transform: translateX(-80px) scaleY(1.08); }
  100% { transform: translateX(0) scaleY(1); }
`;

const GamePage: React.FC<GamePageProps> = ({ onGoHome }) => {
  const { state, dispatch, validation, resultCard, selectionDepth } = useGameState();
  const { bestScore, updateBestScore } = useBestScore();
  const [showRules, setShowRules] = useState(false);

  // Update best score when game ends
  useEffect(() => {
    if (state.phase !== 'playing' && state.score >= 0) {
      updateBestScore(state.score);
    }
  }, [state.phase, state.score, updateBestScore]);

  // Keyboard handler
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Allow keys through when dialogs are open
      if (state.showGiveUpConfirm || state.phase !== 'playing') return;
      if (showRules && e.key !== '?') return;

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          dispatch({ type: 'FOCUS_PREV' });
          break;
        case 'ArrowRight':
          e.preventDefault();
          dispatch({ type: 'FOCUS_NEXT' });
          break;
        case ' ':
          e.preventDefault();
          {
            const focusedCard = state.hand[state.focusedIndex];
            if (focusedCard) dispatch({ type: 'TOGGLE_SELECT', cardId: focusedCard.id });
          }
          break;
        case 'Enter':
          e.preventDefault();
          if (validation.valid) dispatch({ type: 'PLAY_EQUATION' });
          break;
        case 'Escape':
          e.preventDefault();
          dispatch({ type: 'CLEAR_SELECTION' });
          break;
        case 'n':
        case 'N':
          dispatch({ type: 'NEW_GAME' });
          break;
        case '?':
          setShowRules(prev => !prev);
          break;
        case 'g':
        case 'G':
          dispatch({ type: 'REQUEST_GIVE_UP' });
          break;
        default:
          break;
      }
    },
    [state, dispatch, validation, showRules]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Clear shake after animation
  useEffect(() => {
    if (state.lastPlayWasInvalid) {
      const t = setTimeout(() => dispatch({ type: 'CLEAR_SHAKE' }), 500);
      return () => clearTimeout(t);
    }
  }, [state.lastPlayWasInvalid, dispatch]);

  const handlePlay = () => {
    if (validation.valid) dispatch({ type: 'PLAY_EQUATION' });
  };

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(160deg, #03045E 0%, #023e8a 60%, #0077B6 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background wave effect */}
      {[0, 1, 2].map(i => (
        <Box
          key={i}
          sx={{
            position: 'absolute',
            bottom: 280 + i * 60,
            left: '-10%',
            width: '120%',
            height: 40,
            borderRadius: '50%',
            background: `rgba(0,180,216,${0.04 + i * 0.02})`,
            animation: `${waveAnim} ${8 + i * 3}s ease-in-out infinite`,
            animationDelay: `${i * 1.2}s`,
            pointerEvents: 'none',
          }}
        />
      ))}

      {/* AppBar */}
      <AppBar
        position="static"
        elevation={0}
        sx={{
          background: 'rgba(2,62,138,0.7)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(144,224,239,0.15)',
          zIndex: 2,
        }}
      >
        <Toolbar sx={{ gap: 1, minHeight: '52px !important' }}>
          {/* Title */}
          <Typography
            variant="h6"
            sx={{
              fontWeight: 800,
              color: '#ADE8F4',
              letterSpacing: -0.3,
              cursor: 'pointer',
              flexShrink: 0,
              mr: 1,
            }}
            onClick={onGoHome}
          >
            🌊 Voyage
          </Typography>

          <Box sx={{ flex: 1 }} />

          {/* Score chips */}
          <Chip
            label={`Deck: ${state.deck.length}`}
            size="small"
            sx={{
              bgcolor: 'rgba(0,180,216,0.12)',
              color: '#90E0EF',
              border: '1px solid rgba(0,180,216,0.25)',
              fontSize: 11,
              fontWeight: 600,
            }}
          />

          {bestScore !== null && (
            <Chip
              label={`Best: ${bestScore}`}
              size="small"
              sx={{
                bgcolor: 'rgba(82,183,136,0.12)',
                color: '#52b788',
                border: '1px solid rgba(82,183,136,0.3)',
                fontSize: 11,
                fontWeight: 600,
              }}
            />
          )}

          <Tooltip title="How to Play (?)">
            <IconButton
              size="small"
              onClick={() => setShowRules(true)}
              sx={{ color: 'rgba(144,224,239,0.7)' }}
            >
              <HelpOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="New Game (N)">
            <IconButton
              size="small"
              onClick={() => dispatch({ type: 'NEW_GAME' })}
              sx={{ color: 'rgba(144,224,239,0.7)' }}
            >
              <AddIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <GiveUpButton onClick={() => dispatch({ type: 'REQUEST_GIVE_UP' })} />
        </Toolbar>
      </AppBar>

      {/* Main play area */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          zIndex: 1,
        }}
      >
        {/* Hand + deck row */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            px: 2,
            pt: 1.5,
            gap: 2,
            flexShrink: 0,
          }}
        >
          {/* Deck */}
          <Box sx={{ flexShrink: 0 }}>
            <Deck cardCount={state.deck.length} />
          </Box>

          {/* Divider */}
          <Box
            sx={{
              width: '1px',
              alignSelf: 'stretch',
              bgcolor: 'rgba(144,224,239,0.1)',
              flexShrink: 0,
            }}
          />

          {/* Hand + controls */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Hand
              hand={state.hand}
              selectedIds={state.selectedIds}
              resultCard={resultCard}
              focusedIndex={state.focusedIndex}
              selectionDepth={selectionDepth}
              onCardClick={id => dispatch({ type: 'TOGGLE_SELECT', cardId: id })}
              onFocusChange={i => dispatch({ type: 'SET_FOCUS', index: i })}
              isShaking={state.lastPlayWasInvalid}
            />

            <Box sx={{ px: 1 }}>
              <EquationPreview
                validation={validation}
                selectedCount={state.selectedIds.size}
              />
            </Box>

            <CastButton disabled={!validation.valid} onClick={handlePlay} />
          </Box>
        </Box>

        {/* Ocean */}
        <Box sx={{ flex: 1, overflow: 'hidden', mt: 1.5 }}>
          <OceanDisplay equations={state.ocean} />
        </Box>
      </Box>

      {/* Rules modal */}
      <RulesPage open={showRules} onClose={() => setShowRules(false)} />

      {/* Win / end dialogs */}
      <WinDialog
        phase={state.phase}
        score={state.score}
        bestScore={bestScore}
        badge={state.badge}
        showGiveUpConfirm={state.showGiveUpConfirm}
        onNewGame={() => dispatch({ type: 'NEW_GAME' })}
        onCancelGiveUp={() => dispatch({ type: 'CANCEL_GIVE_UP' })}
        onConfirmGiveUp={() => dispatch({ type: 'CONFIRM_GIVE_UP' })}
      />
    </Box>
  );
};

export default GamePage;
