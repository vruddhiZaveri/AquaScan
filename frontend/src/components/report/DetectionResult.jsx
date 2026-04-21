// ─────────────────────────────────────────────────────────────────────────────
// frontend/src/components/report/DetectionResult.jsx
// ─────────────────────────────────────────────────────────────────────────────
import React from "react";
import { T, SEV_CFG } from "../../styles/theme.js";
import { Chip } from "../common/Chip.jsx";

export default function DetectionResult({ ai }) {
  if (!ai) return null;
  const sc = SEV_CFG[ai.severity?.toLowerCase()] || SEV_CFG.medium;
  return (
    <div
      style={{
        background: T.bg3,
        border: `1px solid ${T.blue}35`,
        borderRadius: 20,
        padding: 16,
        marginBottom: 14,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 14,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <span>🤖</span>
          <span
            style={{
              color: T.blueL,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: 1.1,
            }}
          >
            AI ANALYSIS
          </span>
        </div>
        <div style={{ display: "flex", gap: 5 }}>
          <Chip
            label={`${Math.round((ai.confidence || 0.8) * 100)}% conf`}
            color={T.blueL}
            small
          />
          <Chip
            label={ai.live ? "Live" : "Offline"}
            color={ai.live ? T.success : T.warn}
            small
          />
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 8,
          marginBottom: 14,
        }}
      >
        {[
          ["POLLUTION TYPE", ai.pollutionType, T.t1],
          ["SEVERITY", (ai.severity || "").toUpperCase(), sc.c],
          ["URGENCY", ai.urgency || `${ai.urgencyScore || 0}/10`, sc.c],
          ["STATUS", ai.status || "Live", T.blueL],
          ["ACTION NEEDED", ai.actionNeeded || "Monitor", T.blueL],
          ["REPORT TYPE", ai.reportType || "Floating Waste", T.blueL],
        ].map(([l, v, c]) => (
          <div
            key={l}
            style={{ background: T.bg1, borderRadius: 11, padding: "9px 12px" }}
          >
            <p
              style={{
                color: T.t4,
                fontSize: 8,
                fontWeight: 700,
                margin: "0 0 4px",
                letterSpacing: 0.7,
              }}
            >
              {l}
            </p>
            <p style={{ color: c, fontSize: 12, fontWeight: 700, margin: 0 }}>
              {v}
            </p>
          </div>
        ))}
      </div>

      {ai.detectedItems?.length > 0 && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 5,
            marginBottom: 12,
          }}
        >
          {ai.detectedItems.map((item, i) => (
            <Chip
              key={i}
              label={item.replace(/_/g, " ")}
              color={T.blueL}
              small
            />
          ))}
        </div>
      )}

      <div style={{ background: T.bg1, borderRadius: 11, padding: 11 }}>
        <p
          style={{
            color: T.t1,
            fontSize: 12,
            margin: "0 0 7px",
            lineHeight: 1.6,
          }}
        >
          {ai.description}
        </p>
        <p style={{ color: T.blueL, fontSize: 11, margin: 0, fontWeight: 600 }}>
          💡 {ai.recommendations}
        </p>
      </div>
    </div>
  );
}
