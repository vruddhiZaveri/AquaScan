// ─────────────────────────────────────────────────────────────────────────────
// frontend/src/pages/user/Chat.jsx
// ─────────────────────────────────────────────────────────────────────────────
import React from "react";
import ChatBox from "../../components/chat/ChatBox.jsx";
import { useChat } from "../../hooks/useChat.js";

export default function UserChat({ report, user, nav }) {
  const { msgs, sending, send } = useChat(report.id);
  return (
    <ChatBox
      report={report}
      currentRole="citizen"
      currentUser={user}
      msgs={msgs}
      sending={sending}
      onSend={(message, type) => send("citizen", user.fullName, message, type)}
      onBack={() => nav("reportDetail", report)}
      showNoteToggle={false}
    />
  );
}
