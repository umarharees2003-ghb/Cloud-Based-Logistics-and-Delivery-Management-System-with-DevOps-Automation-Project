import React, { useState } from "react";
import { authService } from "../../services/authService";
export default function ProfileForm({ account }) {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function save(event) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    setBusy(true);
    try { await authService.updateProfile(data); setMessage("Profile saved. Updated details will appear on your next sign in."); }
    catch (error) { setMessage(error.message); }
    finally { setBusy(false); }
  }
  return <form className="auth-form" onSubmit={save}>
    <label className="auth-field"><span>Name</span><input name="name" defaultValue={account.name} minLength="2" required /></label>
    <label className="auth-field"><span>Phone</span><input name="phone" defaultValue={account.phone} /></label>
    <label className="auth-field"><span>Company</span><input name="company" defaultValue={account.company} /></label>
    <p className="auth-notice" role="status">{message}</p>
    <button className="ops-primary-button" disabled={busy}>Save profile</button>
  </form>;
}
