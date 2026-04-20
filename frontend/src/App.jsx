import React from "react";
import AppRouter from "./navigation/AppRouter.jsx";
import { T } from "./styles/theme.js";

export default function App() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#03080f",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px 0",
        fontFamily: "Urbanist, sans-serif",
      }}
    >
      <div
        style={{
          width: 390,
          maxWidth: "100vw",
          background: T.bg1,
          borderRadius: 40,
          overflow: "hidden",
          border: `2px solid ${T.border}`,
          display: "flex",
          flexDirection: "column",
          height: 800,
          position: "relative",
          boxShadow: `0 32px 80px ${T.bg0}cc`,
        }}
      >
        <AppRouter />
      </div>
    </div>
  );
}
