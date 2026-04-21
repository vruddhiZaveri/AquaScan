import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import path from "path";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

const PORT = process.env.PORT || 5001;
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://127.0.0.1:8000";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const POINTS_PER_REPORT = 35;

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 },
});

const DB_FILE = path.join(process.cwd(), "aquascan-db.json");

function getDefaultDb() {
  return {
    reports: [],
    users: [],
  };
}

function ensureDbShape(db = {}) {
  return {
    reports: Array.isArray(db.reports) ? db.reports : [],
    users: Array.isArray(db.users) ? db.users : [],
  };
}

function readDb() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      return getDefaultDb();
    }

    const raw = fs.readFileSync(DB_FILE, "utf-8");
    const parsed = JSON.parse(raw || "{}");
    return ensureDbShape(parsed);
  } catch (error) {
    console.error("READ DB ERROR:", error?.message || error);
    return getDefaultDb();
  }
}

function writeDb(data) {
  fs.writeFileSync(
    DB_FILE,
    JSON.stringify(ensureDbShape(data), null, 2),
    "utf-8",
  );
}

function safeJsonParse(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function toConfidenceNumber(value) {
  if (typeof value === "number") {
    return value > 1 ? Math.max(0, Math.min(1, value / 100)) : value;
  }

  if (typeof value !== "string") return 0.2;

  const v = value.toLowerCase().trim();

  if (v.includes("%")) {
    const n = parseFloat(v.replace("%", ""));
    if (!Number.isNaN(n)) return Math.max(0, Math.min(1, n / 100));
  }

  if (v.includes("high")) return 0.9;
  if (v.includes("medium")) return 0.6;
  if (v.includes("low")) return 0.2;

  const n = Number(v);
  if (!Number.isNaN(n)) return Math.max(0, Math.min(1, n));

  return 0.2;
}

function getUrgencyScore(data = {}) {
  if (typeof data.urgencyScore === "number") return data.urgencyScore;

  if (typeof data.urgency === "string") {
    const parsed = parseInt(String(data.urgency).split("/")[0], 10);
    if (!Number.isNaN(parsed)) return parsed;
  }

  return 5;
}

function getBadgeFromPoints(points = 0) {
  if (points >= 50000) return "Eternal";
  if (points >= 25000) return "Oceankeeper";
  if (points >= 12000) return "Restorer";
  if (points >= 5000) return "Guardian";
  if (points >= 1500) return "Voyager";
  return "Wayfinder";
}

function normalizeMlForFrontend(data = {}, live = true) {
  const severityUpper = String(data.severity || "LOW").toUpperCase();
  const severity = ["LOW", "MEDIUM", "HIGH"].includes(severityUpper)
    ? severityUpper.toLowerCase()
    : "unknown";

  const urgencyScore = getUrgencyScore(data);
  const confidence = toConfidenceNumber(data.confidence);
  const reviewRequired = Boolean(data.needsBetterImage || data.reviewRequired);

  const actionNeeded =
    data.actionNeeded ||
    (reviewRequired
      ? "Review Needed"
      : severity === "high"
        ? "Immediate Cleanup"
        : severity === "medium"
          ? "Schedule Cleanup"
          : "Monitor");

  const reportType =
    data.reportType ||
    (reviewRequired
      ? "Manual Review"
      : severity === "high"
        ? "Heavy Pollution"
        : severity === "medium"
          ? "Moderate Pollution"
          : "Floating Waste");

  return {
    pollutionType: data.pollutionType || "Analysis Unavailable",
    severity,
    urgencyScore,
    urgency: data.urgency || `${urgencyScore}/10`,
    status: data.status || (reviewRequired ? "Review Needed" : "Live"),
    source: data.rawSource || "custom-yolo-model",
    imageQuality: reviewRequired ? "Unclear" : "Clear",
    actionNeeded,
    reportType,
    confidence,
    density: data.density || "",
    coverage: data.coverage || "",
    detectedItems: Array.isArray(data.detectedItems) ? data.detectedItems : [],
    description: data.description || "",
    recommendations: data.recommendation || data.recommendations || "",
    reviewRequired,
    live,
    modelUsed: data.rawSource || "custom-yolo-model",
    rawSource: data.rawSource || "custom-yolo-model",
    meta: data.meta || {},
    localMeta: data.localMeta || null,
  };
}

function fallbackAi(reason = "Analysis failed.") {
  return normalizeMlForFrontend(
    {
      pollutionType: "Analysis Unavailable",
      severity: "UNKNOWN",
      urgency: "5/10",
      confidence: 0.2,
      description: reason,
      recommendation:
        "Please retry with a clearer image or review the image manually.",
      needsBetterImage: true,
      reviewRequired: true,
      rawSource: "backend-fallback",
      actionNeeded: "Review Needed",
      reportType: "Manual Review",
      status: "Review Needed",
    },
    false,
  );
}

function shouldUseFallback(localResult) {
  if (!localResult) return true;
  if (localResult.live === false) return true;
  if (localResult.reviewRequired) return true;

  const rawSource = localResult.rawSource || localResult.source || "";
  const severity = String(localResult.severity || "").toLowerCase();
  const confidence = Number(localResult.confidence || 0);

  if (
    [
      "ml-service-unavailable",
      "image-unclear",
      "aquatic-filter",
      "low-water-unclear",
      "low-water-after-filter",
      "weak-detection-unclear",
      "yolo-weak-clean",
      "backend-fallback",
    ].includes(rawSource)
  ) {
    return true;
  }

  if (severity === "unknown") return true;
  if (confidence < 0.6) return true;

  return false;
}

function shouldUseApiForDescription(localResult) {
  if (!localResult) return false;
  const desc = String(localResult.description || "").trim();
  if (!desc) return true;
  if (desc.length < 30) return true;
  return false;
}

function normalizeFallbackResult(parsed) {
  return {
    pollutionType: parsed.pollutionType || "Manual Review",
    severity: ["LOW", "MEDIUM", "HIGH", "UNKNOWN"].includes(
      String(parsed.severity || "").toUpperCase(),
    )
      ? String(parsed.severity || "").toUpperCase()
      : "UNKNOWN",
    urgency: parsed.urgency || "N/A",
    confidence: Math.max(0, Math.min(1, Number(parsed.confidence ?? 0.55))),
    status: parsed.status || "Review Needed",
    actionNeeded: parsed.actionNeeded || "Review Needed",
    reportType: parsed.reportType || "Manual Review",
    description:
      parsed.description || "Fallback vision model analyzed the image.",
    recommendation:
      parsed.recommendation || "Please review this image manually.",
    needsBetterImage: Boolean(parsed.needsBetterImage),
    reviewRequired: Boolean(parsed.reviewRequired),
    rawSource: "api-fallback",
  };
}

function extractGeminiText(data) {
  return (
    data?.candidates?.[0]?.content?.parts?.find(
      (p) => typeof p.text === "string",
    )?.text || ""
  );
}

function stripCodeFences(text) {
  return String(text || "")
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

async function runVisionFallback(fileBuffer, mimeType = "image/jpeg") {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is missing.");
  }

  const base64Image = fileBuffer.toString("base64");

  const prompt = `
Analyze this uploaded image for an aquatic pollution reporting system.

Tasks:
1. Determine if this is a valid aquatic scene (lake, river, pond, shoreline, canal, visible water surface).
2. Determine whether floating waste or visible aquatic pollution is present.
3. If the image is not aquatic, say so clearly.
4. If the image is blurry or unclear, say so clearly.
5. Give a clean, user-friendly textual description.

Return ONLY valid JSON in this exact shape:
{
  "pollutionType": "string",
  "severity": "LOW | MEDIUM | HIGH | UNKNOWN",
  "urgency": "string",
  "confidence": number,
  "status": "Live | Review Needed",
  "actionNeeded": "Monitor | Minor Cleanup | Schedule Cleanup | Immediate Cleanup | Re-upload | Review Needed",
  "reportType": "Clear Water | Polluted Water | Manual Review | Non-Aquatic Scene",
  "description": "string",
  "recommendation": "string",
  "needsBetterImage": boolean,
  "reviewRequired": boolean
}

Rules:
- Be conservative.
- If no visible water body is present, classify as non-aquatic.
- If image is too blurry, mark as reviewRequired or needsBetterImage.
- If water appears clean and no visible floating waste is present, use LOW severity and Monitor.
- If visible floating waste is clearly present, classify based on visible spread and density.
`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

  const response = await axios.post(
    url,
    {
      contents: [
        {
          parts: [
            {
              inline_data: {
                mime_type: mimeType,
                data: base64Image,
              },
            },
            {
              text: prompt,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: "application/json",
      },
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 45000,
    },
  );

  const rawText = extractGeminiText(response.data);
  const cleaned = stripCodeFences(rawText);
  const parsed = safeJsonParse(cleaned);

  if (!parsed) {
    throw new Error("Gemini returned invalid JSON.");
  }

  return normalizeFallbackResult(parsed);
}

async function generateDescriptionFromApi(
  fileBuffer,
  mimeType = "image/jpeg",
  localResult = null,
) {
  if (!GEMINI_API_KEY) return null;

  const base64Image = fileBuffer.toString("base64");

  const localSummary = localResult
    ? `
Current local model result:
pollutionType: ${localResult.pollutionType || ""}
severity: ${localResult.severity || ""}
urgency: ${localResult.urgency || ""}
reportType: ${localResult.reportType || ""}
actionNeeded: ${localResult.actionNeeded || ""}
`
    : "";

  const prompt = `
You are helping generate a clean textual description for an aquatic pollution reporting app.

${localSummary}

Look at the image and return ONLY valid JSON:
{
  "description": "string",
  "recommendation": "string"
}

Write in a user-friendly and professional tone.
Do not mention AI model names.
`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

  const response = await axios.post(
    url,
    {
      contents: [
        {
          parts: [
            {
              inline_data: {
                mime_type: mimeType,
                data: base64Image,
              },
            },
            {
              text: prompt,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: "application/json",
      },
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 30000,
    },
  );

  const rawText = extractGeminiText(response.data);
  const cleaned = stripCodeFences(rawText);
  const parsed = safeJsonParse(cleaned);

  if (!parsed) {
    throw new Error("Gemini description response was invalid JSON.");
  }

  return parsed;
}

function mergeMlAndFallback(localResult, fallbackResult) {
  if (!fallbackResult) return localResult;

  if (
    localResult &&
    !localResult.reviewRequired &&
    Number(localResult.confidence || 0) >= 0.6 &&
    String(localResult.severity || "").toLowerCase() !== "unknown"
  ) {
    return {
      ...localResult,
      rawSource: "hybrid-local-primary",
      source: "hybrid-local-primary",
      modelUsed: "hybrid-local-primary",
    };
  }

  return {
    ...localResult,
    ...fallbackResult,
    rawSource: "api-fallback",
    source: "api-fallback",
    modelUsed: "api-fallback",
    localMeta: {
      localRawSource: localResult?.rawSource || localResult?.source || null,
      localConfidence: localResult?.confidence || null,
      localSeverity: localResult?.severity || null,
    },
  };
}

function getUserReports(db, userId) {
  const uid = String(userId || "");
  if (!uid) return [];
  return db.reports.filter((r) => String(r.userId || "") === uid);
}

function rebuildUserFromReports(db, userId, fallbackMeta = {}) {
  const safeDb = ensureDbShape(db);
  const uid = String(userId || "");
  if (!uid) return null;

  const userReports = getUserReports(safeDb, uid).sort(
    (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0),
  );

  const existingUser =
    safeDb.users.find((u) => String(u.userId || "") === uid) || {};

  const totalReportsSubmitted = userReports.length;
  const totalResolvedReports = userReports.filter(
    (r) => String(r.status || "").toLowerCase() === "resolved",
  ).length;

  const totalPoints = totalReportsSubmitted * POINTS_PER_REPORT;
  const badge = getBadgeFromPoints(totalPoints);

  const pointsHistory = userReports.map((report) => ({
    reason: "Pollution Report Filed",
    points: POINTS_PER_REPORT,
    timestamp: report.createdAt || new Date().toISOString(),
    reportId: report.id,
  }));

  const badges = [];
  if (totalPoints >= 0) badges.push("Wayfinder");
  if (totalPoints >= 1500) badges.push("Voyager");
  if (totalPoints >= 5000) badges.push("Guardian");
  if (totalPoints >= 12000) badges.push("Restorer");
  if (totalPoints >= 25000) badges.push("Oceankeeper");
  if (totalPoints >= 50000) badges.push("Eternal");

  return {
    userId: uid,
    userName:
      existingUser.userName ||
      fallbackMeta.userName ||
      userReports[userReports.length - 1]?.userName ||
      "Citizen User",
    userEmail:
      existingUser.userEmail ||
      fallbackMeta.userEmail ||
      userReports[userReports.length - 1]?.userEmail ||
      "",
    totalPoints,
    totalReportsSubmitted,
    totalResolvedReports,
    badge,
    badges,
    lastReportDate:
      userReports[userReports.length - 1]?.createdAt ||
      existingUser.lastReportDate ||
      null,
    pointsHistory,
  };
}

function upsertUserStats(db, report) {
  const safeDb = ensureDbShape(db);
  const uid = String(report.userId || "");
  if (!uid) return safeDb;

  const rebuilt = rebuildUserFromReports(safeDb, uid, {
    userName: report.userName,
    userEmail: report.userEmail,
  });

  if (!rebuilt) return safeDb;

  const idx = safeDb.users.findIndex((u) => String(u.userId || "") === uid);
  if (idx >= 0) {
    safeDb.users[idx] = rebuilt;
  } else {
    safeDb.users.push(rebuilt);
  }

  return safeDb;
}

function maybeIncrementResolvedCount(db, report) {
  return upsertUserStats(db, report);
}

async function analyzeWithML(file) {
  try {
    if (!file?.buffer) {
      return fallbackAi("No image file received by the backend.");
    }

    const form = new FormData();
    form.append("file", file.buffer, {
      filename: file.originalname || "upload.jpg",
      contentType: file.mimetype || "image/jpeg",
    });

    const response = await axios.post(`${ML_SERVICE_URL}/predict`, form, {
      headers: {
        ...form.getHeaders(),
      },
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
      timeout: 30000,
    });

    return normalizeMlForFrontend(
      {
        ...(response?.data || {}),
        rawSource: response?.data?.rawSource || "custom-yolo-model",
      },
      true,
    );
  } catch (error) {
    console.error("===== LOCAL ML ERROR =====");
    console.error("MESSAGE:", error?.message || error);

    if (error?.response) {
      console.error("STATUS:", error.response.status);
      console.error("DATA:", error.response.data);
    }

    const detail =
      error?.response?.data?.detail ||
      error?.response?.data?.message ||
      error?.message ||
      "Unknown error";

    return fallbackAi(`Local ML timed out or failed: ${detail}`);
  }
}

async function analyzeImage(file) {
  let localResult = null;
  let finalResult = null;
  let fallbackResult = null;

  try {
    localResult = await analyzeWithML(file);
  } catch (mlError) {
    console.error("===== LOCAL ML WRAPPER ERROR =====");
    console.error(mlError?.message || mlError);

    localResult = fallbackAi(
      `Local ML service failed while analyzing this image: ${
        mlError?.message || "Unknown error"
      }`,
    );
  }

  finalResult = localResult;

  if (shouldUseFallback(localResult)) {
    try {
      fallbackResult = await runVisionFallback(
        file.buffer,
        file.mimetype || "image/jpeg",
      );

      finalResult = normalizeMlForFrontend(
        mergeMlAndFallback(localResult, fallbackResult),
        true,
      );
    } catch (fallbackError) {
      console.error("===== FALLBACK API ERROR =====");
      console.error(fallbackError?.message || fallbackError);

      finalResult = {
        ...localResult,
        source: localResult?.source || "local-only-after-fallback-fail",
        rawSource: localResult?.rawSource || "local-only-after-fallback-fail",
        modelUsed: localResult?.modelUsed || "local-only-after-fallback-fail",
      };
    }
  } else if (shouldUseApiForDescription(localResult)) {
    try {
      const textEnhancement = await generateDescriptionFromApi(
        file.buffer,
        file.mimetype || "image/jpeg",
        localResult,
      );

      finalResult = {
        ...localResult,
        description: textEnhancement?.description || localResult.description,
        recommendations:
          textEnhancement?.recommendation || localResult.recommendations,
        source: "hybrid-local-primary",
        rawSource: "hybrid-local-primary",
        modelUsed: "hybrid-local-primary",
      };
    } catch (descError) {
      console.error("===== DESCRIPTION API ERROR =====");
      console.error(descError?.message || descError);
    }
  }

  return {
    ...finalResult,
    analysisSource:
      finalResult?.rawSource === "api-fallback"
        ? "hybrid-fallback"
        : "local-ml",
    live: true,
  };
}

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "AquaScan backend running",
    mlService: ML_SERVICE_URL,
    geminiFallbackEnabled: Boolean(GEMINI_API_KEY),
    geminiModel: GEMINI_MODEL,
  });
});

app.get("/api/health", async (req, res) => {
  let mlHealthy = false;
  let mlStatus = "unreachable";

  try {
    const mlHealth = await axios.get(`${ML_SERVICE_URL}/health`, {
      timeout: 5000,
    });
    mlHealthy = Boolean(mlHealth?.data?.success);
    mlStatus = mlHealth?.data?.message || "healthy";
  } catch (error) {
    mlStatus = error?.message || "unreachable";
  }

  res.json({
    success: true,
    timestamp: new Date().toISOString(),
    ml: {
      healthy: mlHealthy,
      status: mlStatus,
      url: ML_SERVICE_URL,
    },
    gemini: {
      enabled: Boolean(GEMINI_API_KEY),
      model: GEMINI_MODEL,
    },
  });
});

app.post("/api/analyze", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file uploaded.",
      });
    }

    const ai = await analyzeImage(req.file);

    return res.json({
      success: true,
      ai,
    });
  } catch (error) {
    console.error("ANALYZE ROUTE ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to analyze image.",
    });
  }
});

app.post("/api/reports", upload.single("file"), async (req, res) => {
  try {
    const isMultipart = Boolean(req.file);
    const body = req.body || {};

    let selectedCommittees = [];
    try {
      const rawCommittees = body.selectedCommittees || "[]";
      selectedCommittees = Array.isArray(rawCommittees)
        ? rawCommittees
        : JSON.parse(rawCommittees);
    } catch {
      selectedCommittees = [];
    }

    let ai = null;

    if (isMultipart) {
      ai = await analyzeImage(req.file);
    } else if (body.ai) {
      ai = typeof body.ai === "string" ? safeJsonParse(body.ai) : body.ai;
    }

    const imageData = req.file
      ? `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`
      : body.imageData || body.imageUrl || "";

    const createdAt = new Date().toISOString();

    const report = {
      id: Date.now().toString(),
      userId: body.userId || "",
      userName: body.userName || "Anonymous User",
      userEmail: body.userEmail || "",
      locationName: body.locationName || "Unknown Location",
      comment: body.comment || "",
      imageUrl: body.imageUrl || "",
      imageData,
      status: body.status || "submitted",
      publicRemark: body.publicRemark || "",
      createdAt,
      updatedAt: createdAt,
      pointsAwarded: POINTS_PER_REPORT,
      ai: ai || null,
      selectedCommittees,
      statusHistory: [
        {
          status: body.status || "submitted",
          by: body.userName || "System",
          remark: "Report created",
          timestamp: createdAt,
        },
      ],
    };

    const db = readDb();
    db.reports.push(report);
    upsertUserStats(db, report);
    writeDb(db);

    return res.json({
      success: true,
      report,
    });
  } catch (error) {
    console.error("CREATE REPORT ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create report.",
    });
  }
});

app.get("/api/reports", (req, res) => {
  try {
    const db = readDb();
    const { userId, committeeId, status } = req.query;

    let reports = [...db.reports];

    if (userId) {
      reports = reports.filter((r) => String(r.userId) === String(userId));
    }

    if (committeeId) {
      reports = reports.filter((r) =>
        Array.isArray(r.selectedCommittees)
          ? r.selectedCommittees.some(
              (c) =>
                String(c?.id || "").toLowerCase() ===
                  String(committeeId).toLowerCase() ||
                String(c?.committeeName || "").toLowerCase() ===
                  String(committeeId).toLowerCase(),
            )
          : false,
      );
    }

    if (status) {
      reports = reports.filter(
        (r) =>
          String(r.status || "").toLowerCase() === String(status).toLowerCase(),
      );
    }

    reports.sort(
      (a, b) =>
        new Date(b.updatedAt || b.createdAt || 0) -
        new Date(a.updatedAt || a.createdAt || 0),
    );

    return res.json({
      success: true,
      reports,
      count: reports.length,
      serverTime: new Date().toISOString(),
    });
  } catch (error) {
    console.error("GET REPORTS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch reports.",
    });
  }
});

app.get("/api/reports/:id", (req, res) => {
  try {
    const db = readDb();
    const report = db.reports.find((r) => r.id === req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found.",
      });
    }

    return res.json({
      success: true,
      report,
    });
  } catch (error) {
    console.error("GET REPORT BY ID ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch report.",
    });
  }
});

app.patch("/api/reports/:id", (req, res) => {
  try {
    const db = readDb();
    const idx = db.reports.findIndex((r) => r.id === req.params.id);

    if (idx === -1) {
      return res.status(404).json({
        success: false,
        message: "Report not found.",
      });
    }

    const current = db.reports[idx];

    const updated = {
      ...current,
      ...req.body,
      updatedAt: new Date().toISOString(),
    };

    db.reports[idx] = updated;

    if (updated.userId) {
      upsertUserStats(db, updated);
    }

    writeDb(db);

    return res.json({
      success: true,
      report: updated,
    });
  } catch (error) {
    console.error("PATCH REPORT ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update report.",
    });
  }
});

app.patch("/api/reports/:id/status", (req, res) => {
  try {
    const db = readDb();
    const idx = db.reports.findIndex((r) => r.id === req.params.id);

    if (idx === -1) {
      return res.status(404).json({
        success: false,
        message: "Report not found.",
      });
    }

    const current = db.reports[idx];
    const nextStatus = req.body.status || current.status;
    const resolvedNow =
      String(current.status || "").toLowerCase() !== "resolved" &&
      String(nextStatus || "").toLowerCase() === "resolved";

    const updated = {
      ...current,
      status: nextStatus,
      publicRemark: req.body.remark || current.publicRemark || "",
      updatedAt: new Date().toISOString(),
      resolvedAt: resolvedNow
        ? new Date().toISOString()
        : current.resolvedAt || null,
      statusHistory: [
        ...(current.statusHistory || []),
        {
          status: nextStatus,
          by: req.body.by || "Committee",
          remark: req.body.remark || "",
          timestamp: new Date().toISOString(),
        },
      ],
    };

    db.reports[idx] = updated;

    if (updated.userId) {
      maybeIncrementResolvedCount(db, updated);
    }

    writeDb(db);

    return res.json({
      success: true,
      report: updated,
    });
  } catch (error) {
    console.error("PATCH REPORT STATUS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update report status.",
    });
  }
});

app.get("/api/user/:userId", (req, res) => {
  try {
    const db = readDb();
    const rebuilt = rebuildUserFromReports(db, req.params.userId);

    if (!rebuilt) {
      return res.json({
        success: true,
        user: {
          userId: req.params.userId,
          totalPoints: 0,
          totalReportsSubmitted: 0,
          totalResolvedReports: 0,
          badge: "Wayfinder",
          badges: ["Wayfinder"],
          pointsHistory: [],
        },
      });
    }

    const idx = db.users.findIndex(
      (u) => String(u.userId || "") === String(req.params.userId),
    );

    if (idx >= 0) {
      db.users[idx] = rebuilt;
    } else {
      db.users.push(rebuilt);
    }

    writeDb(db);

    return res.json({
      success: true,
      user: rebuilt,
    });
  } catch (error) {
    console.error("GET USER ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch user profile.",
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🤖 Local ML Service: ${ML_SERVICE_URL}`);
  console.log(
    `🧠 Gemini Fallback: ${GEMINI_API_KEY ? `Enabled (${GEMINI_MODEL})` : "Disabled"}`,
  );
});
