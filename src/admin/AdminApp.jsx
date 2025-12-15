import React, { useMemo, useState } from "react";
import { Link, NavLink, Route, Routes, Navigate } from "react-router-dom";
import BoysBasketballAdmin from "./modules/boysBasketball/BoysBasketballAdmin";
import GirlsBasketballAdmin from "./modules/girlsBasketball/GirlsBasketballAdmin";

/**
 * Global Admin Shell
 * - Keeps all admin tooling in one place
 * - Loads sport modules (boys basketball now; others later)
 * - Includes a simple unlock gate (NOT true security)
 */

const ADMIN_PASSPHRASE = "LIONS"; // change this to anything you want

const styles = {
  page: {
    minHeight: "100vh",
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
    background: "#f5f6f8",
    color: "#111827",
  },
  header: {
    background: "#111827",
    color: "white",
    padding: "14px 18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: {
    display: "flex",
    gap: 12,
    alignItems: "center",
  },
  badge: {
    fontSize: 12,
    padding: "3px 8px",
    borderRadius: 999,
    background: "rgba(255,255,255,0.12)",
    border: "1px solid rgba(255,255,255,0.2)",
  },
  contentWrap: {
    display: "grid",
    gridTemplateColumns: "260px 1fr",
    gap: 16,
    padding: 16,
    maxWidth: 1300,
    margin: "0 auto",
  },
  sidebar: {
    background: "white",
    borderRadius: 12,
    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
    padding: 12,
    height: "fit-content",
  },
  main: {
    background: "white",
    borderRadius: 12,
    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
    padding: 16,
    minHeight: 400,
  },
  navSectionTitle: {
    fontSize: 12,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    color: "#6b7280",
    margin: "10px 8px 6px",
  },
  navItem: {
    display: "block",
    padding: "10px 10px",
    borderRadius: 10,
    color: "#111827",
    textDecoration: "none",
    fontWeight: 600,
    fontSize: 14,
  },
  navItemActive: {
    background: "#eef2ff",
    color: "#1d4ed8",
  },
  unlockWrap: {
    maxWidth: 520,
    margin: "40px auto",
    padding: 18,
    background: "white",
    borderRadius: 12,
    boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    fontSize: 16,
    borderRadius: 10,
    border: "1px solid #d1d5db",
    outline: "none",
  },
  button: {
    marginTop: 12,
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #111827",
    background: "#111827",
    color: "white",
    fontWeight: 700,
    cursor: "pointer",
  },
  muted: { color: "#6b7280", lineHeight: 1.5 },
};

function AdminLayout({ onLock }) {
  const navLinks = useMemo(
    () => [
      { to: "/admin/boys-basketball", label: "Boys Basketball" },
      { to: "/admin/girls-basketball", label: "Girls Basketball" },
      // Add more modules later:
      // { to: "/admin/girls-basketball", label: "Girls Basketball" },
      // { to: "/admin/soccer", label: "Soccer" },
    ],
    []
  );

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={{ fontWeight: 900, fontSize: 18 }}>Admin</div>
          <span style={styles.badge}>Local tools</span>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <Link
            to="/"
            style={{ color: "white", textDecoration: "none", fontWeight: 700 }}
          >
            Back to site
          </Link>
          <button
            onClick={onLock}
            style={{
              ...styles.button,
              marginTop: 0,
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.4)",
            }}
          >
            Lock
          </button>
        </div>
      </div>

      <div style={styles.contentWrap}>
        <aside style={styles.sidebar}>
          <div style={styles.navSectionTitle}>Modules</div>

          {navLinks.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              style={({ isActive }) => ({
                ...styles.navItem,
                ...(isActive ? styles.navItemActive : {}),
              })}
            >
              {item.label}
            </NavLink>
          ))}

          <div style={{ marginTop: 12, padding: "0 8px" }}>
            <div style={styles.navSectionTitle}>Notes</div>
            <p style={styles.muted}>
              This admin area is designed for editing JSON locally and exporting
              updated files. Later, if you want true “save to production,” we’ll
              add authentication + a backend.
            </p>
          </div>
        </aside>

        <main style={styles.main}>
          <Routes>
            <Route index element={<Navigate to="/admin/boys-basketball" replace />} />
            <Route path="boys-basketball" element={<BoysBasketballAdmin />} />
            <Route path="girls-basketball" element={<GirlsBasketballAdmin />} />
            <Route
              path="*"
              element={
                <div>
                  <h2>Not found</h2>
                  <p style={styles.muted}>That admin page doesn’t exist yet.</p>
                </div>
              }
            />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function AdminApp() {
  const [unlocked, setUnlocked] = useState(false);
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");

  function unlock() {
    if (pass === ADMIN_PASSPHRASE) {
      setUnlocked(true);
      setError("");
      return;
    }
    setError("Incorrect passphrase.");
  }

  if (!unlocked) {
    return (
      <div style={styles.page}>
        <div style={styles.unlockWrap}>
          <h1 style={{ marginTop: 0 }}>Admin Access</h1>
          <p style={styles.muted}>
            Enter your passphrase to open the admin tools.
            <br />
            (This is a simple gate — not real security.)
          </p>

          <input
            type="password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            placeholder="Passphrase"
            style={styles.input}
            onKeyDown={(e) => {
              if (e.key === "Enter") unlock();
            }}
          />

          <button style={styles.button} onClick={unlock}>
            Unlock
          </button>

          {error && <p style={{ color: "crimson", marginTop: 12 }}>{error}</p>}

          <p style={{ ...styles.muted, marginTop: 12 }}>
            Tip: keep admin pages for your use only.
          </p>
        </div>
      </div>
    );
  }

  return <AdminLayout onLock={() => setUnlocked(false)} />;
}
