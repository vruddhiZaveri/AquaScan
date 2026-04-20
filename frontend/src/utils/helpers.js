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

export function calcPts(severity = "medium", count = 1) {
  const sev = String(severity).toLowerCase();
  const base = sev === "high" ? 60 : sev === "medium" ? 35 : 20;

  return base + Math.max(0, Number(count || 0)) * 3;
}

export function getBadge(points = 0) {
  if (points >= 1500) return "Diamond Guardian";
  if (points >= 1000) return "Platinum Guardian";
  if (points >= 700) return "Gold Guardian";
  if (points >= 400) return "Silver Guardian";
  if (points >= 200) return "Bronze Guardian";
  return "Quartz Scout";
}
