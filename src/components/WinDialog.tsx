import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
} from '@mui/material';
import Confetti from 'react-confetti';
import type { GamePhase, BadgeAnimal } from '../logic/types';

interface WinDialogProps {
  phase: GamePhase;
  score: number;
  bestScore: number | null;
  badge: BadgeAnimal | null;
  showGiveUpConfirm: boolean;
  onNewGame: () => void;
  onCancelGiveUp: () => void;
  onConfirmGiveUp: () => void;
}

const ZONE_FLAVOR: Record<string, string> = {
  daylight: 'You swam in the sunlit shallows 🌞',
  twilight: 'You drifted through the dim mesopelagic depths 🌙',
  midnight: 'You descended into the abyss 🌑',
};

const BadgeDisplay: React.FC<{ badge: BadgeAnimal }> = ({ badge }) => (
  <Box
    sx={{
      my: 2,
      p: 2,
      borderRadius: '12px',
      background:
        badge.zone === 'daylight'
          ? 'linear-gradient(135deg, rgba(173,232,244,0.15), rgba(72,202,228,0.1))'
          : badge.zone === 'twilight'
          ? 'linear-gradient(135deg, rgba(2,62,138,0.4), rgba(0,119,182,0.2))'
          : 'linear-gradient(135deg, rgba(3,4,94,0.6), rgba(1,11,26,0.4))',
      border: '1px solid rgba(144,224,239,0.2)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 0.5,
    }}
  >
    <Typography sx={{ fontSize: 48, lineHeight: 1 }}>{badge.emoji}</Typography>
    <Typography variant="h6" sx={{ fontWeight: 700, color: '#ADE8F4' }}>
      {badge.name}
    </Typography>
    <Typography variant="caption" sx={{ color: 'rgba(144,224,239,0.6)', fontSize: 11 }}>
      {ZONE_FLAVOR[badge.zone]}
    </Typography>
    <Chip
      label="Your spirit creature"
      size="small"
      sx={{
        mt: 0.5,
        bgcolor: 'rgba(0,180,216,0.15)',
        color: '#90E0EF',
        border: '1px solid rgba(0,180,216,0.3)',
        fontSize: 10,
      }}
    />
  </Box>
);

const ScoreDisplay: React.FC<{ score: number; bestScore: number | null; isWin: boolean }> = ({
  score,
  bestScore,
  isWin,
}) => {
  const isPerfect = score === 0 && isWin;
  const isNewBest =
    bestScore !== null && score <= bestScore && !(isPerfect && bestScore === 0);

  return (
    <Box sx={{ my: 1.5, textAlign: 'center' }}>
      <Typography variant="h2" sx={{ fontWeight: 800, color: isWin ? '#52b788' : '#ADE8F4' }}>
        {isPerfect ? '✨' : score}
      </Typography>
      {isPerfect ? (
        <Typography variant="body2" sx={{ color: '#52b788', fontWeight: 600 }}>
          Perfect score — flawless voyage!
        </Typography>
      ) : (
        <Typography variant="body2" sx={{ color: 'rgba(144,224,239,0.7)' }}>
          {score} point{score !== 1 ? 's' : ''} remaining
        </Typography>
      )}
      {bestScore !== null && (
        <Typography variant="caption" sx={{ color: 'rgba(144,224,239,0.5)', display: 'block', mt: 0.5 }}>
          Best: {bestScore} {isNewBest ? '🏆 New best!' : ''}
        </Typography>
      )}
    </Box>
  );
};

const WinDialog: React.FC<WinDialogProps> = ({
  phase,
  score,
  bestScore,
  badge,
  showGiveUpConfirm,
  onNewGame,
  onCancelGiveUp,
  onConfirmGiveUp,
}) => {
  const isEndDialog = phase === 'win' || phase === 'giveup' || phase === 'gameover';
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;

  return (
    <>
      {/* Confetti for win */}
      {phase === 'win' && (
        <Confetti
          width={windowWidth}
          height={windowHeight}
          recycle={false}
          numberOfPieces={300}
          colors={['#ADE8F4', '#00B4D8', '#0077B6', '#90E0EF', '#48CAE4', '#FFD700']}
          style={{ position: 'fixed', top: 0, left: 0, zIndex: 9999 }}
        />
      )}

      {/* Give Up Confirmation Dialog */}
      <Dialog
        open={showGiveUpConfirm}
        onClose={onCancelGiveUp}
        slotProps={{
          paper: {
            sx: {
              background: 'linear-gradient(135deg, #22223b 0%, #4a4e69 100%)',
              border: '1px solid rgba(100,100,140,0.4)',
              borderRadius: '16px',
              maxWidth: 360,
            },
          },
        }}
      >
        <DialogContent sx={{ textAlign: 'center', pt: 3 }}>
          <Typography sx={{ fontSize: 40, mb: 1 }}>⚓</Typography>
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'rgba(200,200,220,0.9)', mb: 1 }}>
            Abandon Voyage?
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(200,200,220,0.55)' }}>
            Your voyage will be lost and you'll have to start over.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 2.5, gap: 1.5 }}>
          <Button
            onClick={onCancelGiveUp}
            variant="contained"
            sx={{
              background: 'linear-gradient(90deg, #0077B6, #00B4D8)',
              color: '#fff',
              fontWeight: 700,
              borderRadius: '10px',
              px: 2.5,
            }}
          >
            Keep Sailing
          </Button>
          <Button
            onClick={onConfirmGiveUp}
            variant="outlined"
            sx={{
              borderColor: 'rgba(100,100,140,0.6)',
              color: 'rgba(200,200,220,0.6)',
              fontWeight: 700,
              borderRadius: '10px',
              px: 2.5,
              '&:hover': {
                borderColor: 'rgba(150,150,180,0.8)',
                background: 'rgba(100,100,140,0.2)',
              },
            }}
          >
            Give Up
          </Button>
        </DialogActions>
      </Dialog>

      {/* End Game Dialog */}
      <Dialog
        open={isEndDialog}
        onClose={() => {}}
        slotProps={{
          paper: {
            sx: {
              background:
                phase === 'win'
                  ? 'linear-gradient(135deg, #023e8a 0%, #0077B6 50%, #00B4D8 100%)'
                  : phase === 'giveup'
                  ? 'linear-gradient(135deg, #1a1a2e 0%, #22223b 100%)'
                  : 'linear-gradient(135deg, #03045E 0%, #023e8a 100%)',
              border:
                phase === 'win'
                  ? '1px solid rgba(144,224,239,0.5)'
                  : '1px solid rgba(100,100,140,0.4)',
              borderRadius: '20px',
              minWidth: 340,
              maxWidth: 420,
            },
          },
        }}
      >
        <DialogContent sx={{ textAlign: 'center', pt: 3 }}>
          {phase === 'win' && (
            <>
              <Typography sx={{ fontSize: 52, lineHeight: 1, mb: 0.5 }}>🎉</Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#ADE8F4', mb: 0.5 }}>
                Voyage Complete!
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(173,232,244,0.7)' }}>
                You cleared the entire ocean!
              </Typography>
            </>
          )}
          {phase === 'giveup' && (
            <>
              <Typography sx={{ fontSize: 52, lineHeight: 1, mb: 1 }}>⚓</Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: 'rgba(200,200,220,0.85)', mb: 1 }}>
                Voyage Abandoned
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(200,200,220,0.45)', mb: 1 }}>
                The sea was too rough today.
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(200,200,220,0.3)', fontSize: 12 }}>
                No score recorded.
              </Typography>
            </>
          )}
          {phase === 'gameover' && (
            <>
              <Typography sx={{ fontSize: 52, lineHeight: 1, mb: 0.5 }}>🪸</Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#ADE8F4', mb: 0.5 }}>
                Stranded at Sea
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(144,224,239,0.6)' }}>
                The deck ran dry. No more moves.
              </Typography>
            </>
          )}

          {/* Score + badge only for win and gameover, not give-up */}
          {phase !== 'giveup' && (
            <ScoreDisplay score={score} bestScore={bestScore} isWin={phase === 'win'} />
          )}
          {phase !== 'giveup' && badge && <BadgeDisplay badge={badge} />}
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button
            onClick={onNewGame}
            variant="contained"
            size="large"
            sx={{
              background: 'linear-gradient(90deg, #0077B6, #00B4D8)',
              color: '#fff',
              fontWeight: 700,
              px: 4,
              py: 1.2,
              borderRadius: '12px',
              fontSize: 15,
              boxShadow: '0 4px 16px rgba(0,180,216,0.4)',
              '&:hover': {
                background: 'linear-gradient(90deg, #023e8a, #0077B6)',
                boxShadow: '0 6px 20px rgba(0,180,216,0.5)',
              },
            }}
          >
            New Voyage
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default WinDialog;
