// ─────────────────────────────────────────────────────────────────────────────
// frontend/src/components/layout/AppShell.jsx
// ─────────────────────────────────────────────────────────────────────────────
import React from "react";
import { T } from "../../styles/theme.js";
import StatusBar from "./StatusBar.jsx";
import BottomNav from "./BottomNav.jsx";

export default function AppShell({ tabs, activeId, onNav, children, toast }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: T.bg1,
      }}
    >
      <StatusBar />
      <div
        style={{
          flex: 1,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {children}
      </div>
      {tabs && <BottomNav tabs={tabs} activeId={activeId} onNav={onNav} />}
      {toast}
    </div>
  );
}
