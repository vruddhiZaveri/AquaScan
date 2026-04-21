import React, { useMemo, useState } from "react";
import { T, STATUS_CFG } from "../../styles/theme.js";
import { Skeleton, EmptyState } from "../../components/common/Loader.jsx";
import { SeverityChip, StatusChip } from "../../components/common/Chip.jsx";
import { useReports } from "../../hooks/useReports.js";
import { fmtDate } from "../../utils/formatters.js";

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

export default function CommitteeReports({ user, nav, initFilter }) {
  const [statusFilter, setStatusFilter] = useState(initFilter?.filter || "");
  const { reports: allReports, loading } = useReports(null);

  const reports = useMemo(() => {
    const mine = allReports.filter((report) =>
      reportBelongsToCommittee(report, user),
    );

    if (statusFilter === "high") {
      return mine.filter(
        (report) => String(report.ai?.severity || "").toLowerCase() === "high",
      );
    }

    if (statusFilter === "pending") {
      return mine.filter((report) =>
        ["submitted", "under_review", "in_progress"].includes(
          String(report.status || "").toLowerCase(),
        ),
      );
    }

    return statusFilter
      ? mine.filter(
          (report) =>
            String(report.status || "").toLowerCase() ===
            String(statusFilter).toLowerCase(),
        )
      : mine;
  }, [allReports, statusFilter, user]);

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
        Incoming Reports
      </h2>

      <div
        style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}
      >
        {[
          ["", "All"],
          ["submitted", "Submitted"],
          ["under_review", "Under Review"],
          ["in_progress", "In Progress"],
          ["resolved", "Resolved"],
        ].map(([value, label]) => (
          <button
            key={value || "all"}
            onClick={() => setStatusFilter(value)}
            style={{
              background: statusFilter === value ? `${T.blue}20` : "none",
              border: `1px solid ${statusFilter === value ? T.blue : T.border}`,
              color: statusFilter === value ? T.blueL : T.t3,
              borderRadius: 999,
              padding: "4px 10px",
              fontSize: 10,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "Urbanist, sans-serif",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <>
          <Skeleton h={90} r={16} />
          <div style={{ height: 8 }} />
          <Skeleton h={90} r={16} />
        </>
      ) : reports.length === 0 ? (
        <EmptyState
          icon="📭"
          title="No reports found"
          desc="Adjust filters or wait for new submissions."
        />
      ) : (
        reports.map((report) => (
          <div
            key={report.id}
            onClick={() => nav("cReportDetail", report)}
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
                    gap: 8,
                  }}
                >
                  <p
                    style={{
                      color: T.t1,
                      fontSize: 13,
                      fontWeight: 700,
                      margin: 0,
                      flex: 1,
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
                    margin: "0 0 5px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  👤 {report.userName || "Anonymous"} · 📍{" "}
                  {(report.locationName || "Unknown").split(",")[0]} ·{" "}
                  {fmtDate(report.createdAt)}
                </p>

                <StatusChip status={report.status} small />
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
