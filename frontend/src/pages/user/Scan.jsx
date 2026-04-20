import React, { useState } from "react";
import { T } from "../../styles/theme.js";
import Button from "../../components/common/Button.jsx";
import DetectionResult from "../../components/report/DetectionResult.jsx";
import UploadCard from "../../components/report/UploadCard.jsx";
import { reportService } from "../../services/reportService.js";
import { calcPts, now } from "../../utils/helpers.js";
import { useLocation } from "../../hooks/useLocation.js";
import { storage } from "../../services/storageService.js";

const MOCK_COMMITTEES = [
  {
    id: "bmc",
    committeeName: "BMC Coastal Cell",
    jurisdictionArea: "Mumbai Coastal Belt",
  },
  {
    id: "mpcb",
    committeeName: "MPCB Mumbai",
    jurisdictionArea: "Greater Mumbai + Thane",
  },
];

export default function Scan({ user, nav, toast, onUpdateUser }) {
  const [step, setStep] = useState(1);
  const [imageData, setImageData] = useState(null);
  const [ai, setAi] = useState(null);
  const [comment, setComment] = useState("");
  const [selected, setSelected] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showDiscard, setShowDiscard] = useState(false);
  const { locName } = useLocation();

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setAi(null);

    const reader = new FileReader();
    reader.onload = (ev) => {
      setImageData(ev.target.result);
      setStep(2);
    };
    reader.readAsDataURL(file);
  };

 const handleSubmit = async () => {
   if (!imageData && !selectedFile) {
     toast?.("Please upload an image first.");
     return;
   }

   try {
     setSubmitting(true);
     setStep(3);

     const createdReport = await reportService.create({
       userId: user?.id || "",
       userName: user?.fullName || user?.name || "Citizen User",
       userEmail: user?.email || "",
       comment,
       locationName: locName || "Unknown location",
       imageData,
       selectedCommittees: selected,
       file: selectedFile,
     });

     const finalAi = createdReport?.ai || null;
     setAi(finalAi);

     const pts = calcPts(finalAi?.severity, finalAi?.detectedCount);

     const users = (await storage.get("aqs:users")) || {};
     const key = String(user?.email || "").replace(/[^a-z0-9]/gi, "_");

     if (key && users[key]) {
       users[key].impactPoints = (users[key].impactPoints || 0) + pts;
       users[key].totalReportsSubmitted =
         (users[key].totalReportsSubmitted || 0) + 1;
       users[key].lastReportDate = new Date().toISOString();
       users[key].streakDays = Math.max(users[key].streakDays || 0, 1);
       users[key].pointsHistory = [
         ...(users[key].pointsHistory || []).slice(-29),
         { reason: "Pollution Report Filed", points: pts, timestamp: now() },
       ];

       if (
         (users[key].totalReportsSubmitted || 0) >= 1 &&
         !(users[key].badges || []).includes("Quartz Scout")
       ) {
         users[key].badges = [...(users[key].badges || []), "Quartz Scout"];
       }

       await storage.set("aqs:users", users);
       onUpdateUser?.(users[key]);
     }

     setStep(4);
     toast?.(`Report filed! +${pts} pts 🌊`);
   } catch (error) {
     console.error("Submit failed:", error);
     toast?.(error.message || "Failed to submit report.");
     setStep(2);
   } finally {
     setSubmitting(false);
   }
 };

  if (step === 4) {
    return (
      <div
        style={{
          padding: 24,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          gap: 14,
        }}
      >
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: `${T.success}20`,
            border: `2px solid ${T.success}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 36,
            animation: "pop .4s ease",
          }}
        >
          ✅
        </div>

        <h2
          style={{
            color: T.t1,
            textAlign: "center",
            margin: 0,
            fontSize: 22,
            fontWeight: 800,
          }}
        >
          Report Submitted!
        </h2>

        {ai && (
          <div
            style={{
              width: "100%",
              maxWidth: 520,
              background: T.bg2,
              border: `1px solid ${T.borderL}`,
              borderRadius: 18,
              padding: 14,
            }}
          >
            <DetectionResult ai={ai} />
          </div>
        )}

        <p
          style={{
            color: T.t3,
            textAlign: "center",
            fontSize: 13,
            margin: 0,
          }}
        >
          Sent to{" "}
          <span style={{ color: T.blueL, fontWeight: 700 }}>
            {selected.length || 1} committee(s)
          </span>
          .
          <span style={{ color: T.success, fontWeight: 700 }}>
            {" "}
            +{calcPts(ai?.severity, ai?.detectedCount)} pts!
          </span>
        </p>

        <Button
          onClick={() => nav("home")}
          variant="secondary"
          style={{ width: "auto", padding: "11px 24px" }}
        >
          Back to Home →
        </Button>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: step === 3 ? 0 : 16,
        paddingBottom: step === 3 ? 0 : 120,
        overflowY: step === 3 ? "hidden" : "auto",
        overflowX: "hidden",
        height: "100%",
        minHeight: 0,
        position: "relative",
        WebkitOverflowScrolling: "touch",
        boxSizing: "border-box",
      }}
    >
      {showDiscard && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,.75)",
            zIndex: 90,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <div
            style={{
              background: T.bg2,
              borderRadius: 20,
              border: `1px solid ${T.borderL}`,
              padding: 22,
              width: "100%",
              animation: "pop .25s ease",
            }}
          >
            <p
              style={{
                color: T.t1,
                fontSize: 16,
                fontWeight: 700,
                margin: "0 0 8px",
              }}
            >
              Discard Report?
            </p>
            <p style={{ color: T.t3, fontSize: 13, margin: "0 0 16px" }}>
              Your progress will be lost.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <Button variant="secondary" onClick={() => setShowDiscard(false)}>
                Keep Editing
              </Button>
              <Button variant="danger" onClick={() => nav("home")}>
                Discard
              </Button>
            </div>
          </div>
        </div>
      )}

      {step !== 3 && (
        <>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 16,
            }}
          >
            <button
              onClick={() => {
                if (step > 1 && step < 4) setShowDiscard(true);
                else nav("home");
              }}
              style={{
                background: "none",
                border: "none",
                color: T.blueL,
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "Urbanist, sans-serif",
              }}
            >
              ← Back
            </button>

            <h2
              style={{ color: T.t1, fontSize: 18, fontWeight: 800, margin: 0 }}
            >
              Scan & Report
            </h2>
          </div>

          <div style={{ display: "flex", gap: 5, marginBottom: 18 }}>
            {["Capture", "Analyzing", "Review", "Submit", "Done"].map(
              (label, i) => {
                const activeIndex =
                  step === 1 ? 0 : step === 2 ? 1 : step === 3 ? 2 : 3;

                return (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      gap: 3,
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{
                        width: "100%",
                        height: 6,
                        borderRadius: 999,
                        background: i <= activeIndex ? T.blueL : T.bg3,
                      }}
                    />
                    <span
                      style={{
                        color: i <= activeIndex ? T.blueL : T.t3,
                        fontSize: 11,
                        fontWeight: 700,
                      }}
                    >
                      {label}
                    </span>
                  </div>
                );
              },
            )}
          </div>
        </>
      )}

      {step === 1 && (
        <div style={{ display: "grid", gap: 16, padding: 16 }}>
          <UploadCard onFile={handleFile} locName={locName} />

          {imageData && (
            <div
              style={{
                marginTop: 16,
                background: T.bg2,
                borderRadius: 18,
                padding: 16,
                border: `1px solid ${T.borderL}`,
              }}
            >
              <div
                style={{
                  color: T.t1,
                  fontSize: 14,
                  fontWeight: 700,
                  marginBottom: 8,
                }}
              >
                Add a short note
              </div>

              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a short comment for the authorities..."
                style={{
                  width: "100%",
                  minHeight: 80,
                  borderRadius: 12,
                  border: `1px solid ${T.border}`,
                  background: T.bg3,
                  color: T.t1,
                  padding: 12,
                  fontSize: 13,
                  outline: "none",
                  resize: "none",
                  fontFamily: "inherit",
                }}
              />
            </div>
          )}
        </div>
      )}

      {step === 2 && (
        <div style={{ display: "grid", gap: 16, padding: 16 }}>
          {imageData && (
            <img
              src={imageData}
              alt="Selected"
              style={{
                width: "100%",
                borderRadius: 20,
                border: `1px solid ${T.borderL}`,
                objectFit: "cover",
                maxHeight: 280,
              }}
            />
          )}

          <div
            style={{
              background: T.bg2,
              border: `1px solid ${T.borderL}`,
              borderRadius: 20,
              padding: 18,
            }}
          >
            <div
              style={{
                color: T.t1,
                fontSize: 15,
                fontWeight: 800,
                marginBottom: 12,
              }}
            >
              Select committee(s)
            </div>

            <div style={{ display: "grid", gap: 10 }}>
              {MOCK_COMMITTEES.map((committee) => {
                const checked = selected.some((c) => c.id === committee.id);

                return (
                  <label
                    key={committee.id}
                    style={{
                      display: "flex",
                      gap: 12,
                      alignItems: "flex-start",
                      padding: 12,
                      borderRadius: 14,
                      border: `1px solid ${checked ? T.blueL : T.borderL}`,
                      background: checked ? `${T.blueL}12` : T.bg3,
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {
                        setSelected((prev) =>
                          checked
                            ? prev.filter((x) => x.id !== committee.id)
                            : [...prev, committee],
                        );
                      }}
                    />
                    <div>
                      <div
                        style={{
                          color: T.t1,
                          fontSize: 13,
                          fontWeight: 700,
                        }}
                      >
                        {committee.committeeName}
                      </div>
                      <div style={{ color: T.t3, fontSize: 12 }}>
                        {committee.jurisdictionArea}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <Button
              variant="secondary"
              onClick={() => setStep(1)}
              style={{ flex: 1 }}
            >
              Change Image
            </Button>

            <Button
              onClick={handleSubmit}
              disabled={submitting || !imageData}
              style={{ flex: 1 }}
            >
              {submitting ? "Submitting..." : "Submit Report"}
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: "24px",
            gap: 18,
          }}
        >
          <div
            style={{
              width: 58,
              height: 58,
              borderRadius: "50%",
              border: `4px solid ${T.borderL}`,
              borderTopColor: T.blueL,
              animation: "spin 1s linear infinite",
            }}
          />
          <div style={{ maxWidth: 360 }}>
            <div
              style={{
                color: T.t1,
                fontSize: 18,
                fontWeight: 800,
                marginBottom: 8,
                lineHeight: 1.3,
              }}
            >
              Analyzing image and generating pollution report...
            </div>
            <div style={{ color: T.t3, fontSize: 13, lineHeight: 1.5 }}>
              This may take a few seconds.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
  