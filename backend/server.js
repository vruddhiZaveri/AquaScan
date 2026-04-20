import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import axios from "axios";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

const PORT = process.env.PORT || 5000;
const AI_API_KEY = process.env.AI_API_KEY;
const AI_MODEL = process.env.AI_MODEL || "gemini-1.5-flash";

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 },
});

function toNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function safeJsonParse(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function extractJson(text = "") {
  if (!text || typeof text !== "string") return null;

  const trimmed = text
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  const direct = safeJsonParse(trimmed);
  if (direct) return direct;

  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");

  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    const sliced = trimmed.slice(firstBrace, lastBrace + 1);
    return safeJsonParse(sliced);
  }

  return null;
}

function normalizeAi(data = {}) {
  const severity = String(data.severity || "low").toLowerCase();
  const allowedSeverity = ["low", "medium", "high"].includes(severity)
    ? severity
    : "low";

  const densityRaw = String(data.densityLevel || data.density || "Low");
  const densityLevel = ["low", "medium", "high"].includes(
    densityRaw.toLowerCase(),
  )
    ? densityRaw.charAt(0).toUpperCase() + densityRaw.slice(1).toLowerCase()
    : "Low";

  let confidence = data.confidence;
  if (typeof confidence === "string") {
    confidence = parseFloat(confidence.replace("%", ""));
    confidence = confidence > 1 ? confidence / 100 : confidence;
  }
  confidence = typeof confidence === "number" ? confidence : 0.2;
  confidence = Math.max(0, Math.min(1, confidence));

  const coveragePercent =
    typeof data.coveragePercent === "string"
      ? parseFloat(data.coveragePercent.replace("%", ""))
      : toNumber(data.coveragePercent, 0);

  return {
    pollutionType: data.pollutionType || "Analysis Unavailable",
    severity: allowedSeverity,
    urgencyScore: Math.max(1, Math.min(10, toNumber(data.urgencyScore, 2))),
    detectedCount: Math.max(0, toNumber(data.detectedCount, 0)),
    densityLevel,
    coveragePercent: Math.max(0, Math.min(100, toNumber(coveragePercent, 0))),
    confidence,
    detectedItems: Array.isArray(data.detectedItems) ? data.detectedItems : [],
    description:
      data.description ||
      "The analysis service could not confidently evaluate this image.",
    recommendations:
      data.recommendations ||
      "Please retry with a clearer image or send this report for manual review.",
    reviewRequired: Boolean(data.reviewRequired),
    live: true,
    modelUsed: AI_MODEL,
  };
}

function fallbackAi(reason = "AI analysis failed.", errorCode = null) {
  return {
    pollutionType: "Analysis Unavailable",
    severity: "low",
    urgencyScore: 2,
    detectedCount: 0,
    densityLevel: "Low",
    coveragePercent: 0,
    confidence: 0.2,
    detectedItems: [],
    description: reason,
    recommendations:
      errorCode === 429
        ? "AI quota/rate limit reached. Please wait a bit and retry, or switch to manual review."
        : "Please retry with a clearer image or send this report for manual review.",
    reviewRequired: true,
    live: false,
    status: errorCode === 429 ? "rate_limited" : "fallback",
    modelUsed: "Fallback",
  };
}

async function analyzeImage(file) {
  try {
    if (!file?.buffer) {
      return fallbackAi("No image file received by the backend.");
    }

    if (!AI_API_KEY) {
      return fallbackAi("AI API key is missing in backend environment.");
    }

    const mimeType = file.mimetype || "image/jpeg";
    const base64Image = file.buffer.toString("base64");

    const prompt = `
You are AquaScan's aquatic waste analysis system.

Your task:
Analyze ONLY the uploaded image and determine whether clearly visible aquatic waste or water-surface litter is present.

Rules:
- Focus only on visible waste/pollution in or on water.
- Detect man-made waste such as plastic bottles, plastic bags, wrappers, foam, cans, containers, nets, floating debris.
- Do NOT invent objects that are not visible.
- If the image is unclear, still return the best cautious estimate.
- severity must be one of: low, medium, high
- densityLevel must be one of: Low, Medium, High
- confidence must be between 0 and 1
- coveragePercent must be between 0 and 100
- urgencyScore must be between 1 and 10
- detectedCount must be an integer

Return ONLY valid JSON.
No markdown.
No explanation.
No code block.

{
  "pollutionType": "Plastic Pollution",
  "severity": "medium",
  "urgencyScore": 6,
  "detectedCount": 4,
  "densityLevel": "Medium",
  "coveragePercent": 12,
  "confidence": 0.74,
  "detectedItems": ["plastic bottle", "plastic bag"],
  "description": "Visible floating plastic waste is present on the water surface.",
  "recommendations": "Schedule cleanup soon and monitor this area.",
  "reviewRequired": false
}
`.trim();

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/${AI_MODEL}:generateContent`,
      {
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType,
                  data: base64Image,
                },
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          topK: 32,
          topP: 0.95,
          maxOutputTokens: 700,
          responseMimeType: "application/json",
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": AI_API_KEY,
        },
        timeout: 60000,
      },
    );

    const rawText =
      response?.data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    console.log("===== RAW AI RESPONSE =====");
    console.log(rawText);

    const parsed = extractJson(rawText);

    if (!parsed) {
      return fallbackAi("AI returned an unreadable response format.");
    }

    return normalizeAi(parsed);
  } catch (error) {
    console.error("===== AI ENGINE ANALYSIS ERROR =====");
    console.error("MESSAGE:", error?.message || error);

    if (error?.response) {
      console.error("STATUS:", error.response.status);
      console.error("DATA:", error.response.data);
    }

    return fallbackAi(
      `AI request failed: ${error?.message || "Unknown error"}`,
    );
  }
}

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "AquaScan backend running",
    model: AI_MODEL,
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
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file uploaded.",
      });
    }

    const ai = await analyzeImage(req.file);

    let selectedCommittees = [];
    try {
      selectedCommittees = JSON.parse(req.body.selectedCommittees || "[]");
    } catch {
      selectedCommittees = [];
    }

    const imageData = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;

    const report = {
      id: Date.now().toString(),
      userId: req.body.userId || "",
      userName: req.body.userName || "Anonymous",
      userEmail: req.body.userEmail || "",
      locationName: req.body.locationName || "Unknown location",
      comment: req.body.comment || "",
      selectedCommittees,
      imageData,
      createdAt: new Date().toISOString(),
      status: "submitted",
      statusHistory: [
        {
          status: "submitted",
          by: req.body.userName || "User",
          timestamp: new Date().toISOString(),
          remark: "Report submitted successfully.",
        },
      ],
      ai,
    };

    return res.json({
      success: true,
      report,
    });
  } catch (error) {
    console.error("REPORT CREATE ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create report.",
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🤖 AI Model: ${AI_MODEL}`);
  console.log(`🔑 API Key Present: ${AI_API_KEY ? "Yes" : "No"}`);
});
