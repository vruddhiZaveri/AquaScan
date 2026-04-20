// ─────────────────────────────────────────────────────────────────────────────
// frontend/src/pages/user/Reports.jsx
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState } from "react";
import { T, STATUS_CFG } from "../../styles/theme.js";
import { EmptyState, Skeleton } from "../../components/common/Loader.jsx";
import ReportCard from "../../components/report/ReportCard.jsx";
import { useReports } from "../../hooks/useReports.js";

export default function Reports({ user, nav, initFilter = "" }) {
  const [statusFilter, setStatusFilter] = useState(initFilter);
  const { reports: all, loading } = useReports(user.id);
  const reports = statusFilter
    ? all.filter((r) => r.status === statusFilter)
    : all;

  return (
    <div style={{ padding: 16, overflowY: "auto", height: "100%" }}>
      <h2
        style={{
          color: T.t1,
          fontSize: 20,
          fontWeight: 800,
          margin: "0 0 14px",
          letterSpacing: -0.3,
        }}
      >
        {initFilter === "resolved" ? "Resolved Reports" : "My Reports"}
      </h2>

      {!initFilter && (
        <div
          style={{
            display: "flex",
            gap: 6,
            marginBottom: 14,
            flexWrap: "wrap",
          }}
        >
          {["", "submitted", "under_review", "in_progress", "resolved"].map(
            (s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                style={{
                  background: statusFilter === s ? `${T.blue}20` : "none",
                  border: `1px solid ${statusFilter === s ? T.blue : T.border}`,
                  color: statusFilter === s ? T.blueL : T.t3,
                  borderRadius: 999,
                  padding: "4px 11px",
                  fontSize: 10,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "Urbanist, sans-serif",
                }}
              >
                {s ? STATUS_CFG[s]?.label || s : "All"}
              </button>
            ),
          )}
        </div>
      )}

      {loading ? (
        <>
          <Skeleton h={90} r={16} />
          <div style={{ height: 8 }} />
          <Skeleton h={90} r={16} />
        </>
      ) : reports.length === 0 ? (
        <EmptyState
          icon="📋"
          title="No reports found"
          desc="Your submitted reports appear here."
          cta="Scan Now"
          onCta={() => nav("scan")}
        />
      ) : (
        reports.map((r) => (
          <ReportCard
            key={r.id}
            report={r}
            onClick={() => nav("reportDetail", r)}
          />
        ))
      )}
    </div>
  );
}
