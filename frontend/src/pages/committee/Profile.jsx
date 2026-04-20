// ─────────────────────────────────────────────────────────────────────────────
// frontend/src/pages/committee/Profile.jsx
// ─────────────────────────────────────────────────────────────────────────────
import React from "react";
import { T } from "../../styles/theme.js";
import Avatar from "../../components/common/Avatar.jsx";
import Button from "../../components/common/Button.jsx";
import { Chip } from "../../components/common/Chip.jsx";
import { fmtDate } from "../../utils/formatters.js";

export default function CommitteeProfile({ user, onLogout }) {
  return (
    <div style={{ padding: 16, overflowY: "auto", height: "100%" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 20,
        }}
      >
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          <Avatar name={user.committeeName} size={56} bg="#1a3a5c" />
          <div>
            <h2
              style={{
                color: T.t1,
                fontSize: 17,
                fontWeight: 800,
                margin: "0 0 4px",
              }}
            >
              {user.committeeName}
            </h2>
            <Chip label="✓ Verified" color={T.success} bg={`${T.success}18`} />
            <p style={{ color: T.t4, fontSize: 11, margin: "6px 0 0" }}>
              {user.email}
            </p>
          </div>
        </div>
        <Button
          onClick={onLogout}
          variant="ghost"
          style={{ width: "auto", padding: "7px 13px", fontSize: 11 }}
        >
          Sign Out
        </Button>
      </div>
      {[
        ["Owner / Officer", user.ownerName || "—"],
        ["Organisation", user.organizationName || "—"],
        ["Phone", user.phone || "—"],
        ["Jurisdiction", user.jurisdictionArea || "Mumbai"],
        ["Status", "Verified ✓"],
        ["Reports Received", user.totalReportsReceived || 0],
        ["Joined", fmtDate(user.joinedAt || new Date().toISOString())],
      ].map(([l, v]) => (
        <div
          key={l}
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "11px 0",
            borderBottom: `1px solid ${T.border}`,
          }}
        >
          <span style={{ color: T.t3, fontSize: 12 }}>{l}</span>
          <span style={{ color: T.t1, fontSize: 12, fontWeight: 600 }}>
            {v}
          </span>
        </div>
      ))}
    </div>
  );
}
