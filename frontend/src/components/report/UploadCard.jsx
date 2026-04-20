// ─────────────────────────────────────────────────────────────────────────────
// frontend/src/components/report/UploadCard.jsx
// ─────────────────────────────────────────────────────────────────────────────
import React, { useRef } from "react";
import { T } from "../../styles/theme.js";
import Button from "../common/Button.jsx";

export default function UploadCard({ onFile, locName }) {
  const fileRef = useRef();
  return (
    <>
      <div
        onClick={() => fileRef.current.click()}
        style={{
          border: `2px dashed ${T.border}`,
          borderRadius: 20,
          padding: "36px 24px",
          textAlign: "center",
          cursor: "pointer",
          background: T.bg2,
          marginBottom: 14,
        }}
      >
        <div style={{ fontSize: 52, marginBottom: 10 }}>🌊</div>
        <p
          style={{
            color: T.t1,
            fontWeight: 700,
            margin: "0 0 5px",
            fontSize: 15,
          }}
        >
          Take or Upload a Photo
        </p>
        <p style={{ color: T.t3, fontSize: 12, margin: 0 }}>
          AI will detect waste type, severity & urgency automatically
        </p>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={onFile}
      />
      <div
        style={{
          background: T.bg2,
          borderRadius: 12,
          padding: "10px 14px",
          border: `1px solid ${T.border}`,
          display: "flex",
          gap: 10,
          alignItems: "center",
          marginBottom: 14,
        }}
      >
        <span>📍</span>
        <div>
          <p
            style={{
              color: T.t4,
              fontSize: 9,
              fontWeight: 700,
              margin: "0 0 1px",
            }}
          >
            YOUR LOCATION
          </p>
          <p style={{ color: T.t1, fontSize: 12, margin: 0 }}>{locName}</p>
        </div>
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <Button onClick={() => fileRef.current.click()}>📷 Camera</Button>
        <Button onClick={() => fileRef.current.click()} variant="secondary">
          🖼️ Gallery
        </Button>
      </div>
    </>
  );
}
