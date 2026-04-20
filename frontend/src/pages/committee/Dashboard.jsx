// ─────────────────────────────────────────────────────────────────────────────
// frontend/src/pages/committee/Dashboard.jsx
// ─────────────────────────────────────────────────────────────────────────────
import React from "react";
import { T } from "../../styles/theme.js";
import Avatar from "../../components/common/Avatar.jsx";
import { StatusChip, SeverityChip } from "../../components/common/Chip.jsx";
import { Skeleton, EmptyState } from "../../components/common/Loader.jsx";
import { useReports } from "../../hooks/useReports.js";
import { inits } from "../../utils/helpers.js";

export default function CommitteeDashboard({ user, nav }) {
  const { reports: allReports, loading } = useReports();

  const reports = allReports.filter(
    (r) => (r.selectedCommittees || []).includes(user.id) || !r.selectedCommittees?.length,
  );

  const total = reports.length;
  const pending = reports.filter((r) => r.status === "submitted").length;
  const highSev = reports.filter((r) => String(r.ai?.severity || "").toLowerCase() === "high").length;
  const resolved = reports.filter((r) => r.status === "resolved").length;
  const inProg = reports.filter((r) => r.status === "in_progress").length;

  return (
    <div style={{ padding: 16, overflowY: "auto", height: "100%" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 18,
        }}
      >
        <div>
          <p style={{ color: T.t3, fontSize: 12, margin: 0 }}>
            Committee Portal
          </p>
          <h2
            style={{
              color: T.t1,
              fontSize: 19,
              fontWeight: 800,
              margin: 0,
              letterSpacing: -0.3,
            }}
          >
            {user.committeeName}
          </h2>
        </div>
        <div onClick={() => nav("cProfile")} style={{ cursor: "pointer" }}>
          <Avatar name={user.committeeName} size={44} bg="#1a3a5c" />
        </div>
      </div>

      {loading ? (
        <>
          <Skeleton h={100} r={16} />
          <div style={{ height: 8 }} />
          <Skeleton h={100} r={16} />
        </>
      ) : (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 8,
              marginBottom: 18,
            }}
          >
            {[
              ["📋", "Total", total, null],
              ["⏳", "Pending", pending, "submitted"],
              ["🚨", "High Sev.", highSev, "high"],
              ["✅", "Resolved", resolved, "resolved"],
            ].map(([ic, l, v, f]) => (
              <div
                key={l}
                onClick={() => f && nav("cReports", { filter: f })}
                style={{
                  background: T.bg2,
                  border: `1px solid ${T.border}`,
                  borderRadius: 14,
                  padding: "13px 14px",
                  cursor: f ? "pointer" : "default",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    gap: 5,
                    alignItems: "center",
                    marginBottom: 5,
                  }}
                >
                  <span style={{ fontSize: 16 }}>{ic}</span>
                  <p
                    style={{
                      color: T.t4,
                      fontSize: 9,
                      fontWeight: 700,
                      margin: 0,
                      letterSpacing: 0.8,
                    }}
                  >
                    {l.toUpperCase()}
                  </p>
                </div>
                <p
                  style={{
                    color: T.t1,
                    fontSize: 28,
                    fontWeight: 800,
                    margin: 0,
                  }}
                >
                  {v}
                </p>
              </div>
            ))}
          </div>

          <h3
            style={{
              color: T.t1,
              fontSize: 14,
              fontWeight: 700,
              margin: "0 0 10px",
            }}
          >
            Recent Reports
          </h3>
          {reports.length === 0 ? (
            <EmptyState
              icon="📭"
              title="No reports yet"
              desc="Reports assigned to your committee will appear here."
            />
          ) : (
            [...reports]
              .reverse()
              .slice(0, 4)
              .map((r) => (
                <div
                  key={r.id}
                  onClick={() => nav("cReportDetail", r)}
                  style={{
                    background: T.bg2,
                    borderRadius: 14,
                    padding: "12px 14px",
                    border: `1px solid ${T.border}`,
                    marginBottom: 8,
                    cursor: "pointer",
                    display: "flex",
                    gap: 10,
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background:
                        String(r.ai?.severity || "").toLowerCase() === "high"
                          ? T.danger
                          : String(r.ai?.severity || "").toLowerCase() === "medium"
                            ? T.warn
                            : T.success,
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        color: T.t1,
                        fontSize: 13,
                        fontWeight: 700,
                        margin: "0 0 2px",
                      }}
                    >
                      {r.ai?.pollutionType || "Report"}
                    </p>
                    <p
                      style={{
                        color: T.t3,
                        fontSize: 10,
                        margin: 0,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      👤 {r.userName} · 📍 {r.locationName?.split(",")[0]}
                    </p>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 4,
                      alignItems: "flex-end",
                    }}
                  >
                    <SeverityChip severity={r.ai?.severity} small />
                    <StatusChip status={r.status} small />
                  </div>
                </div>
              ))
          )}
        </>
      )}
    </div>
  );
}
