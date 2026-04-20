// ─────────────────────────────────────────────────────────────────────────────
// frontend/src/pages/auth/Signup.jsx
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState } from "react";
import { T } from "../../styles/theme.js";
import Button from "../../components/common/Button.jsx";
import Input from "../../components/common/Input.jsx";

function Logo() {
  return (
    <div style={{ textAlign: "center", marginBottom: 4 }}>
      <div
        style={{
          fontFamily: "Metrophobic, sans-serif",
          fontSize: 26,
          letterSpacing: 1,
        }}
      >
        <span style={{ color: "#1a6aaa" }}>Aqua</span>
        <span style={{ color: T.blueL }}>Scan</span>
      </div>
      <p
        style={{
          color: T.t3,
          fontSize: 11,
          marginTop: 3,
          fontFamily: "Urbanist, sans-serif",
        }}
      >
        Underwater waste management system.
      </p>
    </div>
  );
}

export default function Signup({ onSignup, onGoLogin }) {
  const [role, setRole] = useState("citizen");
  const [form, setForm] = useState({
    fullName: "",
    ownerName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    city: "",
    committeeName: "",
    organizationName: "",
    jurisdictionArea: "",
  });
  const [showP, setShowP] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    setErr("");
    setLoading(true);
    if (!form.email || !form.password) {
      setErr("Fill in all required fields.");
      setLoading(false);
      return;
    }
    if (form.password !== form.confirmPassword) {
      setErr("Passwords do not match.");
      setLoading(false);
      return;
    }
    if (form.password.length < 6) {
      setErr("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }
    try {
      await onSignup(role, form);
    } catch (e) {
      setErr(e.message);
    }
    setLoading(false);
  };

  return (
    <div
      style={{
        padding: "20px 22px",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        justifyContent: "center",
        gap: 11,
        overflowY: "auto",
      }}
    >
      <Logo />
      <div
        style={{
          display: "flex",
          background: T.bg2,
          borderRadius: 14,
          padding: 4,
          border: `1px solid ${T.border}`,
        }}
      >
        {[
          ["citizen", "👤 Citizen"],
          ["committee", "🏛️ Committee"],
        ].map(([r, l]) => (
          <button
            key={r}
            onClick={() => {
              setRole(r);
              setErr("");
            }}
            style={{
              flex: 1,
              background: role === r ? T.blue : "none",
              border: "none",
              color: role === r ? "#fff" : T.t3,
              borderRadius: 10,
              padding: 9,
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "Urbanist, sans-serif",
            }}
          >
            {l}
          </button>
        ))}
      </div>

      {role === "citizen" && (
        <Input
          label="FULL NAME"
          value={form.fullName}
          onChange={set("fullName")}
          placeholder="Your full name"
        />
      )}
      {role === "committee" && (
        <>
          <Input
            label="COMMITTEE NAME"
            value={form.committeeName}
            onChange={set("committeeName")}
            placeholder="e.g. BMC Coastal Cell"
          />
          <Input
            label="OFFICER NAME"
            value={form.ownerName}
            onChange={set("ownerName")}
            placeholder="Your name"
          />
          <Input
            label="ORGANISATION"
            value={form.organizationName}
            onChange={set("organizationName")}
            placeholder="Municipal Corporation"
          />
          <Input
            label="JURISDICTION"
            value={form.jurisdictionArea}
            onChange={set("jurisdictionArea")}
            placeholder="Mumbai Coastal Belt"
          />
        </>
      )}

      <Input
        label="EMAIL"
        type="email"
        value={form.email}
        onChange={set("email")}
        placeholder="you@email.com"
      />
      <div style={{ position: "relative" }}>
        <Input
          label="PASSWORD"
          type={showP ? "text" : "password"}
          value={form.password}
          onChange={set("password")}
          placeholder="Min 6 characters"
        />
        <button
          type="button"
          onClick={() => setShowP((v) => !v)}
          style={{
            position: "absolute",
            right: 12,
            bottom: 12,
            background: "none",
            border: "none",
            color: T.t3,
            cursor: "pointer",
            fontSize: 12,
            fontFamily: "Urbanist,sans-serif",
          }}
        >
          {showP ? "Hide" : "Show"}
        </button>
      </div>
      <Input
        label="CONFIRM PASSWORD"
        type={showP ? "text" : "password"}
        value={form.confirmPassword}
        onChange={set("confirmPassword")}
        placeholder="Repeat password"
      />
      <Input
        label="PHONE NUMBER"
        value={form.phone}
        onChange={set("phone")}
        placeholder="+91 98765 43210"
      />
      {role === "citizen" && (
        <Input
          label="CITY"
          value={form.city}
          onChange={set("city")}
          placeholder="Mumbai"
        />
      )}

      {err && (
        <p
          style={{
            color: T.danger,
            fontSize: 12,
            textAlign: "center",
            fontWeight: 600,
          }}
        >
          {err}
        </p>
      )}
      <Button onClick={submit} loading={loading}>
        Create Account →
      </Button>
      <p style={{ color: T.t4, fontSize: 11, textAlign: "center" }}>
        Have an account?{" "}
        <span
          onClick={onGoLogin}
          style={{ color: T.blueL, cursor: "pointer", fontWeight: 600 }}
        >
          Sign In
        </span>
      </p>
    </div>
  );
}
