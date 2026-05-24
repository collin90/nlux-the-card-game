import { useState } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';
import HomePage from './pages/HomePage';
import GamePage from './pages/GamePage';
import RulesPage from './pages/RulesPage';
import { useBestScore } from './hooks/useBestScore';

type AppPage = 'home' | 'game';

function App() {
  const [page, setPage] = useState<AppPage>('home');
  const [showRules, setShowRules] = useState(false);
  const { bestScore } = useBestScore();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {page === 'home' && (
        <HomePage
          bestScore={bestScore}
          onStart={() => setPage('game')}
          onRules={() => setShowRules(true)}
        />
      )}
      {page === 'game' && <GamePage onGoHome={() => setPage('home')} />}
      <RulesPage open={showRules} onClose={() => setShowRules(false)} />
    </ThemeProvider>
  );
}

export default App;
