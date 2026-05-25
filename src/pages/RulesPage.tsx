import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
  Box,
  Divider,
  Chip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface RulesPageProps {
  open: boolean;
  onClose: () => void;
}

const Section: React.FC<{ title: string; emoji: string; children: React.ReactNode }> = ({
  title,
  emoji,
  children,
}) => (
  <Box sx={{ mb: 2.5 }}>
    <Typography
      variant="subtitle1"
      sx={{ fontWeight: 700, color: '#90E0EF', mb: 0.75, display: 'flex', alignItems: 'center', gap: 0.5 }}
    >
      <span>{emoji}</span> {title}
    </Typography>
    {children}
  </Box>
);

const Rule: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Typography variant="body2" sx={{ color: 'rgba(173,232,244,0.8)', mb: 0.5, pl: 1.5 }}>
    • {children}
  </Typography>
);

const Example: React.FC<{ eq: string; valid: boolean }> = ({ eq, valid }) => (
  <Chip
    label={eq}
    size="small"
    sx={{
      mr: 0.75,
      mb: 0.75,
      fontFamily: 'monospace',
      fontSize: 12,
      bgcolor: valid ? 'rgba(82,183,136,0.15)' : 'rgba(230,57,70,0.15)',
      color: valid ? '#52b788' : '#e63946',
      border: `1px solid ${valid ? 'rgba(82,183,136,0.4)' : 'rgba(230,57,70,0.4)'}`,
    }}
  />
);

const RulesPage: React.FC<RulesPageProps> = ({ open, onClose }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            background: 'linear-gradient(160deg, #03045E 0%, #023e8a 100%)',
            border: '1px solid rgba(144,224,239,0.2)',
            borderRadius: '20px',
            maxHeight: '90vh',
          },
        },
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography sx={{ fontSize: 24 }}>🌊</Typography>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#ADE8F4' }}>
            How to Play
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: 'rgba(144,224,239,0.6)' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 0 }}>
        <Divider sx={{ borderColor: 'rgba(144,224,239,0.15)', mb: 2 }} />

        <Section title="The Goal" emoji="🎯">
          <Rule>
            Clear both the deck and your hand completely for a perfect score of 0.
          </Rule>
          <Rule>
            If you run out of cards in the deck, your remaining hand cards become your final score.
          </Rule>
          <Rule>
            Face cards (J, Q, K) are worth <strong>15 points</strong> at the end — avoid getting stuck with them!
          </Rule>
        </Section>

        <Section title="Your Hand & Deck" emoji="🃏">
          <Rule>You always draw up to <strong>7 cards</strong> in your hand.</Rule>
          <Rule>After playing a valid equation, you automatically draw back up to 7.</Rule>
          <Rule>Aces count as <strong>1</strong>. Number cards are their face value.</Rule>
        </Section>

        <Section title="Playing Equations" emoji="🧮">
          <Typography variant="body2" sx={{ color: 'rgba(173,232,244,0.6)', mb: 1, pl: 1.5, fontStyle: 'italic' }}>
            Select 3 or more cards that form: LHS cards + … = single result card
          </Typography>
          <Rule>
            <strong>Number result:</strong> Sum of all left-hand cards equals the right-hand card.
          </Rule>
          <Box sx={{ pl: 3, mb: 0.75 }}>
            <Example eq="2 + 3 = 5" valid />
            <Example eq="A + 2 + 3 = 6" valid />
            <Example eq="2 + 3 = 4" valid={false} />
          </Box>
          <Rule>
            <strong>Face card result:</strong> 2+ cards of the <em>same rank</em> on the left → any face card result.
          </Rule>
          <Box sx={{ pl: 3, mb: 0.75 }}>
            <Example eq="2 + 2 = J" valid />
            <Example eq="5 + 5 + 5 = Q" valid />
            <Example eq="2 + 3 = J" valid={false} />
          </Box>
          <Rule>
            <strong>Face + Face:</strong> 2+ cards of the <em>same face rank</em> on the left → any face card result.
          </Rule>
          <Box sx={{ pl: 3, mb: 0.75 }}>
            <Example eq="J + J = Q" valid />
            <Example eq="K + K + K = J" valid />
            <Example eq="J + Q = K" valid={false} />
          </Box>
          <Rule>
            J, Q, K are all equivalent — but the left side must use <em>the same face rank</em>.
          </Rule>
          <Rule>
            You <strong>cannot</strong> mix number cards and face cards on the left side.
          </Rule>
          <Rule>
            The right side (result) must always be exactly <strong>one card</strong>.
          </Rule>
        </Section>

        <Section title="The Ocean Zones" emoji="🌊">
          <Rule>Played equations sink into 3 ocean zones based on their total card point value.</Rule>
          <Box sx={{ pl: 1.5, mt: 0.75, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 14, height: 14, borderRadius: '3px', background: '#ADE8F4', flexShrink: 0 }} />
              <Typography variant="caption" sx={{ color: 'rgba(173,232,244,0.8)' }}>
                <strong>Daylight Zone</strong> — total value under 20 (e.g. A + A = 2)
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 14, height: 14, borderRadius: '3px', background: '#0077B6', flexShrink: 0 }} />
              <Typography variant="caption" sx={{ color: 'rgba(173,232,244,0.8)' }}>
                <strong>Twilight Zone</strong> — total value 20 to 30 (e.g. 5 + 5 = K)
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 14, height: 14, borderRadius: '3px', background: '#03045E', flexShrink: 0, border: '1px solid rgba(144,224,239,0.3)' }} />
              <Typography variant="caption" sx={{ color: 'rgba(173,232,244,0.8)' }}>
                <strong>Midnight Zone</strong> — total value over 30 (e.g. K + K + K = Q)
              </Typography>
            </Box>
          </Box>
          <Rule>Face cards are worth <strong>15 points</strong> for zone calculation.</Rule>
        </Section>

        <Section title="Badges" emoji="🏅">
          <Rule>At the end of the game, you earn a badge from the zone where you played the most equations.</Rule>
          <Rule>Each badge is a unique sea creature from that depth zone.</Rule>
        </Section>

        <Section title="Winning" emoji="🏆">
          <Rule>Clear every card in the deck <em>and</em> your hand → <strong>Victory!</strong></Rule>
          <Rule>Stuck with no valid moves? Click <strong>Give Up</strong> to start a new voyage.</Rule>
        </Section>

        <Divider sx={{ borderColor: 'rgba(144,224,239,0.15)', mb: 2 }} />

        <Section title="Keyboard Controls" emoji="⌨️">
          <Box sx={{ pl: 1.5 }}>
            {[
              ['← →', 'Navigate hand cards'],
              ['Space', 'Select / deselect focused card'],
              ['Enter', 'Cast selected equation into Ocean'],
              ['Escape', 'Clear selection'],
              ['N', 'New voyage'],
              ['?', 'Toggle these rules'],
              ['G', 'Give up'],
            ].map(([key, desc]) => (
              <Box key={key} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                <Chip
                  label={key}
                  size="small"
                  sx={{
                    fontFamily: 'monospace',
                    fontSize: 11,
                    bgcolor: 'rgba(0,180,216,0.15)',
                    color: '#90E0EF',
                    border: '1px solid rgba(0,180,216,0.3)',
                    minWidth: 56,
                  }}
                />
                <Typography variant="caption" sx={{ color: 'rgba(173,232,244,0.7)' }}>
                  {desc}
                </Typography>
              </Box>
            ))}
          </Box>
        </Section>
      </DialogContent>
    </Dialog>
  );
};

export default RulesPage;
