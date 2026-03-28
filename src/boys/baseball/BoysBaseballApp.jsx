

import React from "react";
import { NavLink, Route, Routes, Navigate } from "react-router-dom";
import YearlyResults from "./pages/YearlyResults";

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f8fafc",
    color: "#0f172a",
    fontFamily: "Arial, Helvetica, sans-serif",
  },
  header: {
    background: "#0f172a",
    color: "white",
    padding: "18px 20px",
    borderBottom: "4px solid #7c2d12",
  },
  headerTitle: {
    margin: 0,
    fontSize: "1.8rem",
    fontWeight: 700,
  },
  headerSubtitle: {
    margin: "6px 0 0",
    fontSize: "0.95rem",
    opacity: 0.85,
  },
  contentWrap: {
    display: "grid",
    gridTemplateColumns: "240px 1fr",
    gap: "20px",
    maxWidth: "1300px",
    margin: "0 auto",
    padding: "20px",
  },
  sidebar: {
    background: "white",
    borderRadius: "14px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
    padding: "14px",
    height: "fit-content",
  },
  sidebarTitle: {
    margin: "0 0 10px",
    fontSize: "0.8rem",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "#64748b",
  },
  navItem: {
    display: "block",
    padding: "10px 12px",
    borderRadius: "10px",
    textDecoration: "none",
    color: "#0f172a",
    fontWeight: 600,
    marginBottom: "6px",
  },
  navItemActive: {
    background: "#e2e8f0",
    color: "#7c2d12",
  },
  note: {
    marginTop: "14px",
    fontSize: "0.92rem",
    lineHeight: 1.5,
    color: "#475569",
  },
  main: {
    background: "white",
    borderRadius: "14px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
    padding: "20px",
    minHeight: "500px",
  },
  placeholderTitle: {
    marginTop: 0,
    marginBottom: "10px",
  },
  placeholderText: {
    margin: 0,
    lineHeight: 1.6,
    color: "#475569",
  },
};

function PlaceholderPage({ title, text }) {
  return (
    <div>
      <h2 style={styles.placeholderTitle}>{title}</h2>
      <p style={styles.placeholderText}>{text}</p>
    </div>
  );
}

export default function BoysBaseballApp() {
  const navLinks = [
    { to: "/athletics/boys/baseball", label: "Yearly Results" },
    { to: "/athletics/boys/baseball/games", label: "Games" },
    { to: "/athletics/boys/baseball/players", label: "Players" },
    { to: "/athletics/boys/baseball/records", label: "Records" },
  ];

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1 style={styles.headerTitle}>St. Andrew&apos;s Baseball</h1>
        <p style={styles.headerSubtitle}>
          Historical results, player statistics, and program records
        </p>
      </header>

      <div style={styles.contentWrap}>
        <aside style={styles.sidebar}>
          <div style={styles.sidebarTitle}>Navigation</div>

          {navLinks.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/athletics/boys/baseball"}
              style={({ isActive }) => ({
                ...styles.navItem,
                ...(isActive ? styles.navItemActive : {}),
              })}
            >
              {item.label}
            </NavLink>
          ))}

          <p style={styles.note}>
            Start by using the Yearly Results page to verify the game results you
            have already entered. As more data is added, the other sections can
            be connected one at a time.
          </p>
        </aside>

        <main style={styles.main}>
          <Routes>
            <Route index element={<YearlyResults />} />
            <Route
              path="games"
              element={
                <PlaceholderPage
                  title="Games"
                  text="This section will eventually hold the baseball schedule, game results, and links to individual game detail pages."
                />
              }
            />
            <Route
              path="players"
              element={
                <PlaceholderPage
                  title="Players"
                  text="This section will eventually connect to baseball player pages once enough player statistics have been entered."
                />
              }
            />
            <Route
              path="records"
              element={
                <PlaceholderPage
                  title="Records"
                  text="This section will eventually hold baseball program records after the historical stat database is built out further."
                />
              }
            />
            <Route path="*" element={<Navigate to="/athletics/boys/baseball" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}