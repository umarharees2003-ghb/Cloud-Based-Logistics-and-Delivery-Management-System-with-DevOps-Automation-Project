import React from "react";

export default function NoticeBanner({ message, onDismiss }) {
  if (!message) return null;

  return (
    <div className="ops-notice" role="status">
      <span>✓</span>
      {message}
      <button type="button" aria-label="Dismiss notification" onClick={onDismiss}>
        ×
      </button>
    </div>
  );
}

