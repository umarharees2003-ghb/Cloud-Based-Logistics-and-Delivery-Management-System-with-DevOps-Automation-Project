import React, { useState } from "react";
import BrandMark from "../components/BrandMark";
import { userRoles } from "../data/demoData";
import { authService } from "../services/authService";

export default function AuthPage({ mode, onModeChange, onBack, onSuccess }) {
  const [notice, setNotice] = useState("");
  const isSignup = mode === "signup";

  async function handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    if (isSignup && formData.get("password") !== formData.get("confirmPassword")) {
      setNotice("The passwords do not match. Please check and try again.");
      return;
    }

    try {
      let userAccount;
      if (isSignup) {
        userAccount = await authService.signup({
          fullName: String(formData.get("fullName")),
          roleId: String(formData.get("roleId")),
        });
      } else {
        userAccount = await authService.login({
          email: String(formData.get("email")),
          roleId: String(formData.get("roleId")),
        });
      }
      onSuccess(userAccount);
    } catch {
      setNotice("An error occurred during authentication. Please try again.");
    }
  }

  function changeMode(nextMode) {
    setNotice("");
    onModeChange(nextMode);
  }

  return (
    <main className="auth-shell">
      <header className="auth-topbar">
        <a
          className="brand home-brand"
          href="/"
          aria-label="Routeflow home"
          onClick={(event) => {
            event.preventDefault();
            onBack();
          }}
        >
          <BrandMark />
          <span>routeflow</span>
        </a>
        <button type="button" className="auth-back" onClick={onBack}>
          Back to welcome
        </button>
      </header>

      <section className="auth-card" aria-labelledby="auth-title">
        <div className="auth-symbol" aria-hidden="true">
          <BrandMark />
        </div>
        <span className="auth-eyebrow">YOUR LOGISTICS WORKSPACE</span>
        <h1 id="auth-title">{isSignup ? "Create your account" : "Welcome back"}</h1>
        <p className="auth-description">
          {isSignup
            ? "Sign up to bring your deliveries, routes, and team together."
            : "Sign in to continue to your Routeflow platform."}
        </p>

        <div className="auth-tabs" role="tablist" aria-label="Account access">
          <button
            id="login-tab"
            type="button"
            role="tab"
            aria-selected={!isSignup}
            aria-controls="auth-form"
            className={!isSignup ? "auth-tab active" : "auth-tab"}
            onClick={() => changeMode("login")}
          >
            Sign in
          </button>
          <button
            id="signup-tab"
            type="button"
            role="tab"
            aria-selected={isSignup}
            aria-controls="auth-form"
            className={isSignup ? "auth-tab active" : "auth-tab"}
            onClick={() => changeMode("signup")}
          >
            Sign up
          </button>
        </div>

        <form id="auth-form" className="auth-form" onSubmit={handleSubmit}>
          {isSignup && (
            <label className="auth-field">
              <span>Full name</span>
              <input
                name="fullName"
                type="text"
                autoComplete="name"
                placeholder="Your name"
                minLength="2"
                required
              />
            </label>
          )}

          <label className="auth-field">
            <span>{isSignup ? "I am a…" : "Choose a role to preview"}</span>
            <select name="roleId" defaultValue="" required>
              <option value="" disabled>
                Select your role
              </option>
              {userRoles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.label}
                </option>
              ))}
            </select>
          </label>

          <label className="auth-field">
            <span>Work email</span>
            <input
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              required
            />
          </label>

          <label className="auth-field">
            <span>Password</span>
            <input
              name="password"
              type="password"
              autoComplete={isSignup ? "new-password" : "current-password"}
              placeholder={isSignup ? "At least 8 characters" : "Enter your password"}
              minLength="8"
              required
            />
          </label>

          {isSignup && (
            <label className="auth-field">
              <span>Confirm password</span>
              <input
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                placeholder="Re-enter your password"
                minLength="8"
                required
              />
            </label>
          )}

          <p className="auth-demo-note">
            Demo only: accounts are not saved, and role screens do not enforce real permissions.
          </p>

          <p className="auth-notice" role="alert" aria-live="polite">
            {notice}
          </p>

          <button className="primary-btn auth-submit" type="submit">
            {isSignup ? "Create account" : "Sign in"}
            <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path
                d="M4 10h12m-5-5 5 5-5 5"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </form>

        <p className="auth-switch">
          {isSignup ? "Already have an account?" : "New to Routeflow?"}{" "}
          <button
            className="auth-inline-button"
            type="button"
            onClick={() => changeMode(isSignup ? "login" : "signup")}
          >
            {isSignup ? "Sign in" : "Create an account"}
          </button>
        </p>
      </section>
    </main>
  );
}

