// src/components/RootHandler.jsx
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import useAuthStore from '../store';
import SplashPage from '../pages/SplashPage';
import WelcomePage from '../pages/WelcomePage';

const SPLASH_TIMEOUT = 2500;
const SPLASH_SESSION_KEY = 'dealmateSplashShown';

function RootHandler() {
  const wasSplashShown = sessionStorage.getItem(SPLASH_SESSION_KEY) === 'true';
  const [showSplash, setShowSplash] = useState(!wasSplashShown);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

  useEffect(() => {
    if (!showSplash) return;

    const timer = setTimeout(() => {
      sessionStorage.setItem(SPLASH_SESSION_KEY, 'true');
      setShowSplash(false);
    }, SPLASH_TIMEOUT);

    return () => clearTimeout(timer);
  }, [showSplash]);

  if (showSplash) return <SplashPage />;
  if (isLoggedIn) return <Navigate to="/dashboard" replace />;
  return <WelcomePage />;
}

export default RootHandler;
