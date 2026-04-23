import React, { useMemo, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import Footer from "./Footer";

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f8fafc",
    color: "#0f172a",
    fontFamily: "Arial, Helvetica, sans-serif",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    background: "#ffffff",
    borderBottom: "1px solid #e2e8f0",
    zIndex: 30,
  },
  topBar: {
    maxWidth: "1300px",
    margin: "0 auto",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxSizing: "border-box",
  },
  logoLink: {
    display: "flex",
    alignItems: "center",
    textDecoration: "none",
    color: "#0f172a",
  },
  logo: {
    width: "auto",
    display: "block",
    flexShrink: 0,
  },
  titleDivider: {
    width: "2px",
    background: "#808184",
    flexShrink: 0,
  },
  titleWrap: {
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  title: {
    margin: 0,
    fontFamily: '"Questrial", Arial, Helvetica, sans-serif',
    fontWeight: 400,
    lineHeight: 1.02,
    color: "#002169",
    textTransform: "uppercase",
    letterSpacing: "0.02em",
  },
  subtitle: {
    margin: 0,
    fontFamily: '"Questrial", Arial, Helvetica, sans-serif',
    fontSize: "0.82rem",
    lineHeight: 1.15,
    color: "#808184",
  },
  menuButton: {
    border: "none",
    background: "transparent",
    padding: 0,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  menuIcon: {
    display: "block",
  },
  content: {
    maxWidth: "1300px",
    width: "100%",
    margin: "0 auto",
    padding: "0 16px 32px",
    boxSizing: "border-box",
    flex: 1,
  },
  main: {
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
    boxSizing: "border-box",
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
};

export default function AthleticsProgramShell({
  title,
  subtitle,
  menuTitle,
  menuSections = [],
  children,
  athleticsHomePath = "/athletics",
  headerHomePath = athleticsHomePath,
  showFooter = true,
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  const normalizedSections = useMemo(() => menuSections || [], [menuSections]);

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
      <header style={styles.header} className="h-20 sm:h-24">
        <div style={styles.topBar} className="h-full px-3 py-3 sm:px-6 sm:py-4">
          <Link
            to={headerHomePath}
            style={styles.logoLink}
            className="min-w-0 flex-1 pr-3 sm:pr-5"
          >
            <img
              src="/images/common/st_andrews_athletics_horizontal_logo.png"
              alt="St. Andrew's Athletics"
              style={styles.logo}
              className="h-7 sm:h-8 md:h-9 lg:h-[39px]"
            />
            <span
              aria-hidden="true"
              style={styles.titleDivider}
              className="mx-1 h-7 sm:mx-1.5 sm:h-8 md:h-9 lg:mx-2 lg:h-[39px]"
            />
            <div style={styles.titleWrap}>
              <h1
                style={styles.title}
                className="text-[0.6rem] sm:text-[0.8rem] md:text-[0.98rem] lg:text-[1.18rem]"
              >
                {title}
              </h1>
              {subtitle ? (
                <p style={styles.subtitle} className="mt-1 hidden md:block">
                  {subtitle}
                </p>
              ) : null}
            </div>
          </Link>

          <button
            type="button"
            aria-label="Open program navigation"
            style={styles.menuButton}
            className="h-11 w-11 shrink-0 overflow-hidden rounded-xl"
            onClick={() => setMenuOpen(true)}
          >
            <img
              src="/images/common/button.png"
              alt=""
              aria-hidden="true"
              style={styles.menuIcon}
              className="h-full w-full object-contain"
            />
          </button>
        </div>
      </header>

      <div
        style={styles.content}
        className="pb-8 lg:pb-[144px]"
      >
        <main
          style={{
            ...styles.main,
            paddingBottom: showFooter ? "32px" : 0,
          }}
          className={showFooter ? "pt-[104px] lg:pb-[144px] sm:pt-[120px]" : "pt-[104px] sm:pt-[120px]"}
        >
          {children}
        </main>
      </div>

      {showFooter ? <Footer /> : null}

      {menuOpen && (
        <>
          <div style={styles.overlay} onClick={() => setMenuOpen(false)} />
          <aside style={styles.sidebar}>
            <div style={styles.sidebarHeader}>
              <h2 style={styles.sidebarTitle}>{menuTitle || title}</h2>
              <button
                type="button"
                style={styles.closeButton}
                onClick={() => setMenuOpen(false)}
              >
                Close
              </button>
            </div>

            {normalizedSections.map((section) => (
              <div key={section.title} style={styles.menuSection}>
                <h3 style={styles.menuSectionTitle}>{section.title}</h3>
                {(section.links || []).map(renderMenuLink)}
              </div>
            ))}
          </aside>
        </>
      )}
    </div>
  );
}
