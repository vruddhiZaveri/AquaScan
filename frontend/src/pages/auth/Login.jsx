// ─────────────────────────────────────────────────────────────────────────────
// frontend/src/pages/auth/Login.jsx
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState } from "react";
import { T } from "../../styles/theme.js";
import Button from "../../components/common/Button.jsx";
import Input  from "../../components/common/Input.jsx";

function Logo() {
  return (
    <div style={{ textAlign: "center", marginBottom: 4 }}>
      <div style={{ fontFamily: "Metrophobic, sans-serif", fontSize: 26, letterSpacing: 1 }}>
        <span style={{ color: "#1a6aaa" }}>Aqua</span><span style={{ color: T.blueL }}>Scan</span>
      </div>
      <p style={{ color: T.t3, fontSize: 11, marginTop: 3, fontFamily: "Urbanist, sans-serif" }}>Underwater waste management system.</p>
    </div>
  );
}

export default function Login({ onLogin, onGoSignup }) {
  const [role,   setRole]   = useState("citizen");
  const [email,  setEmail]  = useState("");
  const [pass,   setPass]   = useState("");
  const [showP,  setShowP]  = useState(false);
  const [err,    setErr]    = useState("");
  const [loading,setLoading]= useState(false);

  const submit = async () => {
    setErr(""); setLoading(true);
    try { await onLogin(email, pass, role); }
    catch (e) { setErr(e.message); }
    setLoading(false);
  };

  return (
    <div style={{ padding: "20px 22px", display: "flex", flexDirection: "column", height: "100%", justifyContent: "center", gap: 11, overflowY: "auto" }}>
      <Logo />

      {/* Role toggle */}
      <div style={{ display: "flex", background: T.bg2, borderRadius: 14, padding: 4, border: `1px solid ${T.border}` }}>
        {[["citizen","👤 Citizen"],["committee","🏛️ Committee"]].map(([r,l]) => (
          <button key={r} onClick={() => { setRole(r); setErr(""); }} style={{ flex: 1, background: role === r ? T.blue : "none", border: "none", color: role === r ? "#fff" : T.t3, borderRadius: 10, padding: 9, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "Urbanist, sans-serif", transition: "background .2s" }}>{l}</button>
        ))}
      </div>

      <Input label="EMAIL" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com"/>

      <div style={{ position: "relative" }}>
        <Input label="PASSWORD" type={showP ? "text" : "password"} value={pass} onChange={e => setPass(e.target.value)} placeholder="Min 6 characters" onKeyDown={e => e.key === "Enter" && submit()}/>
        <button type="button" onClick={() => setShowP(v => !v)} style={{ position: "absolute", right: 12, bottom: 12, background: "none", border: "none", color: T.t3, cursor: "pointer", fontSize: 12, fontFamily: "Urbanist, sans-serif" }}>{showP ? "Hide" : "Show"}</button>
      </div>

      {err && <p style={{ color: T.danger, fontSize: 12, textAlign: "center", fontWeight: 600, animation: "fadeUp .2s ease" }}>{err}</p>}
      <Button onClick={submit} loading={loading}>Sign In →</Button>
      <p style={{ color: T.t4, fontSize: 11, textAlign: "center" }}>New here? <span onClick={onGoSignup} style={{ color: T.blueL, cursor: "pointer", fontWeight: 600 }}>Create Account</span></p>
    </div>
  );
}

