// ─────────────────────────────────────────────────────────────────────────────
// frontend/src/components/chat/MessageBubble.jsx
// ─────────────────────────────────────────────────────────────────────────────
import React from "react";
import { T } from "../../styles/theme.js";
import { fmtTime } from "../../utils/formatters.js";

export default function MessageBubble({ msg, currentRole }) {
  const isMe = msg.senderRole === currentRole;
  const isSystem = msg.type === "system";

  if (isSystem) {
    return (
      <div
        style={{
          background: T.bg3,
          borderRadius: 10,
          padding: "8px 12px",
          border: `1px solid ${T.border}`,
          textAlign: "center",
        }}
      >
        <p style={{ color: T.t3, fontSize: 12, margin: 0, lineHeight: 1.5 }}>
          {msg.message}
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: isMe ? "row-reverse" : "row",
        gap: 8,
        alignItems: "flex-end",
      }}
    >
      {!isMe && (
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: msg.senderRole === "committee" ? T.purple : T.blueMid,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
            flexShrink: 0,
          }}
        >
          {msg.senderRole === "committee" ? "🏛️" : "👤"}
        </div>
      )}
      <div style={{ maxWidth: "78%" }}>
        {!isMe && (
          <p
            style={{
              color: msg.senderRole === "committee" ? T.purple : T.blueL,
              fontSize: 10,
              fontWeight: 700,
              margin: "0 0 3px",
            }}
          >
            {msg.senderName}
          </p>
        )}
        <div
          style={{
            background: isMe ? T.blue : T.bg3,
            borderRadius: isMe ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
            padding: "10px 13px",
            border: isMe ? "none" : `1px solid ${T.border}`,
          }}
        >
          <p
            style={{
              color: isMe ? "#fff" : T.t1,
              fontSize: 13,
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            {msg.message}
          </p>
        </div>
        <p
          style={{
            color: T.t4,
            fontSize: 9,
            margin: "3px 4px 0",
            textAlign: isMe ? "right" : "left",
          }}
        >
          {fmtTime(msg.timestamp)}
        </p>
      </div>
    </div>
  );
}
