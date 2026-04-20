// ─────────────────────────────────────────────────────────────────────────────
// frontend/src/main.jsx
// ─────────────────────────────────────────────────────────────────────────────
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";

// Inject Google Fonts
const link = document.createElement("link");
link.rel = "stylesheet";
link.href =
  "https://fonts.googleapis.com/css2?family=Urbanist:wght@400;500;600;700;800&family=Metrophobic&display=swap";
document.head.appendChild(link);

// Inject global keyframes
const style = document.createElement("style");
style.textContent = `
  *{box-sizing:border-box;margin:0;padding:0;-webkit-font-smoothing:antialiased}
  ::-webkit-scrollbar{width:0}
  @keyframes spin   {to{transform:rotate(360deg)}}
  @keyframes fadeUp {from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
  @keyframes pop    {0%{transform:scale(.4);opacity:0}70%{transform:scale(1.12)}100%{transform:scale(1);opacity:1}}
  @keyframes pulse  {0%,100%{opacity:1}50%{opacity:.4}}
  @keyframes bounce {0%,80%,100%{transform:scale(0)}40%{transform:scale(1)}}
  @keyframes slideUp{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}
  body{font-family:'Urbanist',sans-serif;background:#060e1a}
`;
document.head.appendChild(style);

createRoot(document.getElementById("root")).render(<App />);
