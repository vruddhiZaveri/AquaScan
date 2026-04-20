import { storage } from "./storageService.js";
import { api } from "./api.js";
import { normalizeAiResponse } from "./mlService.js";

const REPORTS_KEY = "aqs:reports";
const DATA_EVENT = "aqs:data-changed";


function emitChange(type, payload = {}) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent(DATA_EVENT, {
        detail: { type, ...payload, at: Date.now() },
      }),
    );
  }
}

function normalizeReport(report = {}) {
  const id = report.id || report._id || report.reportId || `rep_${Date.now()}`;
  const ai = report.ai
    ? normalizeAiResponse(report.ai, Boolean(report.ai?.live))
    : null;

  const statusHistory = (report.statusHistory || []).map((h) => ({
    ...h,
    timestamp: h.timestamp || h.createdAt || new Date().toISOString(),
  }));

  return {
    ...report,
    id,
    _id: report._id || id,
    ai,
    imageData: report.imageData || report.imageUrl || report.image || "",
    createdAt: report.createdAt || report.timestamp || new Date().toISOString(),
    selectedCommittees: report.selectedCommittees || [],
    statusHistory,
  };
}

async function getAllReports() {
  return ((await storage.get(REPORTS_KEY)) || []).map(normalizeReport);
}

async function saveAllReports(reports) {
  await storage.set(REPORTS_KEY, reports.map(normalizeReport));
  emitChange("reports");
}

export const reportService = {
  events: { DATA_EVENT },

  async getAll() {
    try {
      const data = await api("/reports");
      return (data.reports || []).map(normalizeReport);
    } catch {
      return await getAllReports();
    }
  },

  async getByUser(userId) {
    const reports = await this.getAll();
    return reports.filter(
      (r) =>
        r.userId === userId ||
        r.userId?._id === userId ||
        r.userId?.id === userId,
    );
  },

  async getById(id) {
    try {
      const data = await api(`/reports/${id}`);
      return data.report ? normalizeReport(data.report) : null;
    } catch {
      const reports = await getAllReports();
      return reports.find((r) => r.id === id || r._id === id) || null;
    }
  },

  async analyze(payload) {
    const fd = new FormData();

    if (payload.file) {
      fd.append("file", payload.file);
    } else if (payload.imageData) {
      fd.append("imageData", payload.imageData);
    }

    fd.append("comment", payload.comment || "");
    fd.append("locationName", payload.locationName || "");

    const data = await api("/analyze", {
      method: "POST",
      body: fd,
    });

    return {
      ai: data.ai ? normalizeAiResponse(data.ai, Boolean(data.ai?.live)) : null,
      imageData: data.imageData || payload.imageData || "",
    };
  },

  async create(payload) {
    const fd = new FormData();

    if (payload.file) {
      fd.append("file", payload.file);
    } else if (payload.imageData) {
      fd.append("imageData", payload.imageData);
    }

    fd.append("comment", payload.comment || "");
    fd.append("locationName", payload.locationName || "");
    fd.append(
      "selectedCommittees",
      JSON.stringify(payload.selectedCommittees || []),
    );
    fd.append("userId", payload.userId || "");
    fd.append("userName", payload.userName || "");
    fd.append("userEmail", payload.userEmail || "");

    if (payload.ai) {
      fd.append("ai", JSON.stringify(payload.ai));
    }

    const data = await api("/reports", {
      method: "POST",
      body: fd,
    });

    const report = normalizeReport(data.report);

    const reports = await getAllReports();
    reports.push(report);
    await saveAllReports(reports);

    emitChange("report-created", { reportId: report.id });
    return report;
  },

  async update(id, patch) {
    try {
      const data = await api(`/reports/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });

      const report = normalizeReport(data.report);
      const reports = await getAllReports();
      const idx = reports.findIndex((r) => r.id === id || r._id === id);

      if (idx >= 0) reports[idx] = report;
      else reports.push(report);

      await saveAllReports(reports);
      emitChange("report-updated", { reportId: report.id });
      return report;
    } catch {
      const reports = await getAllReports();
      const idx = reports.findIndex((r) => r.id === id || r._id === id);
      if (idx === -1) return null;

      reports[idx] = normalizeReport({ ...reports[idx], ...patch });
      await saveAllReports(reports);

      emitChange("report-updated", { reportId: id });
      return reports[idx];
    }
  },

  async updateStatus(id, status, by, _note, remark) {
    try {
      const data = await api(`/reports/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, by, remark }),
      });

      const report = normalizeReport(data.report);
      const reports = await getAllReports();
      const idx = reports.findIndex((r) => r.id === id || r._id === id);

      if (idx >= 0) reports[idx] = report;
      else reports.push(report);

      await saveAllReports(reports);

      emitChange("report-status", {
        reportId: report.id,
        status: report.status,
      });

      return report;
    } catch {
      const reports = await getAllReports();
      const idx = reports.findIndex((r) => r.id === id || r._id === id);
      if (idx === -1) return null;

      const current = reports[idx];
      const statusHistory = [
        ...(current.statusHistory || []),
        {
          status,
          by: by || "Committee",
          timestamp: new Date().toISOString(),
          remark: remark || "",
        },
      ];

      reports[idx] = normalizeReport({
        ...current,
        status,
        publicRemark: remark || current.publicRemark || "",
        statusHistory,
      });

      await saveAllReports(reports);

      emitChange("report-status", { reportId: id, status });
      return reports[idx];
    }
  },
};
