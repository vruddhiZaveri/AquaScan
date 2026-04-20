// ─────────────────────────────────────────────────────────────────────────────
// frontend/src/components/report/SeverityBadge.jsx
// ─────────────────────────────────────────────────────────────────────────────
import React from "react";
import { SEV_CFG } from "../../styles/theme.js";

export default function SeverityBadge({ severity, small }) {
  const c = SEV_CFG[severity?.toLowerCase()] || SEV_CFG.medium;
  return (
    <span
      style={{
        background: c.bg,
        color: c.c,
        borderRadius: 999,
        padding: small ? "2px 8px" : "4px 12px",
        fontSize: small ? 9 : 11,
        fontWeight: 700,
        letterSpacing: 0.3,
      }}
    >
      {c.label}
    </span>
  );
}
