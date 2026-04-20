// ─────────────────────────────────────────────────────────────────────────────
// frontend/src/navigation/AppRouter.jsx
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState, useEffect } from "react";
import { T } from "../styles/theme.js";
import { authService } from "../services/authService.js";
import Login from "../pages/auth/Login.jsx";
import Signup from "../pages/auth/Signup.jsx";
import UserRoutes from "./UserRoutes.jsx";
import CommitteeRoutes from "./CommitteeRoutes.jsx";
import plasticWaterImg from "../assets/images/onboarding/plastic-water.png";
import waterDropImg from "../assets/images/onboarding/water-drop.png";
import cleanRiverImg from "../assets/images/onboarding/clean-river.png";

const SLIDES = [
  {
    label: "On-Boarding 1",
    image: plasticWaterImg,
    title: "Scan Water. Spot Plastic.\nCreate Change.",
    desc: "Capture or upload images to detect plastic waste and take instant action.",
  },
  {
    label: "On-Boarding 2",
    image: waterDropImg,
    title: "Turn Awareness\ninto Real Impact",
    desc: "Report polluted water to nearby authorities and earn impact points for every cleanup you trigger.",
  },
  {
    label: "On-Boarding 3",
    image: cleanRiverImg,
    title: "Together for Cleaner\nWaters",
    desc: "AI-powered detection, quick reporting, and community-driven impact—all in one app.",
  },
];

function Splash({ onDone }) {
  const [fade, setFade] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setFade(true), 1900);
    const t2 = setTimeout(onDone, 2500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [onDone]);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: T.bg0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        transition: "opacity .6s",
        opacity: fade ? 0 : 1,
      }}
    >
      <div
        style={{
          fontFamily: "Metrophobic,sans-serif",
          fontSize: 44,
          letterSpacing: 1,
          animation: "slideUp .7s ease both",
        }}
      >
        <span style={{ color: "#1a6aaa" }}>Aqua</span>
        <span style={{ color: T.blueL }}>Scan</span>
      </div>

      <p
        style={{
          color: T.t3,
          fontSize: 11,
          marginTop: 4,
          fontFamily: "Urbanist,sans-serif",
        }}
      >
        Underwater waste management system.
      </p>
    </div>
  );
}

function Onboarding({ onDone }) {
  const [slide, setSlide] = useState(0);
  const s = SLIDES[slide];

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "#0a1018",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 390,
          background:
            "linear-gradient(180deg, rgba(9,17,28,0.98) 0%, rgba(8,18,30,0.98) 100%)",
          borderRadius: 24,
          border: `1px solid ${T.border}`,
          overflow: "hidden",
          position: "relative",
          boxShadow: "0 18px 60px rgba(0,0,0,0.38)",
          padding: "14px 14px 18px",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -90,
            left: "50%",
            transform: "translateX(-50%)",
            width: 260,
            height: 260,
            borderRadius: "50%",
            background: "rgba(77,200,240,0.08)",
            filter: "blur(70px)",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            position: "relative",
            zIndex: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "2px 4px 12px",
          }}
        >
          <div
            style={{
              color: "rgba(255,255,255,0.45)",
              fontSize: 14,
              fontWeight: 700,
              fontFamily: "Urbanist, sans-serif",
            }}
          >
            {s.label}
          </div>

          <button
            onClick={onDone}
            style={{
              background: "none",
              border: "none",
              color: "#ffffff",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "Urbanist, sans-serif",
            }}
          >
            Skip
          </button>
        </div>

        <div
          style={{
            position: "relative",
            zIndex: 1,
            width: "100%",
            height: 430,
            borderRadius: 24,
            overflow: "hidden",
            marginBottom: 16,
            background: T.bg3,
            boxShadow: "0 10px 35px rgba(0,0,0,0.25)",
          }}
        >
          <img
            src={s.image}
            alt={s.title.replace(/\n/g, " ")}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 8,
            marginBottom: 14,
          }}
        >
          {SLIDES.map((_, i) => (
            <div
              key={i}
              style={{
                width: i === slide ? 10 : 7,
                height: i === slide ? 10 : 7,
                borderRadius: "50%",
                background: i === slide ? "#ffffff" : "rgba(255,255,255,0.35)",
                border:
                  i === slide ? "2px solid rgba(255,255,255,0.5)" : "none",
                transition: "all .25s ease",
              }}
            />
          ))}
        </div>

        <div style={{ padding: "0 12px", textAlign: "center" }}>
          <h2
            style={{
              color: T.t1,
              fontSize: 20,
              fontWeight: 800,
              margin: "0 0 10px",
              lineHeight: 1.35,
              whiteSpace: "pre-line",
              fontFamily: "Urbanist, sans-serif",
            }}
          >
            {s.title}
          </h2>

          <p
            style={{
              color: T.t3,
              fontSize: 12.5,
              lineHeight: 1.7,
              margin: 0,
              fontFamily: "Urbanist, sans-serif",
            }}
          >
            {s.desc}
          </p>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            paddingTop: 18,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              background: "rgba(255,255,255,0.06)",
              border: `1px solid ${T.borderL}`,
              borderRadius: 14,
              overflow: "hidden",
              backdropFilter: "blur(10px)",
            }}
          >
            <button
              onClick={() => slide > 0 && setSlide((p) => p - 1)}
              style={{
                width: 42,
                height: 34,
                background: "none",
                border: "none",
                color: slide > 0 ? T.t1 : T.t4,
                fontSize: 16,
                cursor: slide > 0 ? "pointer" : "default",
                fontFamily: "Urbanist, sans-serif",
              }}
            >
              ←
            </button>

            <div style={{ width: 1, height: 18, background: T.border }} />

            <button
              onClick={() =>
                slide === SLIDES.length - 1 ? onDone() : setSlide((p) => p + 1)
              }
              style={{
                width: 42,
                height: 34,
                background: "none",
                border: "none",
                color: T.t1,
                fontSize: 16,
                cursor: "pointer",
                fontFamily: "Urbanist, sans-serif",
              }}
            >
              →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AppRouter() {
  const [phase, setPhase] = useState("splash");
  const [authMode, setAuthMode] = useState("login");
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);

  useEffect(() => {
    authService.restoreSession().then((sess) => {
      if (sess) {
        setUser(sess.user);
        setRole(sess.role);
        setPhase("app");
        return;
      }

      const ob = localStorage.getItem("aqs_ob");
      setPhase(ob ? "auth" : "onboarding");
    });
  }, []);

  const onLogin = async (email, pass, r) => {
    const sess = await authService.login(email, pass, r);
    setUser(sess.user);
    setRole(sess.role);
    setPhase("app");
  };

  const onSignup = async (r, fields) => {
    const sess = await authService.signup(r, fields);
    setUser(sess.user);
    setRole(sess.role);
    setPhase("app");
  };

  const onLogout = async () => {
    await authService.logout();
    setUser(null);
    setRole(null);
    setPhase("auth");
  };

  const onUpdateUser = (u) => setUser(u);

  return (
    <>
      {phase === "splash" && (
        <Splash
          onDone={() => {
            const ob = localStorage.getItem("aqs_ob");
            setPhase(ob ? "auth" : "onboarding");
          }}
        />
      )}

      {phase === "onboarding" && (
        <Onboarding
          onDone={() => {
            localStorage.setItem("aqs_ob", "1");
            setPhase("auth");
          }}
        />
      )}

      {phase === "auth" &&
        (authMode === "login" ? (
          <Login onLogin={onLogin} onGoSignup={() => setAuthMode("signup")} />
        ) : (
          <Signup onSignup={onSignup} onGoLogin={() => setAuthMode("login")} />
        ))}

      {phase === "app" && user && role === "citizen" && (
        <UserRoutes
          user={user}
          onLogout={onLogout}
          onUpdateUser={onUpdateUser}
        />
      )}

      {phase === "app" && user && role === "committee" && (
        <CommitteeRoutes user={user} onLogout={onLogout} />
      )}
    </>
  );
}
