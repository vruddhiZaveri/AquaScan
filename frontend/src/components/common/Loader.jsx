// ─────────────────────────────────────────────────────────────────────────────
// frontend/src/components/common/Loader.jsx
// ─────────────────────────────────────────────────────────────────────────────
import React from "react";
import { T } from "../../styles/theme.js";

export function Spinner({ size = 40 }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        border: `3px solid ${T.border}`,
        borderTopColor: T.blue,
        borderRadius: "50%",
        animation: "spin .8s linear infinite",
        margin: "0 auto",
      }}
    />
  );
}

export function Skeleton({ h = 40, r = 10 }) {
  return (
    <div
      style={{
        height: h,
        borderRadius: r,
        background: `linear-gradient(90deg,${T.bg2} 25%,${T.bg3} 50%,${T.bg2} 75%)`,
        backgroundSize: "200% 100%",
        animation: "pulse 1.4s ease infinite",
      }}
    />
  );
}

export function EmptyState({ icon, title, desc, cta, onCta }) {
  return (
    <div
      style={{
        background: T.bg2,
        borderRadius: 18,
        padding: 28,
        border: `1px solid ${T.border}`,
        textAlign: "center",
        animation: "fadeUp .3s ease",
      }}
    >
      <div style={{ fontSize: 40, marginBottom: 10 }}>{icon}</div>
      <p
        style={{
          color: T.t1,
          fontSize: 14,
          fontWeight: 700,
          margin: "0 0 6px",
        }}
      >
        {title}
      </p>
      <p
        style={{
          color: T.t3,
          fontSize: 12,
          margin: "0 0 14px",
          lineHeight: 1.6,
        }}
      >
        {desc}
      </p>
      {cta && (
        <button
          onClick={onCta}
          style={{
            background: T.blue,
            border: "none",
            color: "#fff",
            borderRadius: 13,
            padding: "10px 20px",
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "Urbanist, sans-serif",
          }}
        >
          {cta}
        </button>
      )}
    </div>
  );
}
