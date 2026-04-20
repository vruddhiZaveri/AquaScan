// ─────────────────────────────────────────────────────────────────────────────
// frontend/src/components/chat/ChatBox.jsx
// ─────────────────────────────────────────────────────────────────────────────
import React, { useRef, useEffect } from "react";
import { T } from "../../styles/theme.js";
import MessageBubble from "./MessageBubble.jsx";
import ChatInput from "./ChatInput.jsx";
import { SeverityChip } from "../common/Chip.jsx";

export default function ChatBox({
  report,
  currentRole,
  currentUser,
  msgs,
  sending,
  onSend,
  onBack,
  showNoteToggle,
}) {
  const bottomRef = useRef();
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  const visibleMsgs = msgs.filter(
    (m) => currentRole === "committee" || m.type !== "internal",
  );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "10px 16px 12px",
          background: T.bg2,
          borderBottom: `1px solid ${T.border}`,
          flexShrink: 0,
        }}
      >
        <button
          onClick={onBack}
          style={{
            background: "none",
            border: "none",
            color: T.blueL,
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "Urbanist, sans-serif",
            marginBottom: 8,
          }}
        >
          ← Report
        </button>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 9,
              background: T.blueD,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
            }}
          >
            🌊
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                color: T.t1,
                fontSize: 13,
                fontWeight: 700,
                margin: "0 0 2px",
              }}
            >
              {report.ai?.pollutionType || "Pollution Report"}
            </p>
            <p
              style={{
                color: T.t3,
                fontSize: 10,
                margin: 0,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              📍 {report.locationName} · {report.id}
            </p>
          </div>
          <SeverityChip severity={report.ai?.severity} small />
        </div>
        <div
          style={{
            marginTop: 8,
            display: "flex",
            gap: 5,
            alignItems: "center",
          }}
        >
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: T.success,
            }}
          />
          <span style={{ color: T.success, fontSize: 10, fontWeight: 700 }}>
            Live · Updates every 5s
          </span>
        </div>
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "14px 16px",
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        {visibleMsgs.length === 0 ? (
          <div style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 14, padding: 14 }}>
            <p style={{ color: T.t1, fontSize: 13, fontWeight: 700, margin: "0 0 4px" }}>No replies yet</p>
            <p style={{ color: T.t3, fontSize: 12, margin: 0, lineHeight: 1.5 }}>Send a message to start the conversation. New updates sync automatically here.</p>
          </div>
        ) : visibleMsgs.map((m) => (
          <MessageBubble key={m.id} msg={m} currentRole={currentRole} />
        ))}
        <div ref={bottomRef} />
      </div>

      <ChatInput
        onSend={onSend}
        sending={sending}
        showNoteToggle={showNoteToggle}
      />
    </div>
  );
}
