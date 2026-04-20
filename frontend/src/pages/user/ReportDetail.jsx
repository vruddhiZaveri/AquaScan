// ─────────────────────────────────────────────────────────────────────────────
// frontend/src/pages/user/ReportDetail.jsx
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState, useEffect } from "react";
import { T } from "../../styles/theme.js";
import BackButton from "../../components/layout/BackButton.jsx";
import DetectionResult from "../../components/report/DetectionResult.jsx";
import StatusTimeline from "../../components/report/StatusTimeline.jsx";
import { StatusChip } from "../../components/common/Chip.jsx";
import Button from "../../components/common/Button.jsx";
import { reportService } from "../../services/reportService.js";
import { fmtDT } from "../../utils/formatters.js";

export default function ReportDetail({ report: initRep, nav }) {
  const [rep, setRep] = useState(initRep);
  useEffect(() => {
    reportService.getById(initRep.id).then((r) => r && setRep(r));
  }, [initRep.id]);

  return (
    <div style={{ padding: 16, overflowY: "auto", height: "100%" }}>
      <BackButton onClick={() => nav("reports")} label="Reports" />
      <div style={{ marginTop: 10, marginBottom: 14 }}>
        <h2
          style={{
            color: T.t1,
            fontSize: 17,
            fontWeight: 800,
            margin: "0 0 5px",
          }}
        >
          {rep.ai?.pollutionType || "Pollution Report"}
        </h2>
        <p style={{ color: T.t4, fontSize: 10, margin: 0 }}>
          ID: {rep.id} · Filed: {fmtDT(rep.createdAt)}
        </p>
      </div>

      {rep.imageData ? (
        <img
          src={rep.imageData}
          style={{
            width: "100%",
            borderRadius: 16,
            maxHeight: 200,
            objectFit: "cover",
            marginBottom: 14,
            display: "block",
          }}
          alt=""
        />
      ) : (
        <div
          style={{
            height: 110,
            borderRadius: 16,
            background: T.blueD,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 44,
            marginBottom: 14,
          }}
        >
          🌊
        </div>
      )}

      <DetectionResult ai={rep.ai} />

      <div
        style={{
          background: T.bg2,
          borderRadius: 14,
          padding: 12,
          border: `1px solid ${T.border}`,
          marginBottom: 12,
        }}
      >
        <p
          style={{
            color: T.t4,
            fontSize: 9,
            fontWeight: 700,
            margin: "0 0 8px",
            letterSpacing: 0.8,
          }}
        >
          LOCATION & STATUS
        </p>
        <p
          style={{
            color: T.t1,
            fontSize: 13,
            fontWeight: 600,
            margin: "0 0 8px",
          }}
        >
          📍 {rep.locationName}
        </p>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 10,
          }}
        >
          <StatusChip status={rep.status} />
          <span style={{ color: T.t4, fontSize: 10 }}>
            {fmtDT(rep.createdAt)}
          </span>
        </div>
        <StatusTimeline status={rep.status} />
      </div>

      {rep.statusHistory?.length > 0 && (
        <div
          style={{
            background: T.bg2,
            borderRadius: 14,
            padding: 12,
            border: `1px solid ${T.border}`,
            marginBottom: 12,
          }}
        >
          <p
            style={{
              color: T.t4,
              fontSize: 9,
              fontWeight: 700,
              margin: "0 0 10px",
              letterSpacing: 0.8,
            }}
          >
            ACTIVITY LOG
          </p>
          {[...rep.statusHistory].reverse().map((h, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                gap: 10,
                padding: "7px 0",
                borderBottom:
                  i < rep.statusHistory.length - 1
                    ? `1px solid ${T.border}`
                    : "none",
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: T.blue,
                  flexShrink: 0,
                  marginTop: 4,
                }}
              />
              <div>
                <p
                  style={{
                    color: T.t1,
                    fontSize: 12,
                    fontWeight: 600,
                    margin: "0 0 2px",
                  }}
                >
                  {h.status?.replace(/_/g, " ")}
                </p>
                <p style={{ color: T.t4, fontSize: 10, margin: 0 }}>
                  {fmtDT(h.timestamp)}
                  {h.note ? ` · ${h.note}` : ""}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {rep.comment && (
        <div
          style={{
            background: T.bg2,
            borderRadius: 14,
            padding: 12,
            border: `1px solid ${T.border}`,
            marginBottom: 12,
          }}
        >
          <p
            style={{
              color: T.t4,
              fontSize: 9,
              fontWeight: 700,
              margin: "0 0 5px",
              letterSpacing: 0.8,
            }}
          >
            YOUR NOTE
          </p>
          <p style={{ color: T.t1, fontSize: 13, margin: 0 }}>{rep.comment}</p>
        </div>
      )}

      <Button onClick={() => nav("chat", rep)}>💬 Open Chat Thread</Button>
      <div style={{ height: 16 }} />
    </div>
  );
}
