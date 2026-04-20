import React from "react";
import { T } from "../../styles/theme.js";
import { useReports } from "../../hooks/useReports.js";

export default function CommitteeAnalytics({ user }) {
  const { reports: allReports, loading } = useReports();
  const mine = allReports.filter(
    (r) => (r.selectedCommittees || []).includes(user.id) || !r.selectedCommittees?.length,
  );

  const total = mine.length;
  const resolved = mine.filter((r) => r.status === "resolved").length;
  const pending = mine.filter((r) => r.status === "submitted").length;
  const highSev = mine.filter((r) => String(r.ai?.severity || "").toLowerCase() === "high").length;
  const sevDist = {
    low: mine.filter((r) => String(r.ai?.severity || "").toLowerCase() === "low").length,
    medium: mine.filter((r) => String(r.ai?.severity || "").toLowerCase() === "medium").length,
    high: highSev,
  };
  const typeFreq = {};
  mine.forEach((r) => {
    const t = r.ai?.pollutionType || "Unknown";
    typeFreq[t] = (typeFreq[t] || 0) + 1;
  });

  if (loading)
    return (
      <div
        style={{
          padding: 20,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            border: `3px solid ${T.border}`,
            borderTopColor: T.blue,
            borderRadius: "50%",
            animation: "spin .8s linear infinite",
          }}
        />
      </div>
    );

  const maxType = Math.max(...Object.values(typeFreq), 1);

  return (
    <div style={{ padding: 16, overflowY: "auto", height: "100%" }}>
      <h2
        style={{
          color: T.t1,
          fontSize: 20,
          fontWeight: 800,
          margin: "0 0 16px",
          letterSpacing: -0.3,
        }}
      >
        Analytics
      </h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 8,
          marginBottom: 18,
        }}
      >
        {[
          ["Total", total, T.blueL],
          ["Resolved", resolved, T.success],
          ["High Severity", highSev, T.danger],
          ["Pending", pending, T.warn],
        ].map(([l, v, c]) => (
          <div
            key={l}
            style={{
              background: T.bg2,
              border: `1px solid ${T.border}`,
              borderRadius: 14,
              padding: "13px 14px",
            }}
          >
            <p
              style={{
                color: T.t4,
                fontSize: 9,
                fontWeight: 700,
                margin: "0 0 4px",
                letterSpacing: 0.8,
              }}
            >
              {l.toUpperCase()}
            </p>
            <p style={{ color: c, fontSize: 26, fontWeight: 800, margin: 0 }}>
              {v}
            </p>
          </div>
        ))}
      </div>

      <div
        style={{
          background: T.bg2,
          borderRadius: 16,
          padding: 14,
          marginBottom: 14,
          border: `1px solid ${T.border}`,
        }}
      >
        <p
          style={{
            color: T.t4,
            fontSize: 10,
            fontWeight: 700,
            margin: "0 0 12px",
            letterSpacing: 0.8,
          }}
        >
          SEVERITY DISTRIBUTION
        </p>
        {[
          ["High", sevDist.high, T.danger],
          ["Medium", sevDist.medium, T.warn],
          ["Low", sevDist.low, T.success],
        ].map(([l, v, c]) => (
          <div key={l} style={{ marginBottom: 10 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 4,
              }}
            >
              <span style={{ color: T.t1, fontSize: 12 }}>{l}</span>
              <span style={{ color: c, fontSize: 12, fontWeight: 700 }}>{v}</span>
            </div>
            <div style={{ background: T.bg1, borderRadius: 4, height: 7 }}>
              <div
                style={{
                  background: c,
                  borderRadius: 4,
                  height: 7,
                  width: total ? `${Math.round((v / total) * 100)}%` : "0%",
                  transition: "width .6s",
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          background: T.bg2,
          borderRadius: 16,
          padding: 14,
          border: `1px solid ${T.border}`,
        }}
      >
        <p
          style={{
            color: T.t4,
            fontSize: 10,
            fontWeight: 700,
            margin: "0 0 12px",
            letterSpacing: 0.8,
          }}
        >
          WASTE TYPE FREQUENCY
        </p>
        {Object.entries(typeFreq)
          .sort((a, b) => b[1] - a[1])
          .map(([t, v]) => (
            <div key={t} style={{ marginBottom: 9 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 3,
                }}
              >
                <span
                  style={{
                    color: T.t1,
                    fontSize: 12,
                    flex: 1,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    paddingRight: 8,
                  }}
                >
                  {t}
                </span>
                <span style={{ color: T.blueL, fontSize: 12, fontWeight: 700 }}>{v}</span>
              </div>
              <div style={{ background: T.bg1, borderRadius: 4, height: 6 }}>
                <div
                  style={{
                    background: T.blue,
                    borderRadius: 4,
                    height: 6,
                    width: `${Math.round((v / maxType) * 100)}%`,
                  }}
                />
              </div>
            </div>
          ))}
        {!Object.keys(typeFreq).length && (
          <p style={{ color: T.t4, fontSize: 13, textAlign: "center", margin: 0 }}>
            No report data yet.
          </p>
        )}
      </div>
    </div>
  );
}
