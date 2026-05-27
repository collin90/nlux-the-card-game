import { useState } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';
import HomePage from './pages/HomePage';
import GamePage from './pages/GamePage';
import RulesPage from './pages/RulesPage';
import { useBestScore } from './hooks/useBestScore';
import { useSoundSettings } from './hooks/useSoundSettings';
import type { DrawMode } from './logic/types';

type AppPage = 'home' | 'game';

function App() {
  const [page, setPage] = useState<AppPage>('home');
  const [showRules, setShowRules] = useState(false);
  const [drawMode, setDrawMode] = useState<DrawMode>('auto');
  const { bestScore } = useBestScore();
  const { soundEnabled, toggleSound } = useSoundSettings();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {page === 'home' && (
        <HomePage
          bestScore={bestScore}
          drawMode={drawMode}
          soundEnabled={soundEnabled}
          onDrawModeChange={setDrawMode}
          onToggleSound={toggleSound}
          onStart={() => setPage('game')}
          onRules={() => setShowRules(true)}
        />
      )}
      {page === 'game' && (
        <GamePage
          initialDrawMode={drawMode}
          soundEnabled={soundEnabled}
          onToggleSound={toggleSound}
          onGoHome={() => setPage('home')}
        />
      )}
      <RulesPage open={showRules} onClose={() => setShowRules(false)} />
    </ThemeProvider>
  );
}

export default App;
