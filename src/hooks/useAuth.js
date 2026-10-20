import { useState } from "react";

export function useAuth() {
  const [screen, setScreen] = useState("welcome");
  const [authMode, setAuthMode] = useState("login");
  const [account, setAccount] = useState(null);

  function openAuth(mode) {
    setAuthMode(mode);
    setScreen("auth");
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  function openPlatform(nextAccount) {
    setAccount(nextAccount);
    setScreen("platform");
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  function signOut() {
    setAccount(null);
    setScreen("welcome");
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

