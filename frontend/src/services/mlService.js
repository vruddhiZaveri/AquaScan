function toTitleCase(value = "") {
  return String(value)
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function parsePercent(value, fallback = 0) {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = parseFloat(value.replace("%", ""));
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
}

function parseUrgency(value, fallback = 0) {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = parseInt(value.split("/")[0], 10);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
}

function normalizeAiResponse(raw = {}, isLive = false) {
  const pollutionType =
    raw.pollutionType || raw.pollution_type || raw.type || "Analysis Pending";

  const severity = String(raw.severity || "medium").toLowerCase();
  const urgencyScore = parseUrgency(raw.urgencyScore ?? raw.urgency, 5);

  const status =
    raw.status || (raw.needsBetterImage ? "Review Needed" : "Live");

  const actionNeeded =
    raw.actionNeeded ||
    (severity === "high"
      ? "Immediate"
      : severity === "medium"
        ? "Minor Cleanup"
        : "Monitor");

  const reportType =
    raw.reportType ||
    (severity === "high"
      ? "Heavy Pollution"
      : severity === "medium"
        ? "Moderate Pollution"
        : "Floating Waste");

  const imageQuality =
    raw.imageQuality || (raw.needsBetterImage ? "Unclear" : "Clear");

  const detectedItems =
    raw.detectedItems || raw.detected_classes || raw.detectedClasses || [];

  const description =
    raw.description || "AI analysis result returned from backend.";

  const recommendations =
    raw.recommendations ||
    raw.recommendation ||
    "Please review the report details.";

  let confidence = raw.confidence;
  if (typeof confidence === "string") {
    confidence = parsePercent(confidence, 70) / 100;
  } else if (typeof confidence === "number") {
    confidence = confidence > 1 ? confidence / 100 : confidence;
  } else {
    confidence = 0.7;
  }

  confidence = Math.max(0, Math.min(1, confidence));

  return {
    pollutionType,
    severity,
    urgencyScore,
    urgency: `${urgencyScore}/10`,
    status,
    actionNeeded,
    reportType,
    imageQuality,
    confidence,
    detectedItems: Array.isArray(detectedItems) ? detectedItems : [],
    description,
    recommendations,
    live: Boolean(raw.live ?? isLive),
    modelUsed: raw.modelUsed || raw.model_used || "Backend AI",

    pollution_type: pollutionType,
    severity_label: severity.toUpperCase(),
    recommendation: recommendations,
    confidence_percent: `${Math.round(confidence * 100)}.00%`,
    severity_display: toTitleCase(severity),
  };
}

async function analyzeImage() {
  throw new Error(
    "Frontend image analysis is disabled. Use backend report creation instead.",
  );
}

export { normalizeAiResponse, analyzeImage };
