// ─────────────────────────────────────────────────────────────────────────────
// frontend/src/navigation/UserRoutes.jsx
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState } from "react";
import AppShell from "../components/layout/AppShell.jsx";
import BottomNav from "../components/layout/BottomNav.jsx";
import Toast from "../components/common/Toast.jsx";
import { CITIZEN_TABS } from "../utils/constants.js";
import Home from "../pages/user/Home.jsx";
import Scan from "../pages/user/Scan.jsx";
import Reports from "../pages/user/Reports.jsx";
import ReportDetail from "../pages/user/ReportDetail.jsx";
import UserChat from "../pages/user/Chat.jsx";
import Profile from "../pages/user/Profile.jsx";

export default function UserRoutes({ user, onLogout, onUpdateUser }) {
  const [screen, setScreen] = useState("home");
  const [payload, setPayload] = useState(null);
  const [toast, setToast] = useState(null);

  const nav = (s, p = null) => {
    setScreen(s);
    setPayload(p);
  };

  const OVERLAY = ["scan", "reportDetail", "chat", "profile", "resolved"];
  const activeTab =
    screen === "reportDetail" || screen === "chat"
      ? "reports"
      : OVERLAY.includes(screen)
        ? screen
        : screen;

  const render = () => {
    switch (screen) {
      case "home":
        return <Home user={user} nav={nav} />;
      case "scan":
        return (
          <Scan
            user={user}
            nav={nav}
            toast={setToast}
            onUpdateUser={onUpdateUser}
          />
        );
      case "reports":
        return <Reports user={user} nav={nav} />;
      case "resolved":
        return <Reports user={user} nav={nav} initFilter="resolved" />;
      case "reportDetail":
        return payload ? <ReportDetail report={payload} nav={nav} /> : null;
      case "chat":
        return payload ? (
          <UserChat report={payload} user={user} nav={nav} />
        ) : null;
      case "profile":
        return <Profile user={user} nav={nav} onLogout={onLogout} />;
      default:
        return <Home user={user} nav={nav} />;
    }
  };

  return (
    <AppShell
      tabs={CITIZEN_TABS}
      activeId={activeTab}
      onNav={nav}
      toast={toast && <Toast msg={toast} onDone={() => setToast(null)} />}
    >
      {render()}
    </AppShell>
  );
}
