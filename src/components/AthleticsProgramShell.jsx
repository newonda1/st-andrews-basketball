

import React, { useMemo, useState } from "react";
import { Link, NavLink } from "react-router-dom";

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f8fafc",
    color: "#0f172a",
    fontFamily: "Arial, Helvetica, sans-serif",
    display: "flex",
    flexDirection: "column",
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
    width: "100%",
    margin: "0 auto",
    padding: "0 24px 24px",
    boxSizing: "border-box",
    flex: 1,
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
  menuNote: {
    margin: "10px 2px 0",
    fontSize: "0.92rem",
    lineHeight: 1.6,
    color: "#475569",
  },
  footer: {
    marginTop: "24px",
    borderTop: "1px solid #e5e7eb",
    background: "#ffffff",
  },
  footerInner: {
    maxWidth: "1300px",
    margin: "0 auto",
    padding: "18px 24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
    flexWrap: "wrap",
    boxSizing: "border-box",
  },
  footerText: {
    margin: 0,
    color: "#475569",
    fontSize: "0.92rem",
  },
  footerLink: {
    display: "inline-flex",
    alignItems: "center",
    textDecoration: "none",
  },
  footerLogo: {
    height: "34px",
    width: "auto",
    display: "block",
  },
};

export default function AthleticsProgramShell({
  title,
  subtitle,
  menuTitle,
  menuSections = [],
  children,
  athleticsHomePath = "/athletics",
  showFooter = true,
  footerText = "Built with Prep Legacy",
  footerHref = "https://preplegacy.com",
  footerLogoSrc = "/images/branding/preplegacy-logo.png",
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
      <div style={styles.topBar}>
        <Link to={athleticsHomePath} style={styles.logoLink}>
          <img
            src="/images/common/logo.png"
            alt="St. Andrew's Athletics"
            style={styles.logo}
          />
          <div style={styles.titleWrap}>
            <h1 style={styles.title}>{title}</h1>
            {subtitle ? <p style={styles.subtitle}>{subtitle}</p> : null}
          </div>
        </Link>

        <button
          type="button"
          aria-label="Open program navigation"
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
        <main style={styles.main}>{children}</main>
      </div>

      {showFooter ? (
        <footer style={styles.footer}>
          <div style={styles.footerInner}>
            <p style={styles.footerText}>{footerText}</p>
            <a
              href={footerHref}
              target="_blank"
              rel="noreferrer"
              style={styles.footerLink}
            >
              <img
                src={footerLogoSrc}
                alt="Prep Legacy"
                style={styles.footerLogo}
              />
            </a>
          </div>
        </footer>
      ) : null}

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

            <p style={styles.menuNote}>
              Use the navigation above to move between pages while keeping the
              same layout and styling throughout the program site.
            </p>
          </aside>
        </>
      )}
    </div>
  );
}
