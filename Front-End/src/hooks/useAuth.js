import { useState, useEffect } from "react";
import { SCREENS, AUTH_MODES } from "../app/routes";

import { authService } from "../services/authService";
import { getStoredToken, setStoredToken } from "../services/apiClient";

export function useAuth() {
  const [screen, setScreen] = useState(SCREENS.WELCOME);
  const [authMode, setAuthMode] = useState(AUTH_MODES.LOGIN);
  const [account, setAccount] = useState(null);

  useEffect(() => {
    let active = true;
    if (getStoredToken()) authService.me().then((user) => {
      if (active) { setAccount(user); setScreen(SCREENS.PLATFORM); }
    }).catch(() => { if (active) { setStoredToken(null); setScreen(SCREENS.AUTH); } });
    const expire = () => { setAccount(null); setScreen(SCREENS.AUTH); };
    window.addEventListener("routeflow:unauthorized", expire);
    return () => { active = false; window.removeEventListener("routeflow:unauthorized", expire); };
  }, []);

  function openAuth(mode) {
    setAuthMode(mode || AUTH_MODES.LOGIN);
    setScreen(SCREENS.AUTH);
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  function openPlatform(nextAccount) {
    setAccount(nextAccount);
    setScreen(SCREENS.PLATFORM);
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  function signOut() {
    authService.logout();
    setAccount(null);
    setScreen(SCREENS.WELCOME);
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  return {
    screen,
    setScreen,
    authMode,
    setAuthMode,
    account,
    setAccount,
    openAuth,
    openPlatform,
    signOut,
  };
}
