import { useState } from "react";
import { SCREENS, AUTH_MODES } from "../app/routes";

export function useAuth() {
  const [screen, setScreen] = useState(SCREENS.WELCOME);
  const [authMode, setAuthMode] = useState(AUTH_MODES.LOGIN);
  const [account, setAccount] = useState(null);

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
