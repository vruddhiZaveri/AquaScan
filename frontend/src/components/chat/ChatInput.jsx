// ─────────────────────────────────────────────────────────────────────────────
// frontend/src/components/chat/ChatInput.jsx
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState } from "react";
import { T } from "../../styles/theme.js";

export default function ChatInput({ onSend, sending, showNoteToggle = false }) {
  const [msg, setMsg] = useState("");
  const [note, setNote] = useState(false);

  const send = () => {
    if (!msg.trim() || sending) return;
    onSend(msg.trim(), note ? "internal" : "public");
    setMsg("");
  };

  return (
    <div
      style={{
        background: T.bg2,
        borderTop: `1px solid ${T.border}`,
        flexShrink: 0,
      }}
    >
      {showNoteToggle && (
        <div style={{ display: "flex", gap: 6, padding: "6px 14px 0" }}>
          {[
            ["Public Reply", false],
            ["Internal Note", true],
          ].map(([l, v]) => (
            <button
              key={l}
              onClick={() => setNote(v)}
              style={{
                flex: 1,
                background:
                  note === v ? (v ? `${T.purple}25` : `${T.blue}20`) : "none",
                border: `1px solid ${note === v ? (v ? T.purple : T.blue) : T.border}`,
                color: note === v ? (v ? T.purple : T.blueL) : T.t3,
                borderRadius: 999,
                padding: "5px",
                fontSize: 10,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "Urbanist, sans-serif",
              }}
            >
              {l}
            </button>
          ))}
        </div>
      )}
      <div
        style={{
          display: "flex",
          gap: 10,
          alignItems: "center",
          padding: "10px 14px 14px",
        }}
      >
        <input
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder={note ? "Internal note (committee only)…" : "Message…"}
          style={{
            flex: 1,
            background: T.bg3,
            border: `1px solid ${note ? T.purple : T.border}`,
            borderRadius: 22,
            padding: "11px 16px",
            color: T.t1,
            fontSize: 13,
            outline: "none",
            fontFamily: "Urbanist, sans-serif",
          }}
        />
        <button
          onClick={send}
          disabled={!msg.trim() || sending}
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: msg.trim() && !sending ? T.blue : T.border,
            border: "none",
            color: "#fff",
            fontSize: 18,
            cursor: msg.trim() && !sending ? "pointer" : "default",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          ↑
        </button>
      </div>
    </div>
  );
}
