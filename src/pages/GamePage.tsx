import React, { useEffect, useCallback, useState } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Tooltip,
  Chip,
  Switch,
  FormControlLabel,
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
  const { state, dispatch, validation, resultCard, selectionDepth, canDraw } = useGameState();
  const { bestScore, updateBestScore } = useBestScore();
  const [showRules, setShowRules] = useState(false);

  // Update best score when game ends (not on give-up)
  useEffect(() => {
    if ((state.phase === 'win' || state.phase === 'gameover') && state.score >= 0) {
      updateBestScore(state.score);
    }
  }, [state.phase, state.score, updateBestScore]);

  // Keyboard handler
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
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
        case 'Shift':
          if (state.drawMode === 'manual') {
            e.preventDefault();
            dispatch({ type: 'DRAW_CARD' });
          }
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
          flexShrink: 0,
        }}
      >
        <Toolbar sx={{ gap: 1, minHeight: '52px !important' }}>
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
            🌊 Nautilux: The Card Game
          </Typography>

          <Box sx={{ flex: 1 }} />

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

          {/* Draw mode toggle */}
          <FormControlLabel
            control={
              <Switch
                size="small"
                checked={state.drawMode === 'manual'}
                onChange={() =>
                  dispatch({
                    type: 'SET_DRAW_MODE',
                    mode: state.drawMode === 'auto' ? 'manual' : 'auto',
                  })
                }
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': { color: '#00B4D8' },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    backgroundColor: '#0077B6',
                  },
                }}
              />
            }
            label={
              <Typography sx={{ fontSize: 11, fontWeight: 600, color: 'rgba(144,224,239,0.8)', whiteSpace: 'nowrap' }}>
                {state.drawMode === 'manual' ? 'Manual Draw' : 'Auto Draw'}
              </Typography>
            }
            labelPlacement="start"
            sx={{ mr: 0, ml: 0, gap: 0.25 }}
          />

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
        </Toolbar>
      </AppBar>

      {/* Main play area — ocean on top, hand on bottom */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          zIndex: 1,
        }}
      >
        {/* Ocean — takes up the top/flex portion, passes height down */}
        <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <OceanDisplay equations={state.ocean} />
        </Box>

        {/* Hand + deck row — pinned at the bottom */}
        <Box
          sx={{
            borderTop: '2px solid rgba(144,224,239,0.15)',
            background: 'rgba(2,20,60,0.55)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            px: 2,
            pt: 1,
            pb: 1,
            gap: 2,
            flexShrink: 0,
          }}
        >
          {/* Hand + equation controls */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Hand
              hand={state.hand}
              selectedIds={state.selectedIds}
              resultCard={resultCard}
              focusedIndex={state.focusedIndex}
              selectionDepth={selectionDepth}
              onCardClick={id => dispatch({ type: 'TOGGLE_SELECT', cardId: id })}
              onFocusChange={i => dispatch({ type: 'SET_FOCUS', index: i })}
              onReorder={(from, to) => dispatch({ type: 'REORDER_HAND', fromIndex: from, toIndex: to })}
              isShaking={state.lastPlayWasInvalid}
            />

            <Box sx={{ px: 1 }}>
              <EquationPreview
                validation={validation}
                selectedCount={state.selectedIds.size}
              />
            </Box>

            {/* Cast + Give Up side by side */}
            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', justifyContent: 'center' }}>
              <CastButton disabled={!validation.valid} onClick={handlePlay} />
              <GiveUpButton onClick={() => dispatch({ type: 'REQUEST_GIVE_UP' })} />
            </Box>
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

          {/* Deck — on the right since new cards draw from the right */}
          <Box sx={{ flexShrink: 0 }}>
            <Deck
              cardCount={state.deck.length}
              canDraw={canDraw}
              onDraw={() => dispatch({ type: 'DRAW_CARD' })}
            />
          </Box>
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
