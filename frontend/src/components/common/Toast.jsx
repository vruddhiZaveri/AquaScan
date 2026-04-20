// ─────────────────────────────────────────────────────────────────────────────
// frontend/src/components/common/Toast.jsx
// ─────────────────────────────────────────────────────────────────────────────
import React, { useEffect } from "react";
import { T } from "../../styles/theme.js";

export default function Toast({ msg, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, []);
  return (
    <div
      style={{
        position: "absolute",
        bottom: 88,
        left: "50%",
        transform: "translateX(-50%)",
        background: T.bg3,
        border: `1px solid ${T.borderL}`,
        color: T.t1,
        borderRadius: 22,
        padding: "10px 20px",
        fontSize: 12,
        fontWeight: 600,
        zIndex: 999,
        whiteSpace: "nowrap",
        pointerEvents: "none",
        animation: "fadeUp .25s ease",
        boxShadow: `0 8px 24px ${T.bg0}`,
      }}
    >
      {msg}
    </div>
  );
}
