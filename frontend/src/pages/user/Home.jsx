// ─────────────────────────────────────────────────────────────────────────────
// frontend/src/pages/user/Home.jsx
// ─────────────────────────────────────────────────────────────────────────────
import React from "react";
import { T } from "../../styles/theme.js";
import { Chip } from "../../components/common/Chip.jsx";
import Avatar from "../../components/common/Avatar.jsx";
import Button from "../../components/common/Button.jsx";
import { getBadge } from "../../utils/helpers.js";
import { fmtDate } from "../../utils/formatters.js";
import { useReports } from "../../hooks/useReports.js";

export default function Home({ user, nav }) {
  const { reports } = useReports(user.id);
  const pts = user.impactPoints || 0;
  const resolved = reports.filter((r) => r.status === "resolved").length;
  const streakDays = (() => {
    const days = [...new Set(reports.map((r) => String((r.createdAt || '').slice(0, 10))).filter(Boolean))].sort().reverse();
    if (!days.length) return user.streakDays || 0;
    let streak = 0;
    const cursor = new Date();
    cursor.setHours(0, 0, 0, 0);
    for (let i = 0; i < 365; i++) {
      const key = cursor.toISOString().slice(0, 10);
      if (days.includes(key)) {
        streak += 1;
        cursor.setDate(cursor.getDate() - 1);
      } else {
        break;
      }
    }
    return Math.max(streak, user.streakDays || 0);
  })();

  return (
    <div style={{ padding: 16, overflowY: "auto", height: "100%" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 18,
        }}
      >
        <div>
          <p style={{ color: T.t3, fontSize: 12, margin: 0 }}>Welcome back,</p>
          <h2
            style={{
              color: T.t1,
              fontSize: 21,
              fontWeight: 800,
              margin: 0,
              letterSpacing: -0.3,
            }}
          >
            {user.fullName} 👋
          </h2>
        </div>
        <div onClick={() => nav("profile")} style={{ cursor: "pointer" }}>
          <Avatar name={user.fullName} size={46} />
        </div>
      </div>

      {/* Score card */}
      <div
        style={{
          background: "linear-gradient(140deg,#0a3d5c,#061828)",
          borderRadius: 20,
          padding: 20,
          marginBottom: 12,
          border: `1px solid ${T.blue}28`,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: -24,
            top: -24,
            width: 110,
            height: 110,
            borderRadius: "50%",
            background: `${T.blue}0e`,
          }}
        />
        <p
          style={{
            color: T.blueL,
            fontSize: 10,
            fontWeight: 700,
            margin: "0 0 3px",
            letterSpacing: 1.3,
            opacity: 0.8,
          }}
        >
          IMPACT SCORE
        </p>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 7,
            marginBottom: 10,
          }}
        >
          <span
            style={{
              color: "#fff",
              fontSize: 42,
              fontWeight: 800,
              letterSpacing: -1,
            }}
          >
            {pts.toLocaleString()}
          </span>
          <span style={{ color: T.blueL, fontSize: 13 }}>pts</span>
        </div>
        <Chip label={getBadge(pts)} color={T.blueL} />
      </div>

      {/* Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 8,
          marginBottom: 18,
        }}
      >
        {[
          ["Reports", reports.length, () => nav("reports")],
          ["Resolved", resolved, () => nav("resolved")],
          ["Streak", `${streakDays}d`, null],
        ].map(([l, v, fn]) => (
          <div
            key={l}
            onClick={fn || undefined}
            style={{
              background: T.bg2,
              borderRadius: 14,
              padding: "13px 8px",
              border: `1px solid ${T.border}`,
              textAlign: "center",
              cursor: fn ? "pointer" : "default",
            }}
          >
            <p
              style={{
                color: T.t3,
                fontSize: 9,
                fontWeight: 700,
                margin: "0 0 4px",
                letterSpacing: 0.8,
              }}
            >
              {l.toUpperCase()}
            </p>
            <p
              style={{ color: T.t1, fontSize: 22, fontWeight: 800, margin: 0 }}
            >
              {v}
            </p>
          </div>
        ))}
      </div>

      <Button
        onClick={() => nav("scan")}
        style={{ marginBottom: 22, fontSize: 15, padding: "14px" }}
      >
        <span style={{ fontSize: 20 }}>📷</span> Scan & Report Waste
      </Button>

      {/* Recent reports */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 11,
        }}
      >
        <h3 style={{ color: T.t1, fontSize: 14, fontWeight: 700, margin: 0 }}>
          Recent Reports
        </h3>
        {reports.length > 0 && (
          <button
            onClick={() => nav("reports")}
            style={{
              background: "none",
              border: "none",
              color: T.blueL,
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "Urbanist, sans-serif",
            }}
          >
            See all →
          </button>
        )}
      </div>

      {reports.length === 0 ? (
        <div
          style={{
            background: T.bg2,
            borderRadius: 14,
            padding: 18,
            border: `1px solid ${T.border}`,
            textAlign: "center",
          }}
        >
          <p style={{ color: T.t3, fontSize: 13, margin: 0 }}>
            No reports yet — start scanning! 🌊
          </p>
        </div>
      ) : (
        [...reports]
          .reverse()
          .slice(0, 3)
          .map((r) => (
            <div
              key={r.id}
              onClick={() => nav("reportDetail", r)}
              style={{
                background: T.bg2,
                borderRadius: 14,
                padding: "12px 14px",
                border: `1px solid ${T.border}`,
                marginBottom: 8,
                display: "flex",
                alignItems: "center",
                gap: 12,
                cursor: "pointer",
              }}
            >
              {r.imageData ? (
                <img
                  src={r.imageData}
                  alt="Report"
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 9,
                    objectFit: "cover",
                    border: `1px solid ${T.border}`,
                    flexShrink: 0,
                    background: T.bg3,
                  }}
                />
              ) : (
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 9,
                    background: T.blueD,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 18,
                    flexShrink: 0,
                  }}
                >
                  🌊
                </div>
              )}
              
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    color: T.t1,
                    fontSize: 13,
                    fontWeight: 700,
                    margin: "0 0 3px",
                  }}
                >
                  {r.ai?.pollutionType || "Report"}
                </p>
                <p
                  style={{
                    color: T.t3,
                    fontSize: 11,
                    margin: 0,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  📍 {r.locationName}
                </p>
              </div>
              <span style={{ color: T.blueL, fontSize: 9, fontWeight: 700 }}>
                CHAT →
              </span>
            </div>
          ))
      )}
    </div>
  );
}
