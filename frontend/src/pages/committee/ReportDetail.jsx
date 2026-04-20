// ─────────────────────────────────────────────────────────────────────────────
// frontend/src/pages/committee/ReportDetail.jsx
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState, useEffect } from "react";
import { T, STATUS_CFG } from "../../styles/theme.js";
import BackButton from "../../components/layout/BackButton.jsx";
import DetectionResult from "../../components/report/DetectionResult.jsx";
import Avatar from "../../components/common/Avatar.jsx";
import Button from "../../components/common/Button.jsx";
import { reportService } from "../../services/reportService.js";
import { fmtDT } from "../../utils/formatters.js";

export default function CommitteeReportDetail({
  report: initRep,
  user,
  nav,
  toast,
}) {
  const [rep, setRep] = useState(initRep);
  const [newStatus, setNewStatus] = useState(initRep.status);
  const [remark, setRemark] = useState("");
  const [team, setTeam] = useState(initRep.assignedTeam || "");
  const [priority, setPriority] = useState(initRep.priority || "normal");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    reportService.getById(initRep.id).then((r) => r && setRep(r));
  }, [initRep.id]);

  const save = async () => {
    setSaving(true);
    const updated = await reportService.updateStatus(
      rep.id,
      newStatus,
      user.committeeName,
      undefined,
      remark,
    );
    await reportService.update(rep.id, { priority, assignedTeam: team });
    setRep(updated);
    setRemark("");
    toast("Changes saved ✓");
    setSaving(false);
  };

  const ai = rep.ai || {};

  return (
    <div style={{ padding: 16, overflowY: "auto", height: "100%" }}>
      <BackButton onClick={() => nav("cReports")} label="Reports" />
      <div style={{ marginTop: 10, marginBottom: 14 }}>
        <h2
          style={{
            color: T.t1,
            fontSize: 16,
            fontWeight: 800,
            margin: "0 0 5px",
          }}
        >
          {ai.pollutionType || "Report"}
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
            maxHeight: 190,
            objectFit: "cover",
            marginBottom: 14,
          }}
          alt=""
        />
      ) : (
        <div
          style={{
            width: "100%",
            height: 100,
            borderRadius: 16,
            background: T.blueD,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 40,
            marginBottom: 14,
          }}
        >
          🌊
        </div>
      )}

      <DetectionResult ai={ai} />

      {/* Reporter */}
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
          REPORTER DETAILS
        </p>
        <div
          style={{
            display: "flex",
            gap: 10,
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <Avatar name={rep.userName || "?"} size={38} />
          <div>
            <p
              style={{
                color: T.t1,
                fontSize: 13,
                fontWeight: 700,
                margin: "0 0 2px",
              }}
            >
              {rep.userName}
            </p>
            <p style={{ color: T.t3, fontSize: 11, margin: "0 0 1px" }}>
              {rep.userEmail}
            </p>
          </div>
        </div>
        <p style={{ color: T.t3, fontSize: 11, margin: "0 0 4px" }}>
          📍 {rep.locationName}
        </p>
        {rep.comment && (
          <div
            style={{
              background: T.bg3,
              borderRadius: 9,
              padding: 9,
              marginTop: 6,
            }}
          >
            <p
              style={{
                color: T.t4,
                fontSize: 9,
                fontWeight: 700,
                margin: "0 0 3px",
              }}
            >
              CITIZEN NOTE
            </p>
            <p style={{ color: T.t1, fontSize: 12, margin: 0 }}>
              {rep.comment}
            </p>
          </div>
        )}
      </div>

      {/* Action panel */}
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
          WORKFLOW ACTIONS
        </p>
        <p style={{ color: T.t3, fontSize: 11, margin: "0 0 6px" }}>
          Update Status
        </p>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 6,
            marginBottom: 12,
          }}
        >
          {Object.entries(STATUS_CFG).map(([k, c]) => (
            <button
              key={k}
              onClick={() => setNewStatus(k)}
              style={{
                background: newStatus === k ? c.bg : "none",
                border: `1px solid ${newStatus === k ? c.c : T.border}`,
                color: newStatus === k ? c.c : T.t3,
                borderRadius: 999,
                padding: "5px 11px",
                fontSize: 10,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "Urbanist, sans-serif",
              }}
            >
              {c.label}
            </button>
          ))}
        </div>
        <div style={{ marginBottom: 10 }}>
          <label
            style={{
              color: T.t4,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: 0.8,
              display: "block",
              marginBottom: 5,
            }}
          >
            ASSIGN TEAM
          </label>
          <input
            value={team}
            onChange={(e) => setTeam(e.target.value)}
            placeholder="Team name or officer"
            style={{
              width: "100%",
              background: T.bg3,
              border: `1px solid ${T.border}`,
              borderRadius: 12,
              padding: "10px 13px",
              color: T.t1,
              fontSize: 13,
              outline: "none",
              fontFamily: "Urbanist, sans-serif",
            }}
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label
            style={{
              color: T.t4,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: 0.8,
              display: "block",
              marginBottom: 5,
            }}
          >
            PUBLIC REMARK
          </label>
          <textarea
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            rows={2}
            placeholder="Visible to citizen…"
            style={{
              width: "100%",
              background: T.bg3,
              border: `1px solid ${T.border}`,
              borderRadius: 11,
              padding: "9px 12px",
              color: T.t1,
              fontSize: 12,
              resize: "none",
              outline: "none",
              fontFamily: "Urbanist, sans-serif",
            }}
          />
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Button onClick={save} loading={saving}>
            Save Changes
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              setNewStatus("rejected");
              save();
            }}
          >
            🚫 Reject
          </Button>
        </div>
      </div>

      {/* History */}
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
            STATUS HISTORY
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
                    margin: "0 0 1px",
                  }}
                >
                  {STATUS_CFG[h.status]?.label || h.status}
                </p>
                <p style={{ color: T.t4, fontSize: 10, margin: 0 }}>
                  {fmtDT(h.timestamp)}
                  {h.by ? ` · ${h.by}` : ""}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <Button onClick={() => nav("cChat", rep)}>💬 Open Report Chat</Button>
      <div style={{ height: 16 }} />
    </div>
  );
}
