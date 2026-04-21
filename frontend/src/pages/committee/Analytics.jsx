import React, { useMemo } from "react";
import { T } from "../../styles/theme.js";
import { useReports } from "../../hooks/useReports.js";

function normalizeCommitteeValue(value = "") {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function reportBelongsToCommittee(report, user) {
  const selected = Array.isArray(report?.selectedCommittees)
    ? report.selectedCommittees
    : [];

  if (!selected.length) return true;

  const userId = normalizeCommitteeValue(user?.id);
  const userName = normalizeCommitteeValue(user?.committeeName);

  return selected.some((committee) => {
    if (typeof committee === "string") {
      const value = normalizeCommitteeValue(committee);
      return value === userId || value === userName;
    }

    if (committee && typeof committee === "object") {
      const cid = normalizeCommitteeValue(committee.id);
      const cname = normalizeCommitteeValue(committee.committeeName);
      return cid === userId || cname === userName;
    }

    return false;
  });
}

export default function CommitteeAnalytics({ user }) {
  const { reports: allReports, loading } = useReports();

  const mine = useMemo(
    () => allReports.filter((report) => reportBelongsToCommittee(report, user)),
    [allReports, user],
  );

  const total = mine.length;
  const resolved = mine.filter(
    (report) => String(report.status || "").toLowerCase() === "resolved",
  ).length;
  const pending = mine.filter((report) =>
    ["submitted", "under_review", "in_progress"].includes(
      String(report.status || "").toLowerCase(),
    ),
  ).length;
  const highSev = mine.filter(
    (report) => String(report.ai?.severity || "").toLowerCase() === "high",
  ).length;

  const sevDist = {
    low: mine.filter(
      (report) => String(report.ai?.severity || "").toLowerCase() === "low",
    ).length,
    medium: mine.filter(
      (report) => String(report.ai?.severity || "").toLowerCase() === "medium",
    ).length,
    high: highSev,
  };

  const typeFreq = {};
  mine.forEach((report) => {
    const type = report.ai?.pollutionType || "Unknown";
    typeFreq[type] = (typeFreq[type] || 0) + 1;
  });

  if (loading) {
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
  }

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
        ].map(([label, value, color]) => (
          <div
            key={label}
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
              {label.toUpperCase()}
            </p>
            <p style={{ color, fontSize: 26, fontWeight: 800, margin: 0 }}>
              {value}
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
        ].map(([label, value, color]) => (
          <div key={label} style={{ marginBottom: 10 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 4,
              }}
            >
              <span style={{ color: T.t1, fontSize: 12 }}>{label}</span>
              <span style={{ color, fontSize: 12, fontWeight: 700 }}>
                {value}
              </span>
            </div>
            <div style={{ background: T.bg1, borderRadius: 4, height: 7 }}>
              <div
                style={{
                  background: color,
                  borderRadius: 4,
                  height: 7,
                  width: total ? `${Math.round((value / total) * 100)}%` : "0%",
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
          .map(([type, value]) => (
            <div key={type} style={{ marginBottom: 9 }}>
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
                  {type}
                </span>
                <span style={{ color: T.blueL, fontSize: 12, fontWeight: 700 }}>
                  {value}
                </span>
              </div>
              <div style={{ background: T.bg1, borderRadius: 4, height: 6 }}>
                <div
                  style={{
                    background: T.blue,
                    borderRadius: 4,
                    height: 6,
                    width: `${Math.round((value / maxType) * 100)}%`,
                  }}
                />
              </div>
            </div>
          ))}

        {!Object.keys(typeFreq).length && (
          <p
            style={{
              color: T.t4,
              fontSize: 13,
              textAlign: "center",
              margin: 0,
            }}
          >
            No report data yet.
          </p>
        )}
      </div>
    </div>
  );
}
