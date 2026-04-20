// ─────────────────────────────────────────────────────────────────────────────
// frontend/src/components/common/Chip.jsx
// ─────────────────────────────────────────────────────────────────────────────
import React from "react";
import { T, STATUS_CFG, SEV_CFG } from "../../styles/theme.js";

export function Chip({ label, color = T.blueL, bg, small }) {
  return (
    <span
      style={{
        background: bg || `${color}22`,
        color,
        borderRadius: 999,
        padding: small ? "2px 8px" : "3px 10px",
        fontSize: small ? 9 : 10,
        fontWeight: 700,
        letterSpacing: 0.3,
        display: "inline-flex",
        alignItems: "center",
      }}
    >
      {label}
    </span>
  );
}

export function StatusChip({ status, small }) {
  const c = STATUS_CFG[status] || STATUS_CFG.submitted;
  return <Chip label={c.label} color={c.c} bg={c.bg} small={small} />;
}

export function SeverityChip({ severity, small }) {
  const c = SEV_CFG[severity?.toLowerCase()] || SEV_CFG.medium;
  return <Chip label={c.label} color={c.c} bg={c.bg} small={small} />;
}
