import React from "react";
import WelcomePage from "../pages/WelcomePage";
import AuthPage from "../pages/AuthPage";
import PlatformPage from "../pages/PlatformPage";
import { SCREENS } from "./routes";
import { useAuth } from "../hooks/useAuth";

export default function App() {
  const {
    screen,
    setScreen,
    authMode,
    setAuthMode,
    account,
    openAuth,
    openPlatform,
    signOut,
  } = useAuth();

  if (screen === SCREENS.WELCOME) {
    return <WelcomePage onAuth={openAuth} />;
  }

  if (screen === SCREENS.AUTH) {
    return (
      <AuthPage
        mode={authMode}
        onModeChange={setAuthMode}
        onBack={() => setScreen(SCREENS.WELCOME)}
        onSuccess={openPlatform}
      />
    );
  }

  if (screen === SCREENS.PLATFORM && account) {
    return (
      <PlatformPage
        key={account.roleId}
        account={account}
        onSignOut={signOut}
      />
    );
  }

  // Fallback to welcome screen
  return <WelcomePage onAuth={openAuth} />;
}

