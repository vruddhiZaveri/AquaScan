// ─────────────────────────────────────────────────────────────────────────────
// frontend/src/pages/committee/Chat.jsx
// ─────────────────────────────────────────────────────────────────────────────
import React from "react";
import ChatBox from "../../components/chat/ChatBox.jsx";
import { useChat } from "../../hooks/useChat.js";

export default function CommitteeChat({ report, user, nav }) {
  const { msgs, sending, send } = useChat(report.id);
  return (
    <ChatBox
      report={report}
      currentRole="committee"
      currentUser={user}
      msgs={msgs}
      sending={sending}
      onSend={(message, type) =>
        send("committee", user.committeeName, message, type)
      }
      onBack={() => nav("cReportDetail", report)}
      showNoteToggle={true}
    />
  );
}
