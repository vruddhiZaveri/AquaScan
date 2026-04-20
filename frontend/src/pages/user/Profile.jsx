// ─────────────────────────────────────────────────────────────────────────────
// frontend/src/pages/user/Profile.jsx
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState, useEffect } from "react";
import { T } from "../../styles/theme.js";
import Avatar from "../../components/common/Avatar.jsx";
import Button from "../../components/common/Button.jsx";
import { GEM_BADGES, GEM_ICONS } from "../../utils/constants.js";
import { getBadge } from "../../utils/helpers.js";
import { reportService } from "../../services/reportService.js";

const BADGE_META = [
  { name: "Wayfinder", level: "level-1", range: "0 – 500 Shells" },
  { name: "Voyager", level: "level-2", range: "0 – 500 Shells" },
  { name: "Guardian", level: "level-3", range: "1,501 – 4,000 Shells" },
  { name: "Restorer", level: "level-4", range: "4,001 – 9,000 Shells" },
  { name: "Oceankeeper", level: "level-5", range: "9,001 – 18,000 Shells" },
  { name: "Eternal", level: "level-6", range: "18,001 – 40,000+ Shells" },
];

export default function Profile({ user, nav, onLogout }) {
  const [reports, setReports] = useState([]);
  const [showAll, setShowAll] = useState(false);

  let earned = user?.badges || [];

  if (!earned.includes("Wayfinder")) {
    earned = ["Wayfinder", ...earned];
  }

  const allBadges = BADGE_META.map((badge, i) => ({
    ...badge,
    earned: earned.includes(badge.name),
    icon: GEM_ICONS[i],
  }));

  const visible = showAll ? allBadges : allBadges.slice(0, 6);

  useEffect(() => {
    if (!user?.id) return;
    reportService
      .getByUser(user.id)
      .then(setReports)
      .catch(() => setReports([]));
  }, [user?.id]);

  return (
    <div
      style={{
        padding: 16,
        overflowY: "auto",
        height: "100%",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 20,
          gap: 12,
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 14,
            alignItems: "center",
            minWidth: 0,
          }}
        >
          <Avatar name={user?.fullName || user?.name || "User"} size={56} />
          <div style={{ minWidth: 0 }}>
            <h2
              style={{
                color: T.t1,
                fontSize: 18,
                fontWeight: 800,
                margin: "0 0 3px",
                lineHeight: 1.2,
              }}
            >
              {user?.fullName || user?.name || "Citizen User"}
            </h2>

            <p
              style={{
                color: T.blueL,
                fontSize: 12,
                fontWeight: 700,
                margin: "0 0 2px",
              }}
            >
              {getBadge(user?.impactPoints || 0)}
            </p>

            <p
              style={{
                color: T.t4,
                fontSize: 11,
                margin: 0,
                wordBreak: "break-word",
              }}
            >
              {user?.email || "No email"}
            </p>
          </div>
        </div>

        <Button
          onClick={onLogout}
          variant="ghost"
          style={{
            width: "auto",
            padding: "7px 13px",
            fontSize: 11,
            flexShrink: 0,
          }}
        >
          Sign Out
        </Button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 8,
          marginBottom: 20,
        }}
      >
        {[
          ["Impact Points", (user?.impactPoints || 0).toLocaleString(), true],
          ["Reports", user?.totalReportsSubmitted || 0, false],
          [
            "Resolved",
            reports.filter((r) => r.status === "resolved").length,
            false,
          ],
          ["Streak", `${user?.streakDays || 0}d`, false],
        ].map(([label, value, accent]) => (
          <div
            key={label}
            style={{
              background: accent ? `${T.blue}18` : T.bg2,
              border: `1px solid ${accent ? `${T.blue}50` : T.border}`,
              borderRadius: 14,
              padding: "13px 14px",
            }}
          >
            <p
              style={{
                color: T.t4,
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: 0.8,
                margin: "0 0 4px",
              }}
            >
              {label.toUpperCase()}
            </p>
            <p
              style={{
                color: accent ? T.blueL : T.t1,
                fontSize: 22,
                fontWeight: 800,
                margin: 0,
              }}
            >
              {value}
            </p>
          </div>
        ))}
      </div>

      <h3
        style={{
          color: T.t1,
          fontSize: 16,
          fontWeight: 800,
          margin: "0 0 12px",
        }}
      >
        Badges/Achievements
      </h3>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 12,
          marginBottom: 10,
        }}
      >
        {visible.map((b) => (
          <div
            key={b.name}
            style={{
              position: "relative",
              background:
                "linear-gradient(180deg, rgba(10,26,43,0.95) 0%, rgba(7,17,29,0.98) 100%)",
              border: `1px solid ${b.earned ? "#6dd6ff" : "rgba(95,140,180,0.22)"}`,
              borderRadius: 16,
              padding: "10px 8px 12px",
              textAlign: "center",
              minHeight: 150,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "flex-start",
              boxShadow: b.earned
                ? "0 0 18px rgba(77,200,240,0.18), inset 0 0 18px rgba(77,200,240,0.05)"
                : "inset 0 0 10px rgba(255,255,255,0.02)",
              opacity: b.earned ? 1 : 0.58,
            }}
          >
            <div
              style={{
                width: "100%",
                aspectRatio: "1 / 1", // 🔥 makes perfect square
                borderRadius: 20,
                overflow: "hidden",
                marginBottom: 0,
              }}
            >
              <img
                src={b.icon}
                alt={b.name}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  filter: b.earned ? "none" : "grayscale(100%) brightness(0.7)",
                }}
              />
            </div>

            <div
              style={{
                color: "#f2f8ff",
                fontSize: 14,
                fontWeight: 700,
                lineHeight: 1.15,
                marginBottom: 2,
              }}
            >
              {b.name}
            </div>

            <div
              style={{
                color: "#8da8bf",
                fontSize: 10,
                fontWeight: 600,
                marginBottom: 6,
                textTransform: "lowercase",
              }}
            >
              {b.level}
            </div>

            <div
              style={{
                color: "#a8bfd2",
                fontSize: 10,
                lineHeight: 1.25,
                maxWidth: 80,
              }}
            >
              {b.range}
            </div>

            <div
              style={{
                position: "absolute",
                bottom: -8,
                left: "50%",
                transform: "translateX(-50%)",
                width: 18,
                height: 18,
                borderRadius: "50%",
                background: "#0b1624",
                border: `1px solid ${b.earned ? "rgba(109,214,255,0.45)" : "rgba(255,255,255,0.12)"}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 10,
                boxShadow: "0 3px 8px rgba(0,0,0,0.35)",
                color: b.earned ? "#6dd6ff" : "#93a7b9",
              }}
            >
              {b.earned ? "✓" : "🔒"}
            </div>
          </div>
        ))}
      </div>

      {BADGE_META.length > 6 && (
        <button
          onClick={() => setShowAll((v) => !v)}
          style={{
            width: "100%",
            background: T.bg2,
            border: `1px solid ${T.border}`,
            color: T.blueL,
            borderRadius: 11,
            padding: "9px",
            fontSize: 12,
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "Urbanist, sans-serif",
            marginBottom: 16,
          }}
        >
          {showAll
            ? "Show Less ↑"
            : `Show More (${BADGE_META.length - 6} more) ↓`}
        </button>
      )}

      <h3
        style={{
          color: T.t1,
          fontSize: 14,
          fontWeight: 700,
          margin: "18px 0 11px",
        }}
      >
        Points History
      </h3>

      {(user?.pointsHistory || []).length === 0 ? (
        <div
          style={{
            background: T.bg2,
            borderRadius: 12,
            padding: 14,
            border: `1px solid ${T.border}`,
            textAlign: "center",
          }}
        >
          <p style={{ color: T.t3, fontSize: 12, margin: 0 }}>
            Submit reports to earn points!
          </p>
        </div>
      ) : (
        [...(user?.pointsHistory || [])]
          .reverse()
          .slice(0, 10)
          .map((h, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                gap: 12,
                padding: "9px 0",
                borderBottom: `1px solid ${T.border}`,
                alignItems: "center",
              }}
            >
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 9,
                  background: `${T.blue}18`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: T.blueL,
                  fontWeight: 800,
                  fontSize: 12,
                  flexShrink: 0,
                }}
              >
                +
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    color: T.t1,
                    fontSize: 12,
                    fontWeight: 700,
                    margin: "0 0 2px",
                  }}
                >
                  {h.reason}
                </p>
                <p
                  style={{
                    color: T.t4,
                    fontSize: 10,
                    margin: 0,
                  }}
                >
                  {h.timestamp}
                </p>
              </div>

              <div
                style={{
                  color: T.success,
                  fontSize: 12,
                  fontWeight: 800,
                  flexShrink: 0,
                }}
              >
                +{h.points}
              </div>
            </div>
          ))
      )}
    </div>
  );
}
