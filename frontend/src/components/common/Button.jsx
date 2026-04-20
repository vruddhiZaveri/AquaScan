// ─────────────────────────────────────────────────────────────────────────────
// frontend/src/components/common/Button.jsx
// ─────────────────────────────────────────────────────────────────────────────
import React from "react";
import { T } from "../../styles/theme.js";

const VARIANTS = {
  primary:  { background: T.blue,           color: "#fff", boxShadow: `0 4px 18px ${T.blue}35`, border: "none" },
  secondary:{ background: T.bg3,            color: T.t2,   boxShadow: "none", border: `1px solid ${T.borderL}` },
  ghost:    { background: "none",           color: T.t3,   boxShadow: "none", border: `1px solid ${T.borderL}` },
  danger:   { background: `${T.danger}20`,  color: T.danger,boxShadow:"none", border: `1px solid ${T.danger}40` },
  success:  { background: `${T.success}20`, color: T.success,boxShadow:"none",border: `1px solid ${T.success}40`},
};

export default function Button({ children, variant = "primary", loading, style, ...props }) {
  const s = VARIANTS[variant] || VARIANTS.primary;
  return (
    <button
      {...props}
      disabled={props.disabled || loading}
      style={{
        ...s, borderRadius: 13, padding: "12px 16px", fontSize: 14, fontWeight: 700,
        cursor: (props.disabled || loading) ? "default" : "pointer",
        fontFamily: "Urbanist, sans-serif", width: "100%",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
        opacity: (props.disabled || loading) ? 0.65 : 1, transition: "opacity .15s", ...style,
      }}
    >
      {loading
        ? <div style={{ width: 15, height: 15, border: "2px solid #fff4", borderTopColor: "currentColor", borderRadius: "50%", animation: "spin .7s linear infinite" }}/>
        : children}
    </button>
  );
}




