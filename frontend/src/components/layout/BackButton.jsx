// ─────────────────────────────────────────────────────────────────────────────
// frontend/src/components/layout/BackButton.jsx
// ─────────────────────────────────────────────────────────────────────────────
import React from "react";
import { T } from "../../styles/theme.js";

export default function BackButton({ onClick, label = "Back" }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: "none",
        border: "none",
        color: T.blueL,
        fontSize: 13,
        fontWeight: 700,
        cursor: "pointer",
        fontFamily: "Urbanist, sans-serif",
        padding: "4px 0",
        display: "flex",
        alignItems: "center",
        gap: 5,
      }}
    >
      ← {label}
    </button>
  );
}
