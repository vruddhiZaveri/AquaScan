// ─────────────────────────────────────────────────────────────────────────────
// frontend/src/components/layout/StatusBar.jsx
// ─────────────────────────────────────────────────────────────────────────────
import React from "react";
import { T } from "../../styles/theme.js";

export default function StatusBar() {
  return (
    <div
      style={{
        padding: "10px 22px 4px",
        display: "flex",
        justifyContent: "space-between",
        flexShrink: 0,
      }}
    >
      <span style={{ color: T.t3, fontSize: 12, fontWeight: 600 }}>9:41</span>
      <div style={{ display: "flex", gap: 5, fontSize: 11, color: T.t3 }}>
        <span>●●●</span>
        <span>WiFi</span>
        <span>🔋</span>
      </div>
    </div>
  );
}
