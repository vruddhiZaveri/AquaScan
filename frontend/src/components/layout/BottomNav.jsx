// ─────────────────────────────────────────────────────────────────────────────
// frontend/src/components/layout/BottomNav.jsx
// ─────────────────────────────────────────────────────────────────────────────
import React from "react";
import { T } from "../../styles/theme.js";

export default function BottomNav({ tabs, activeId, onNav }) {
  return (
    <div
      style={{
        display: "flex",
        background: T.bg2,
        borderTop: `1px solid ${T.border}`,
        padding: "6px 4px 5px",
        flexShrink: 0,
      }}
    >
      {tabs.map((t) => {
        const on = activeId === t.id;
        return (
          <button
            key={t.id}
            onClick={() => onNav(t.id)}
            style={{
              flex: 1,
              background: "none",
              border: "none",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
              cursor: "pointer",
              padding: "3px 0",
            }}
          >
            <span
              style={{
                fontSize: 17,
                filter: on ? "none" : "grayscale(1) opacity(.35)",
              }}
            >
              {t.ic}
            </span>
            <span
              style={{
                fontSize: 9,
                color: on ? T.blueL : T.t4,
                fontWeight: on ? 700 : 400,
                fontFamily: "Urbanist, sans-serif",
              }}
            >
              {t.label}
            </span>
            {on && (
              <div
                style={{
                  width: 4,
                  height: 4,
                  borderRadius: "50%",
                  background: T.blueL,
                }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
