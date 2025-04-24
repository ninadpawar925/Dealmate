// src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom'; // ✅ Only these
import { ThemeProvider, createTheme, CssBaseline, Box } from '@mui/material';
import dealmateBaseThemeConfig from './theme';
import useAuthStore from './store';

import WelcomePage from './pages/WelcomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import ChatbotPage from './pages/ChatbotPage';
import HistoryPage from './pages/HistoryPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';

import Header from './components/Header';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import RootHandler from './components/RootHandler';

function App() {
  const themeMode = useAuthStore((state) => state.themeMode);
  const dynamicTheme = React.useMemo(
    () =>
      createTheme({
        ...dealmateBaseThemeConfig,
        palette: { ...dealmateBaseThemeConfig.palette, mode: themeMode },
      }),
    [themeMode]
  );

  return (
    <ThemeProvider theme={dynamicTheme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Header />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            py: { xs: 2, sm: 3 },
            px: { xs: 1, sm: 2, md: 3 },
            width: '100%',
            maxWidth: '1200px',
            margin: '0 auto',
          }}
        >
          <Routes>
            <Route path="/" element={<RootHandler />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/dashboard" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
            <Route path="/chatbot" element={<ProtectedRoute><ChatbotPage /></ProtectedRoute>} />
            <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
          </Routes>
        </Box>
        <Footer />
      </Box>
    </ThemeProvider>
  );
}

export default App;
