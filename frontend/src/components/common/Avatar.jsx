// ─────────────────────────────────────────────────────────────────────────────
// frontend/src/components/common/Avatar.jsx
// ─────────────────────────────────────────────────────────────────────────────
import React from "react";
import { T } from "../../styles/theme.js";
import { inits } from "../../utils/helpers.js";

export default function Avatar({ name = "?", size = 38, bg = T.blueD }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: T.blueL,
        fontSize: size * 0.33,
        fontWeight: 800,
        flexShrink: 0,
        fontFamily: "Urbanist, sans-serif",
      }}
    >
      {inits(name)}
    </div>
  );
}
