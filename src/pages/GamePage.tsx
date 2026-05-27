import React, { useEffect, useCallback, useRef, useState } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Tooltip,
  Chip,
  Switch,
  FormControlLabel,
  useTheme,
  useMediaQuery,
  keyframes,
} from '@mui/material';
import HelpOutlinedIcon from '@mui/icons-material/HelpOutlined';
import AddIcon from '@mui/icons-material/Add';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import { useGameState } from '../hooks/useGameState';
import { useBestScore } from '../hooks/useBestScore';
import { useGameSounds } from '../hooks/useGameSounds';
import Hand from '../components/Hand';
import Deck from '../components/Deck';
import OceanDisplay from '../components/OceanDisplay';
import EquationPreview from '../components/EquationPreview';
import CastButton from '../components/CastButton';
import GiveUpButton from '../components/GiveUpButton';
import WinDialog from '../components/WinDialog';
import RulesPage from './RulesPage';
import type { DrawMode } from '../logic/types';

interface GamePageProps {
  initialDrawMode: DrawMode;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onGoHome: () => void;
}

const waveAnim = keyframes`
  0% { transform: translateX(0) scaleY(1); }
  50% { transform: translateX(-80px) scaleY(1.08); }
  100% { transform: translateX(0) scaleY(1); }
`;

const GamePage: React.FC<GamePageProps> = ({
  initialDrawMode,
  soundEnabled,
  onToggleSound,
  onGoHome,
}) => {
  const { state, dispatch, validation, resultCard, selectionDepth, canDraw } = useGameState(initialDrawMode);
  const { bestScore, updateBestScore } = useBestScore();
  const playSound = useGameSounds(soundEnabled);
  const [showRules, setShowRules] = useState(false);
  const [admiringGame, setAdmiringGame] = useState(false);
  const [showKeyboardFocus, setShowKeyboardFocus] = useState(false);
  const [keyboardReorderActive, setKeyboardReorderActive] = useState(false);
  const [endSummary, setEndSummary] = useState<{
    previousBest: number | null;
    bestDelta: number | null;
  } | null>(null);
  const previousPhase = useRef(state.phase);

  // Reset admire mode whenever a new game starts
  useEffect(() => {
    if (state.phase === 'playing') setAdmiringGame(false);
  }, [state.phase]);

  useEffect(() => {
    if (previousPhase.current !== 'win' && state.phase === 'win') {
      playSound('win');
    }
    previousPhase.current = state.phase;
  }, [state.phase, playSound]);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));   // < 600px

  // Update best score when game ends (not on give-up)
  useEffect(() => {
    if (state.phase === 'playing') {
      setEndSummary(null);
      return;
    }

    if ((state.phase === 'win' || state.phase === 'gameover') && state.score >= 0 && endSummary === null) {
      setEndSummary({
        previousBest: bestScore,
        bestDelta: bestScore === null ? null : bestScore - state.score,
      });
      updateBestScore(state.score);
    }
  }, [state.phase, state.score, bestScore, endSummary, updateBestScore]);

  // Keyboard handler
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (state.showGiveUpConfirm || state.phase !== 'playing') return;
      if (showRules && e.key !== '?') return;

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          setShowKeyboardFocus(true);
          if (keyboardReorderActive) {
            const toIndex = Math.max(state.focusedIndex - 1, 0);
            if (toIndex !== state.focusedIndex) {
              dispatch({ type: 'REORDER_HAND', fromIndex: state.focusedIndex, toIndex });
            }
          } else {
            dispatch({ type: 'FOCUS_PREV' });
          }
          break;
        case 'ArrowRight':
          e.preventDefault();
          setShowKeyboardFocus(true);
          if (keyboardReorderActive) {
            const toIndex = Math.min(state.focusedIndex + 1, state.hand.length - 1);
            if (toIndex !== state.focusedIndex) {
              dispatch({ type: 'REORDER_HAND', fromIndex: state.focusedIndex, toIndex });
            }
          } else {
            dispatch({ type: 'FOCUS_NEXT' });
          }
          break;
        case 'ArrowUp':
          e.preventDefault();
          setShowKeyboardFocus(true);
          setKeyboardReorderActive(prev => !prev);
          break;
        case 'ArrowDown':
          if (keyboardReorderActive) {
            e.preventDefault();
            setKeyboardReorderActive(false);
          }
          break;
        case ' ':
          e.preventDefault();
          {
            const focusedCard = state.hand[state.focusedIndex];
            if (focusedCard) {
              playSound('select');
              dispatch({ type: 'TOGGLE_SELECT', cardId: focusedCard.id });
            }
          }
          break;
        case 'Enter':
          e.preventDefault();
          if (validation.valid) {
            playSound('cast');
            dispatch({ type: 'PLAY_EQUATION' });
          }
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
    [state, dispatch, validation, showRules, keyboardReorderActive, playSound]
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
    if (validation.valid) {
      playSound('cast');
      dispatch({ type: 'PLAY_EQUATION' });
    }
  };

  return (
    <Box
      onPointerDown={() => {
        setShowKeyboardFocus(false);
        setKeyboardReorderActive(false);
      }}
      sx={{
        // 100dvh respects mobile browser chrome; fall back to 100vh
        height: '100dvh',
        '@supports not (height: 100dvh)': { height: '100vh' },
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(160deg, #03045E 0%, #023e8a 60%, #0077B6 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background wave (decorative only) */}
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

      {/* ── AppBar ── sticky at top, responsive */}
      <AppBar
        position="static"
        elevation={0}
        sx={{
          background: 'rgba(2,62,138,0.75)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(144,224,239,0.15)',
          zIndex: 2,
          flexShrink: 0,
        }}
      >
        <Toolbar
          sx={{
            gap: { xs: 0.5, sm: 1 },
            minHeight: { xs: '48px !important', sm: '52px !important' },
            px: { xs: 1, sm: 2 },
          }}
        >
          {/* Title — full on desktop, short on mobile */}
          <Typography
            variant="h6"
            sx={{
              fontWeight: 800,
              color: '#ADE8F4',
              letterSpacing: -0.3,
              cursor: 'pointer',
              flexShrink: 0,
              fontSize: { xs: 14, sm: 18 },
              mr: { xs: 0.5, sm: 1 },
            }}
            onClick={onGoHome}
          >
            {isMobile ? '🌊' : '🌊 Nautilux'}
          </Typography>

          <Box sx={{ flex: 1 }} />

          {/* Best score — hide on small mobile */}
          {bestScore !== null && !isMobile && (
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

          {/* Draw mode toggle — label hidden on compact screens */}
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
              <Typography sx={{ fontSize: { xs: 10, sm: 11 }, fontWeight: 600, color: 'rgba(144,224,239,0.8)', whiteSpace: 'nowrap' }}>
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

          <Tooltip title={soundEnabled ? 'Sound on' : 'Sound off'}>
            <IconButton
              size="small"
              onClick={onToggleSound}
              sx={{ color: soundEnabled ? '#FFD166' : 'rgba(144,224,239,0.55)' }}
            >
              {soundEnabled ? <VolumeUpIcon fontSize="small" /> : <VolumeOffIcon fontSize="small" />}
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

      {/* ── Main area ── ocean scrolls, hand stays pinned at bottom */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,     // ← critical: allows flex children to shrink below content size
          overflow: 'hidden',
          zIndex: 1,
        }}
      >
        {/* Admire banner — shown when player closes end dialog to look at the board */}
        {admiringGame && (state.phase === 'win' || state.phase === 'gameover') && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              px: { xs: 1.5, sm: 2.5 },
              py: 1,
              background: state.phase === 'win'
                ? 'linear-gradient(90deg, rgba(0,119,182,0.55), rgba(0,180,216,0.45))'
                : 'linear-gradient(90deg, rgba(3,4,94,0.7), rgba(2,62,138,0.6))',
              borderBottom: '1px solid rgba(144,224,239,0.2)',
              backdropFilter: 'blur(8px)',
              flexShrink: 0,
              gap: 2,
              zIndex: 2,
            }}
          >
            <Typography
              variant="body2"
              sx={{ color: 'rgba(173,232,244,0.85)', fontWeight: 600, fontSize: { xs: 12, sm: 13 } }}
            >
              {state.phase === 'win' ? '🎉 Voyage complete — admiring your ocean!' : '🪸 Stranded at Sea — take it all in.'}
            </Typography>

            <Button
              variant="contained"
              size="small"
              onClick={() => dispatch({ type: 'NEW_GAME' })}
              sx={{
                flexShrink: 0,
                background: 'linear-gradient(90deg, #0077B6, #00B4D8)',
                color: '#fff',
                fontWeight: 700,
                borderRadius: '20px',
                fontSize: { xs: 11, sm: 12 },
                px: { xs: 1.5, sm: 2.5 },
                boxShadow: '0 2px 10px rgba(0,180,216,0.35)',
                '&:hover': { background: 'linear-gradient(90deg, #023e8a, #0077B6)' },
              }}
            >
              New Voyage 🌊
            </Button>
          </Box>
        )}

        {/* Ocean — fills remaining space, never scrolls */}
        <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
          <OceanDisplay equations={state.ocean} />
        </Box>

        {/* ── Hand panel ── sticky at bottom, always visible */}
        <Box
          sx={{
            borderTop: '2px solid rgba(144,224,239,0.15)',
            background: 'rgba(2,20,60,0.6)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            px: { xs: 1, sm: 2 },
            pt: { xs: 0.75, sm: 1 },
            pb: { xs: 0.75, sm: 1 },
            gap: { xs: 1, sm: 2 },
            flexShrink: 0,
          }}
        >
          {/* Hand + equation controls */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0.5, minWidth: 0 }}>
            <Hand
              hand={state.hand}
              selectedIds={state.selectedIds}
              resultCard={resultCard}
              focusedIndex={state.focusedIndex}
              selectionDepth={selectionDepth}
              showFocusOutline={showKeyboardFocus}
              keyboardReorderActive={keyboardReorderActive}
              onCardClick={id => {
                playSound('select');
                dispatch({ type: 'TOGGLE_SELECT', cardId: id });
              }}
              onFocusChange={i => dispatch({ type: 'SET_FOCUS', index: i })}
              onReorder={(from, to) => dispatch({ type: 'REORDER_HAND', fromIndex: from, toIndex: to })}
              isShaking={state.lastPlayWasInvalid}
            />

            <Box sx={{ px: { xs: 0.5, sm: 1 } }}>
              {keyboardReorderActive && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 0.5 }}>
                  <Chip
                    label="Reordering"
                    size="small"
                    sx={{
                      height: 22,
                      bgcolor: 'rgba(255, 209, 102, 0.14)',
                      color: '#FFD166',
                      border: '1px solid rgba(255, 209, 102, 0.35)',
                      fontSize: 11,
                      fontWeight: 700,
                    }}
                  />
                </Box>
              )}
              <EquationPreview
                validation={validation}
                selectedCount={state.selectedIds.size}
              />
            </Box>

            {/* Cast + Give Up */}
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', justifyContent: 'center' }}>
              <CastButton disabled={!validation.valid} onClick={handlePlay} />
              <Button
                variant="outlined"
                size="small"
                disabled={state.hintsUsed >= 2}
                onClick={() => {
                  playSound('hint');
                  dispatch({ type: 'SHOW_HINT' });
                }}
                startIcon={<LightbulbOutlinedIcon sx={{ fontSize: 16 }} />}
                sx={{
                  px: 1.5,
                  py: 0.6,
                  fontSize: 12,
                  fontWeight: 700,
                  borderRadius: '8px',
                  color: '#FFD166',
                  border: '1px solid rgba(255, 209, 102, 0.4)',
                  background: 'rgba(255, 209, 102, 0.08)',
                  textTransform: 'none',
                  '&.Mui-disabled': {
                    color: 'rgba(255,255,255,0.25)',
                    borderColor: 'rgba(144,224,239,0.14)',
                    background: 'rgba(30,50,80,0.28)',
                  },
                  '&:hover': {
                    borderColor: 'rgba(255, 209, 102, 0.7)',
                    background: 'rgba(255, 209, 102, 0.14)',
                  },
                }}
              >
                Hint ({Math.max(0, 2 - state.hintsUsed)})
              </Button>
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

          {/* Deck */}
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
        stats={{
          equationsPlayed: state.ocean.length,
          cardsRemaining: state.hand.length + state.deck.length,
          zoneCounts: {
            daylight: state.ocean.filter(eq => eq.zone === 'daylight').length,
            twilight: state.ocean.filter(eq => eq.zone === 'twilight').length,
            midnight: state.ocean.filter(eq => eq.zone === 'midnight').length,
          },
          previousBest: endSummary?.previousBest ?? null,
          bestDelta: endSummary?.bestDelta ?? null,
          hintsUsed: state.hintsUsed,
        }}
        showGiveUpConfirm={state.showGiveUpConfirm}
        admiringGame={admiringGame}
        onNewGame={() => dispatch({ type: 'NEW_GAME' })}
        onCancelGiveUp={() => dispatch({ type: 'CANCEL_GIVE_UP' })}
        onConfirmGiveUp={() => dispatch({ type: 'CONFIRM_GIVE_UP' })}
        onAdmire={() => setAdmiringGame(true)}
      />
    </Box>
  );
};

export default GamePage;
