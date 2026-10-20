import React from "react";

export default function BrandMark() {
  return (
    <span className="brand-mark" aria-hidden="true">
      <svg viewBox="0 0 36 36" fill="none">
        <path
          d="M18 3.75 31.25 11.4v13.2L18 32.25 4.75 24.6V11.4L18 3.75Z"
          stroke="currentColor"
          strokeWidth="1.7"
        />
        <path
          d="m11 22.5 5-9h9l-5 9h-9Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <circle cx="11" cy="22.5" r="2" fill="currentColor" />
        <circle cx="20" cy="22.5" r="2" fill="currentColor" />
      </svg>
    </span>
  );
}
