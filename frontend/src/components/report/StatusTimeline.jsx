// ─────────────────────────────────────────────────────────────────────────────
// frontend/src/components/report/StatusTimeline.jsx
// ─────────────────────────────────────────────────────────────────────────────
import React from "react";
import { T, STATUS_STEPS } from "../../styles/theme.js";

export default function StatusTimeline({ status }) {
  const cur = STATUS_STEPS.indexOf(status);
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      {STATUS_STEPS.map((s, i) => (
        <div
          key={s}
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
            {i > 0 && (
              <div
                style={{
                  flex: 1,
                  height: 2,
                  background: i <= cur ? T.blue : T.border,
                }}
              />
            )}
            <div
              style={{
                width: 9,
                height: 9,
                borderRadius: "50%",
                background: i <= cur ? T.blue : T.border,
                flexShrink: 0,
                boxShadow: i <= cur ? `0 0 6px ${T.blue}80` : "none",
              }}
            />
            {i < STATUS_STEPS.length - 1 && (
              <div
                style={{
                  flex: 1,
                  height: 2,
                  background: i < cur ? T.blue : T.border,
                }}
              />
            )}
          </div>
          <span
            style={{
              color: i <= cur ? T.blueL : T.t4,
              fontSize: 7,
              marginTop: 3,
              fontWeight: i <= cur ? 700 : 400,
              textAlign: "center",
            }}
          >
            {s.replace(/_/g, " ")}
          </span>
        </div>
      ))}
    </div>
  );
}
