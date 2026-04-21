export function inits(name = "") {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() || "")
      .join("") || "?"
  );
}

export function now() {
  return new Date().toISOString();
}

export function calcPts(severity = "medium", urgencyScore = 0) {
  const sev = String(severity).toLowerCase();
  const base = sev === "high" ? 60 : sev === "medium" ? 35 : 20;
  return base + Math.max(0, Number(urgencyScore || 0)) * 3;
}

export const BADGE_RANGES = [
  {
    name: "Wayfinder",
    min: 0,
    max: 1499,
    level: "level-1",
    rangeLabel: "0 – 1,499 Shells",
  },
  {
    name: "Voyager",
    min: 1500,
    max: 4999,
    level: "level-2",
    rangeLabel: "1,500 – 4,999 Shells",
  },
  {
    name: "Guardian",
    min: 5000,
    max: 11999,
    level: "level-3",
    rangeLabel: "5,000 – 11,999 Shells",
  },
  {
    name: "Restorer",
    min: 12000,
    max: 24999,
    level: "level-4",
    rangeLabel: "12,000 – 24,999 Shells",
  },
  {
    name: "Oceankeeper",
    min: 25000,
    max: 49999,
    level: "level-5",
    rangeLabel: "25,000 – 49,999 Shells",
  },
  {
    name: "Eternal",
    min: 50000,
    max: Infinity,
    level: "level-6",
    rangeLabel: "50,000+ Shells",
  },
];

export function getBadge(points = 0) {
  const p = Number(points || 0);
  return (
    [...BADGE_RANGES].reverse().find((badge) => p >= badge.min)?.name ||
    "Wayfinder"
  );
}

export function getEarnedBadges(points = 0) {
  const p = Number(points || 0);
  return BADGE_RANGES.filter((badge) => p >= badge.min).map(
    (badge) => badge.name,
  );
}
