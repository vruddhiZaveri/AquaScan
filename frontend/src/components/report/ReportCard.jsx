// ─────────────────────────────────────────────────────────────────────────────
// frontend/src/components/report/ReportCard.jsx
// ─────────────────────────────────────────────────────────────────────────────
import React from "react";
import { T } from "../../styles/theme.js";
import { StatusChip, SeverityChip } from "../common/Chip.jsx";
import StatusTimeline from "./StatusTimeline.jsx";
import { fmtDate } from "../../utils/formatters.js";

export default function ReportCard({ report, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: T.bg2,
        borderRadius: 16,
        padding: "13px 14px",
        border: `1px solid ${T.border}`,
        marginBottom: 10,
        cursor: "pointer",
      }}
    >
      <div style={{ display: "flex", gap: 12, marginBottom: 10 }}>
        {report.imageData ? (
          <img
            src={report.imageData}
            style={{
              width: 50,
              height: 50,
              borderRadius: 11,
              objectFit: "cover",
              flexShrink: 0,
            }}
            alt=""
          />
        ) : (
          <div
            style={{
              width: 50,
              height: 50,
              borderRadius: 11,
              background: T.blueD,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
              flexShrink: 0,
            }}
          >
            🌊
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 3,
            }}
          >
            <p
              style={{
                color: T.t1,
                fontSize: 13,
                fontWeight: 700,
                margin: 0,
                flex: 1,
                paddingRight: 8,
              }}
            >
              {report.ai?.pollutionType || "Report"}
            </p>
            <SeverityChip severity={report.ai?.severity} small />
          </div>
          <p
            style={{
              color: T.t3,
              fontSize: 11,
              margin: "0 0 6px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            📍 {report.locationName} · {fmtDate(report.createdAt)}
          </p>
          <StatusChip status={report.status} small />
        </div>
      </div>
      <StatusTimeline status={report.status} />
      <div style={{ marginTop: 8, textAlign: "right" }}>
        <span style={{ color: T.blueL, fontSize: 11, fontWeight: 700 }}>
          💬 View Chat →
        </span>
      </div>
    </div>
  );
}
