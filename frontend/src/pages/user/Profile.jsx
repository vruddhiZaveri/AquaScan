import React, { useEffect, useMemo, useState } from "react";
import { T } from "../../styles/theme.js";
import Avatar from "../../components/common/Avatar.jsx";
import Button from "../../components/common/Button.jsx";
import { GEM_ICONS } from "../../utils/constants.js";
import {
  BADGE_RANGES,
  getBadge,
  getEarnedBadges,
} from "../../utils/helpers.js";
import { reportService } from "../../services/reportService.js";

const API_BASE = "http://localhost:5001/api";

function fmtHistoryTime(value) {
  if (!value) return "Just now";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleString([], {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getCurrentBadgeMeta(points = 0) {
  return (
    BADGE_RANGES.find((badge) => badge.name === getBadge(points)) ||
    BADGE_RANGES[0]
  );
}

function getNextBadgeMeta(points = 0) {
  return BADGE_RANGES.find((badge) => Number(points || 0) < badge.min) || null;
}

export default function Profile({ user, onLogout, onUpdateUser }) {
  const [reports, setReports] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (!user?.id) return;

    let mounted = true;

    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_BASE}/user/${user.id}`);
        const data = await res.json();

        if (mounted && data?.success && data?.user) {
          const totalPoints = data.user.totalPoints || 0;
          const mappedUser = {
            ...user,
            impactPoints: totalPoints,
            totalReportsSubmitted: data.user.totalReportsSubmitted || 0,
            totalResolvedReports: data.user.totalResolvedReports || 0,
            badges: data.user.badges || [],
            badge: data.user.badge || getBadge(totalPoints),
            pointsHistory: data.user.pointsHistory || [],
            streakDays: data.user.streakDays || user?.streakDays || 0,
          };

          setProfile(mappedUser);
          onUpdateUser?.(mappedUser);
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      }
    };

    fetchProfile();
    const interval = setInterval(fetchProfile, 3000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [user?.id, user, onUpdateUser]);

  useEffect(() => {
    if (!user?.id) return;

    let mounted = true;

    const loadReports = async () => {
      try {
        const result = await reportService.getByUser(user.id);
        if (mounted) {
          setReports(
            [...result].sort(
              (a, b) =>
                new Date(b.updatedAt || b.createdAt || 0) -
                new Date(a.updatedAt || a.createdAt || 0),
            ),
          );
        }
      } catch {
        if (mounted) setReports([]);
      }
    };

    loadReports();
    const interval = setInterval(loadReports, 3000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [user?.id]);

  const points = profile?.impactPoints ?? user?.impactPoints ?? 0;
  const earned = useMemo(() => getEarnedBadges(points), [points]);
  const currentBadgeMeta = useMemo(() => getCurrentBadgeMeta(points), [points]);
  const nextBadgeMeta = useMemo(() => getNextBadgeMeta(points), [points]);
  const progressWithinCurrent = useMemo(() => {
    if (!nextBadgeMeta) return 100;
    const start = currentBadgeMeta.min;
    const end = nextBadgeMeta.min;
    const total = Math.max(1, end - start);
    const done = Math.max(0, Number(points || 0) - start);
    return Math.max(0, Math.min(100, Math.round((done / total) * 100)));
  }, [currentBadgeMeta, nextBadgeMeta, points]);

  const allBadges = BADGE_RANGES.map((badge, index) => ({
    ...badge,
    earned: earned.includes(badge.name),
    icon: GEM_ICONS[index],
  }));

  const visibleBadges = showAll ? allBadges : allBadges.slice(0, 6);

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
              {getBadge(points)}
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
          background: T.bg2,
          border: `1px solid ${T.border}`,
          borderRadius: 16,
          padding: 14,
          marginBottom: 18,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            marginBottom: 8,
          }}
        >
          <div>
            <p
              style={{
                color: T.t4,
                fontSize: 10,
                fontWeight: 700,
                margin: "0 0 4px",
                letterSpacing: 0.8,
              }}
            >
              CURRENT BADGE
            </p>
            <p
              style={{ color: T.t1, fontSize: 18, fontWeight: 800, margin: 0 }}
            >
              {currentBadgeMeta.name}
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p
              style={{
                color: T.t4,
                fontSize: 10,
                fontWeight: 700,
                margin: "0 0 4px",
                letterSpacing: 0.8,
              }}
            >
              TOTAL SHELLS
            </p>
            <p
              style={{
                color: T.blueL,
                fontSize: 18,
                fontWeight: 800,
                margin: 0,
              }}
            >
              {Number(points).toLocaleString()}
            </p>
          </div>
        </div>

        <div
          style={{
            background: T.bg1,
            borderRadius: 999,
            height: 8,
            overflow: "hidden",
            marginBottom: 8,
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${progressWithinCurrent}%`,
              background:
                "linear-gradient(90deg, rgba(26,143,193,1) 0%, rgba(77,200,240,1) 100%)",
            }}
          />
        </div>

        <p style={{ color: T.t3, fontSize: 11, margin: 0 }}>
          {nextBadgeMeta
            ? `${Math.max(0, nextBadgeMeta.min - Number(points || 0)).toLocaleString()} Shells needed for ${nextBadgeMeta.name}`
            : "You have unlocked the highest badge tier."}
        </p>
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
          ["Impact Points", Number(points).toLocaleString(), true],
          ["Reports", reports.length, false],
          [
            "Resolved",
            reports.filter(
              (report) =>
                String(report.status || "").toLowerCase() === "resolved",
            ).length,
            false,
          ],
          ["Streak", `${profile?.streakDays || user?.streakDays || 0}d`, false],
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
        {visibleBadges.map((badge) => (
          <div
            key={badge.name}
            style={{
              position: "relative",
              background:
                "linear-gradient(180deg, rgba(10,26,43,0.95) 0%, rgba(7,17,29,0.98) 100%)",
              border: `1px solid ${badge.earned ? "#6dd6ff" : "rgba(95,140,180,0.22)"}`,
              borderRadius: 16,
              padding: "10px 8px 12px",
              textAlign: "center",
              minHeight: 150,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "flex-start",
              boxShadow: badge.earned
                ? "0 0 18px rgba(77,200,240,0.18), inset 0 0 18px rgba(77,200,240,0.05)"
                : "inset 0 0 10px rgba(255,255,255,0.02)",
              opacity: badge.earned ? 1 : 0.58,
            }}
          >
            <div
              style={{
                width: "100%",
                aspectRatio: "1 / 1",
                borderRadius: 20,
                overflow: "hidden",
                marginBottom: 0,
              }}
            >
              <img
                src={badge.icon}
                alt={badge.name}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  filter: badge.earned
                    ? "none"
                    : "grayscale(100%) brightness(0.7)",
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
              {badge.name}
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
              {badge.level}
            </div>

            <div
              style={{
                color: "#a8bfd2",
                fontSize: 10,
                lineHeight: 1.25,
                maxWidth: 84,
              }}
            >
              {badge.rangeLabel}
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
                border: `1px solid ${badge.earned ? "rgba(109,214,255,0.45)" : "rgba(255,255,255,0.12)"}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 10,
                boxShadow: "0 3px 8px rgba(0,0,0,0.35)",
                color: badge.earned ? "#6dd6ff" : "#93a7b9",
              }}
            >
              {badge.earned ? "✓" : "🔒"}
            </div>
          </div>
        ))}
      </div>

      {BADGE_RANGES.length > 6 && (
        <button
          onClick={() => setShowAll((value) => !value)}
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
            : `Show More (${BADGE_RANGES.length - 6} more) ↓`}
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

      {(profile?.pointsHistory || []).length === 0 ? (
        <div
          style={{
            background: T.bg2,
            borderRadius: 12,
            padding: 14,
            border: `1px solid ${T.border}`,
            textAlign: "center",
            marginBottom: 18,
          }}
        >
          <p style={{ color: T.t3, fontSize: 12, margin: 0 }}>
            Submit reports to earn points.
          </p>
        </div>
      ) : (
        <div style={{ marginBottom: 18 }}>
          {[...(profile?.pointsHistory || [])]
            .reverse()
            .slice(0, 10)
            .map((item, index) => (
              <div
                key={`${item.reportId || "points"}-${index}`}
                style={{
                  display: "flex",
                  gap: 12,
                  padding: "10px 0",
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
                    {item.reason || "Points credited"}
                  </p>
                  <p style={{ color: T.t4, fontSize: 10, margin: 0 }}>
                    {fmtHistoryTime(item.timestamp)}
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
                  +{item.points || 0}
                </div>
              </div>
            ))}
        </div>
      )}

      <h3
        style={{
          color: T.t1,
          fontSize: 14,
          fontWeight: 700,
          margin: "0 0 11px",
        }}
      >
        Report History
      </h3>

      {reports.length === 0 ? (
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
            No reports submitted yet.
          </p>
        </div>
      ) : (
        reports.slice(0, 10).map((report) => (
          <div
            key={report.id}
            style={{
              background: T.bg2,
              borderRadius: 14,
              padding: "12px 14px",
              border: `1px solid ${T.border}`,
              marginBottom: 9,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 10,
                marginBottom: 4,
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
              <span
                style={{
                  background: `${T.blue}18`,
                  color: T.blueL,
                  borderRadius: 999,
                  padding: "3px 8px",
                  fontSize: 9,
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                }}
              >
                {String(report.status || "submitted").replaceAll("_", " ")}
              </span>
            </div>

            <p style={{ color: T.t4, fontSize: 11, margin: "0 0 4px" }}>
              {(report.locationName || "Unknown location").split(",")[0]} ·{" "}
              {fmtHistoryTime(report.createdAt)}
            </p>
            <p style={{ color: T.t3, fontSize: 11, margin: 0 }}>
              {report.comment ||
                report.ai?.description ||
                "No additional description added."}
            </p>
          </div>
        ))
      )}
    </div>
  );
}
