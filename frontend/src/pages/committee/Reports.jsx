// ─────────────────────────────────────────────────────────────────────────────
// frontend/src/pages/committee/Reports.jsx
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState } from "react";
import { T, STATUS_CFG } from "../../styles/theme.js";
import { Skeleton, EmptyState } from "../../components/common/Loader.jsx";
import { SeverityChip, StatusChip } from "../../components/common/Chip.jsx";
import { useReports } from "../../hooks/useReports.js";
import { fmtDate } from "../../utils/formatters.js";

export default function CommitteeReports({ user, nav, initFilter }) {
  const [statusFilter, setStatusFilter] = useState(initFilter?.filter || "");
  const { reports: all, loading }       = useReports(null); // all reports
  const mine    = all.filter(r => (r.selectedCommittees || []).includes(user.id) || !r.selectedCommittees?.length);
  const reports = statusFilter === "high"
    ? mine.filter(r => r.ai?.severity === "high")
    : statusFilter ? mine.filter(r => r.status === statusFilter) : mine;

  return (
    <div style={{ padding: 16, overflowY: "auto", height: "100%" }}>
      <h2 style={{ color: T.t1, fontSize: 20, fontWeight: 800, margin: "0 0 14px", letterSpacing: -.3 }}>Incoming Reports</h2>
      <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
        {["","submitted","under_review","in_progress","resolved"].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)} style={{ background: statusFilter === s ? `${T.blue}20` : "none", border: `1px solid ${statusFilter === s ? T.blue : T.border}`, color: statusFilter === s ? T.blueL : T.t3, borderRadius: 999, padding: "4px 10px", fontSize: 10, fontWeight: 700, cursor: "pointer", fontFamily: "Urbanist, sans-serif" }}>
            {s ? (STATUS_CFG[s]?.label || s) : "All"}
          </button>
        ))}
      </div>

      {loading
        ? <><Skeleton h={90} r={16}/><div style={{height:8}}/><Skeleton h={90} r={16}/></>
        : reports.length === 0
          ? <EmptyState icon="📭" title="No reports found" desc="Adjust filters or wait for new submissions."/>
          : reports.map(r => (
            <div key={r.id} onClick={() => nav("cReportDetail", r)} style={{ background: T.bg2, borderRadius: 16, padding: "13px 14px", border: `1px solid ${T.border}`, marginBottom: 10, cursor: "pointer" }}>
              <div style={{ display: "flex", gap: 12, marginBottom: 10 }}>
                {r.imageData ? <img src={r.imageData} style={{ width: 50, height: 50, borderRadius: 11, objectFit: "cover", flexShrink: 0 }} alt=""/> : <div style={{ width: 50, height: 50, borderRadius: 11, background: T.blueD, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>🌊</div>}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                    <p style={{ color: T.t1, fontSize: 13, fontWeight: 700, margin: 0, flex: 1, paddingRight: 8 }}>{r.ai?.pollutionType || "Report"}</p>
                    <SeverityChip severity={r.ai?.severity} small/>
                  </div>
                  <p style={{ color: T.t3, fontSize: 11, margin: "0 0 5px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>👤 {r.userName} · 📍 {r.locationName?.split(",")[0]} · {fmtDate(r.createdAt)}</p>
                  <StatusChip status={r.status} small/>
                </div>
              </div>
            </div>
          ))}
    </div>
  );
}


