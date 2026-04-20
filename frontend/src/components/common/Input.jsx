// ─────────────────────────────────────────────────────────────────────────────
// frontend/src/components/common/Input.jsx
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState } from "react";
import { T } from "../../styles/theme.js";

export default function Input({ label, style, ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ width: "100%" }}>
      {label && (
        <label
          style={{
            color: T.t3,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: 0.8,
            display: "block",
            marginBottom: 5,
          }}
        >
          {label}
        </label>
      )}
      <input
        {...props}
        onFocus={(e) => {
          setFocused(true);
          props.onFocus && props.onFocus(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          props.onBlur && props.onBlur(e);
        }}
        style={{
          background: T.bg2,
          border: `1px solid ${focused ? T.blueMid : T.border}`,
          borderRadius: 12,
          padding: "12px 14px",
          color: T.t1,
          fontSize: 14,
          width: "100%",
          outline: "none",
          fontFamily: "Urbanist, sans-serif",
          transition: "border-color .15s",
          ...style,
        }}
      />
    </div>
  );
}
