import React, { useMemo, useState } from "react";
import { Link, NavLink, Route, Routes, Navigate } from "react-router-dom";
import YearlyResults from "./pages/YearlyResults";

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f8fafc",
    color: "#0f172a",
    fontFamily: "Arial, Helvetica, sans-serif",
  },
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 24px 14px",
  },
  logoLink: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    textDecoration: "none",
    color: "#0f172a",
  },
  logo: {
    height: "64px",
    width: "auto",
    display: "block",
  },
  titleWrap: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },
  title: {
    margin: 0,
    fontSize: "1.8rem",
    fontWeight: 700,
    lineHeight: 1.1,
  },
  subtitle: {
    margin: 0,
    fontSize: "0.95rem",
    color: "#475569",
  },
  menuButton: {
    border: "none",
    background: "transparent",
    padding: 0,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  menuIcon: {
    width: "42px",
    height: "42px",
    display: "block",
  },
  content: {
    maxWidth: "1300px",
    margin: "0 auto",
    padding: "0 24px 24px",
  },
  main: {
    background: "white",
    borderRadius: "16px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
    padding: "20px",
    minHeight: "520px",
  },
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15, 23, 42, 0.4)",
    zIndex: 40,
  },
  sidebar: {
    position: "fixed",
    top: 0,
    right: 0,
    width: "340px",
    maxWidth: "92vw",
    height: "100vh",
    background: "white",
    boxShadow: "-4px 0 18px rgba(0,0,0,0.16)",
    padding: "22px 18px 26px",
    overflowY: "auto",
    zIndex: 50,
  },
  sidebarHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "18px",
  },
  sidebarTitle: {
    margin: 0,
    fontSize: "1.2rem",
    fontWeight: 700,
  },
  closeButton: {
    border: "1px solid #cbd5e1",
    background: "white",
    color: "#0f172a",
    borderRadius: "10px",
    padding: "6px 10px",
    cursor: "pointer",
    fontWeight: 700,
  },
  menuSection: {
    marginBottom: "20px",
  },
  menuSectionTitle: {
    margin: "0 0 10px",
    fontSize: "0.78rem",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "#64748b",
    fontWeight: 700,
  },
  menuLink: {
    display: "block",
    padding: "10px 12px",
    borderRadius: "10px",
    textDecoration: "none",
    color: "#0f172a",
    fontWeight: 600,
    marginBottom: "6px",
  },
  menuLinkActive: {
    background: "#e2e8f0",
    color: "#7c2d12",
  },
  menuNote: {
    margin: "10px 2px 0",
    fontSize: "0.92rem",
    lineHeight: 1.6,
    color: "#475569",
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
  const [menuOpen, setMenuOpen] = useState(false);

  const menuSections = useMemo(
    () => [
      {
        title: "Results",
        links: [
          {
            to: "/athletics/boys/baseball",
            label: "Full Year-by-Year Results",
            end: true,
          },
          {
            to: "/athletics/boys/baseball/opponent-history",
            label: "Opponent Game History",
          },
        ],
      },
      {
        title: "Team Stats",
        links: [
          {
            to: "/athletics/boys/baseball/team-stats",
            label: "Full Team Stats",
          },
          {
            to: "/athletics/boys/baseball/team-records/single-game",
            label: "Team Records (Single Game)",
          },
          {
            to: "/athletics/boys/baseball/team-records/season",
            label: "Team Records (Season)",
          },
        ],
      },
      {
        title: "Individual Stats",
        links: [
          {
            to: "/athletics/boys/baseball/career-stats",
            label: "Full Career Stats",
          },
          {
            to: "/athletics/boys/baseball/player-records/single-game",
            label: "Single Game Records",
          },
          {
            to: "/athletics/boys/baseball/player-records/season",
            label: "Season Records",
          },
        ],
      },
    ],
    []
  );

  const renderMenuLink = (item) => (
    <NavLink
      key={item.to}
      to={item.to}
      end={item.end}
      onClick={() => setMenuOpen(false)}
      style={({ isActive }) => ({
        ...styles.menuLink,
        ...(isActive ? styles.menuLinkActive : {}),
      })}
    >
      {item.label}
    </NavLink>
  );

  return (
    <div style={styles.page}>
      <div style={styles.topBar}>
        <Link to="/athletics" style={styles.logoLink}>
          <img
            src="/images/common/logo.png"
            alt="St. Andrew's Athletics"
            style={styles.logo}
          />
          <div style={styles.titleWrap}>
            <h1 style={styles.title}>Boys&apos; Baseball</h1>
            <p style={styles.subtitle}>
              Historical results, player statistics, and program records
            </p>
          </div>
        </Link>

        <button
          type="button"
          aria-label="Open baseball navigation"
          style={styles.menuButton}
          onClick={() => setMenuOpen(true)}
        >
          <img
            src="/images/common/button.png"
            alt=""
            aria-hidden="true"
            style={styles.menuIcon}
          />
        </button>
      </div>

      <div style={styles.content}>
        <main style={styles.main}>
          <Routes>
            <Route index element={<YearlyResults />} />
            <Route
              path="opponent-history"
              element={
                <PlaceholderPage
                  title="Opponent Game History"
                  text="This page will eventually show the full game history against each baseball opponent in the database."
                />
              }
            />
            <Route
              path="team-stats"
              element={
                <PlaceholderPage
                  title="Full Team Stats"
                  text="This page will eventually summarize season-by-season baseball team statistics once more game data has been entered."
                />
              }
            />
            <Route
              path="team-records/single-game"
              element={
                <PlaceholderPage
                  title="Team Records (Single Game)"
                  text="This page will eventually list baseball team single-game records."
                />
              }
            />
            <Route
              path="team-records/season"
              element={
                <PlaceholderPage
                  title="Team Records (Season)"
                  text="This page will eventually list baseball team season records."
                />
              }
            />
            <Route
              path="career-stats"
              element={
                <PlaceholderPage
                  title="Full Career Stats"
                  text="This page will eventually show baseball career statistics for individual players."
                />
              }
            />
            <Route
              path="player-records/single-game"
              element={
                <PlaceholderPage
                  title="Single Game Records"
                  text="This page will eventually show baseball individual single-game records."
                />
              }
            />
            <Route
              path="player-records/season"
              element={
                <PlaceholderPage
                  title="Season Records"
                  text="This page will eventually show baseball individual season records."
                />
              }
            />
            <Route
              path="*"
              element={<Navigate to="/athletics/boys/baseball" replace />}
            />
          </Routes>
        </main>
      </div>

      {menuOpen && (
        <>
          <div style={styles.overlay} onClick={() => setMenuOpen(false)} />
          <aside style={styles.sidebar}>
            <div style={styles.sidebarHeader}>
              <h2 style={styles.sidebarTitle}>Boys&apos; Baseball</h2>
              <button
                type="button"
                style={styles.closeButton}
                onClick={() => setMenuOpen(false)}
              >
                Close
              </button>
            </div>

            {menuSections.map((section) => (
              <div key={section.title} style={styles.menuSection}>
                <h3 style={styles.menuSectionTitle}>{section.title}</h3>
                {section.links.map(renderMenuLink)}
              </div>
            ))}

            <p style={styles.menuNote}>
              Use the Year-by-Year Results page first to verify that the games
              you have already entered are displaying correctly. The other pages
              can be connected as the baseball database grows.
            </p>
          </aside>
        </>
      )}
    </div>
  );
}