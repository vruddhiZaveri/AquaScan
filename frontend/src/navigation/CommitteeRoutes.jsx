// ─────────────────────────────────────────────────────────────────────────────
// frontend/src/navigation/CommitteeRoutes.jsx
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState } from "react";
import AppShell from "../components/layout/AppShell.jsx";
import Toast from "../components/common/Toast.jsx";
import { COMMITTEE_TABS } from "../utils/constants.js";
import CommitteeDashboard from "../pages/committee/Dashboard.jsx";
import CommitteeReports from "../pages/committee/Reports.jsx";
import CommitteeReportDetail from "../pages/committee/ReportDetail.jsx";
import CommitteeChat from "../pages/committee/Chat.jsx";
import CommitteeAnalytics from "../pages/committee/Analytics.jsx";
import CommitteeProfile from "../pages/committee/Profile.jsx";

export default function CommitteeRoutes({ user, onLogout }) {
  const [screen, setScreen] = useState("cDashboard");
  const [payload, setPayload] = useState(null);
  const [toast, setToast] = useState(null);

  const nav = (s, p = null) => {
    setScreen(s);
    setPayload(p);
  };

  const OVERLAY = ["cReportDetail", "cChat"];
  const activeTab = OVERLAY.includes(screen) ? "cReports" : screen;

  const render = () => {
    switch (screen) {
      case "cDashboard":
        return <CommitteeDashboard user={user} nav={nav} />;
      case "cReports":
        return <CommitteeReports user={user} nav={nav} initFilter={payload} />;
      case "cReportDetail":
        return payload ? (
          <CommitteeReportDetail
            report={payload}
            user={user}
            nav={nav}
            toast={setToast}
          />
        ) : null;
      case "cChat":
        return payload ? (
          <CommitteeChat report={payload} user={user} nav={nav} />
        ) : null;
      case "cAnalytics":
        return <CommitteeAnalytics user={user} />;
      case "cProfile":
        return <CommitteeProfile user={user} onLogout={onLogout} />;
      default:
        return <CommitteeDashboard user={user} nav={nav} />;
    }
  };

  return (
    <AppShell
      tabs={COMMITTEE_TABS}
      activeId={activeTab}
      onNav={nav}
      toast={toast && <Toast msg={toast} onDone={() => setToast(null)} />}
    >
      {render()}
    </AppShell>
  );
}
