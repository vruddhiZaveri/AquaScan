import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import axios from "axios";
import FormData from "form-data";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

const PORT = process.env.PORT || 5000;
const AI_API_KEY = process.env.AI_API_KEY;
const AI_MODEL = process.env.AI_MODEL || "gemini-1.5-flash";
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://127.0.0.1:8000";

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 },
});

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

function normalizeMlForFrontend(data = {}, live = true) {
  const severity = String(data.severity || "LOW").toLowerCase();

  const urgencyScore =
    typeof data.urgency === "string"
      ? parseInt(data.urgency.split("/")[0], 10) || 0
      : Number(data.urgencyScore || 0);

  const coveragePercent =
    typeof data.coverage === "string"
      ? parseFloat(data.coverage.replace("%", "")) || 0
      : Number(data.coveragePercent || 0);

  let confidence = data.confidence;
  if (typeof confidence === "string") {
    const c = confidence.toLowerCase();
    if (c.includes("high")) confidence = 0.9;
    else if (c.includes("medium")) confidence = 0.6;
    else confidence = 0.2;
  }

  return {
    pollutionType: data.pollutionType || "Analysis Unavailable",
    severity,
    urgencyScore,
    detectedCount: Number(data.detectedCount || 0),
    densityLevel: data.density || data.densityLevel || "Low",
    coveragePercent,
    confidence: Number(confidence || 0.2),
    detectedItems: Array.isArray(data.detectedItems) ? data.detectedItems : [],
    description: data.description || "",
    recommendations: data.recommendation || data.recommendations || "",
    reviewRequired: Boolean(data.needsBetterImage || data.reviewRequired),
    live,
    modelUsed: data.rawSource || "custom-yolo-model",
  };
}

function fallbackAi(reason = "Analysis failed.") {
  return {
    pollutionType: "Analysis Unavailable",
    severity: "UNKNOWN",
    urgency: "N/A",
    density: "Unknown",
    coverage: "N/A",
    confidence: "Low",
    description: reason,
    recommendation:
      "Please retry with a clearer image or review the image manually.",
    needsBetterImage: true,
    rawSource: "backend-fallback",
  };
}

function shouldFallbackToGemini(mlResult) {
  if (!mlResult) return true;

  const severity = String(mlResult.severity || "").toUpperCase();
  const pollutionType = String(mlResult.pollutionType || "").toLowerCase();
  const needsBetterImage = Boolean(mlResult.needsBetterImage);

  if (needsBetterImage) return true;
  if (severity === "UNKNOWN") return true;
  if (pollutionType.includes("analysis failed")) return true;
  if (pollutionType.includes("image unclear")) return true;

  return false;
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
      timeout: 60000,
    });

    return normalizeMlForFrontend(response.data, true);

  } catch (error) {
    console.error("===== LOCAL ML ERROR =====");
    console.error("MESSAGE:", error?.message || error);

    if (error?.response) {
      console.error("STATUS:", error.response.status);
      console.error("DATA:", error.response.data);
    }

    return fallbackAi(`Local ML failed: ${error?.message || "Unknown error"}`);
  }
}

async function analyzeWithGemini(file) {
  try {
    if (!file?.buffer) {
      return fallbackAi("No image file received by the backend.");
    }

    if (!AI_API_KEY) {
      return fallbackAi(
        "Gemini fallback unavailable because AI_API_KEY is missing.",
      );
    }

    const mimeType = file.mimetype || "image/jpeg";
    const base64Image = file.buffer.toString("base64");

    const prompt = `
You are AquaScan's aquatic waste analysis system.

Analyze ONLY the uploaded image and determine whether visible aquatic waste or floating water-surface litter is present.

Rules:
- Focus only on visible waste/pollution in or on water.
- Detect man-made waste such as plastic bottles, plastic bags, wrappers, foam, cans, containers, nets, floating debris.
- Do not invent objects that are not visible.
- severity must be one of: LOW, MEDIUM, HIGH, UNKNOWN
- urgency must be in style like: 1/10, 6/10, 9/10, or N/A
- density must be one of: Minimal, Low, Moderate, High, Very High, Unknown
- coverage must be in style like: 0%, 12%, 45%, or N/A
- confidence must be one of: Low, Medium, High
- Return ONLY valid JSON
- No markdown
- No code block

{
  "pollutionType": "Plastic and Foam Waste",
  "severity": "HIGH",
  "urgency": "9/10",
  "density": "High",
  "coverage": "75%",
  "confidence": "High",
  "description": "A very high concentration of plastic bottles and foam pieces are clearly visible floating on the water surface, indicating severe plastic pollution.",
  "recommendation": "Immediate cleanup action is recommended. Cleanup teams should remove the large volume of plastic and foam waste and investigate the pollution source.",
  "needsBetterImage": false
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

    console.log("===== RAW GEMINI RESPONSE =====");
    console.log(rawText);

    const parsed = extractJson(rawText);

    if (!parsed) {
      return fallbackAi("Gemini returned an unreadable response format.");
    }

    return normalizeGeminiAi(parsed);
  } catch (error) {
    console.error("===== GEMINI FALLBACK ERROR =====");
    console.error("MESSAGE:", error?.message || error);

    if (error?.response) {
      console.error("STATUS:", error.response.status);
      console.error("DATA:", error.response.data);
    }

    return fallbackAi(
      `Gemini fallback failed: ${error?.message || "Unknown error"}`,
    );
  }
}

async function analyzeImage(file) {
  const mlResult = await analyzeWithML(file);

  return {
    ...mlResult,
    analysisSource: "local-ml",
    live: true,
  };
}

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "AquaScan backend running",
    mlService: ML_SERVICE_URL,
    geminiFallbackEnabled: Boolean(AI_API_KEY),
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
  console.log(`🤖 Local ML Service: ${ML_SERVICE_URL}`);
  console.log(`🧠 Gemini Fallback: ${AI_API_KEY ? "Enabled" : "Disabled"}`);
});
