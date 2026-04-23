import React, { useEffect, useMemo, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
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
    width: "1px",
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
  navBar: {
    background: "#f8f8f8",
    borderTop: "1px solid #efefef",
    borderBottom: "1px solid #e5e5e5",
  },
  navInner: {
    maxWidth: "1300px",
    margin: "0 auto",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxSizing: "border-box",
  },
  navList: {
    display: "flex",
    alignItems: "stretch",
    justifyContent: "center",
    flexWrap: "nowrap",
    width: "100%",
    gap: "clamp(1.75rem, 5vw, 6rem)",
  },
  navItem: {
    position: "relative",
    display: "flex",
    alignItems: "stretch",
    flexShrink: 0,
  },
  navItemButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "54px",
    padding: "0 8px",
    border: "none",
    background: "transparent",
    color: "#242424",
    cursor: "pointer",
    textDecoration: "none",
    fontFamily: '"Questrial", Arial, Helvetica, sans-serif',
    fontSize: "1.08rem",
    fontWeight: 400,
    letterSpacing: "0",
    lineHeight: 1.15,
    whiteSpace: "nowrap",
    transition: "background-color 160ms ease, color 160ms ease",
  },
  navItemActive: {
    background: "transparent",
    color: "#151515",
  },
  navDropdown: {
    position: "absolute",
    top: "100%",
    left: 0,
    zIndex: 35,
    paddingTop: "6px",
  },
  navDropdownInner: {
    minWidth: "220px",
    background: "#ffffff",
    border: "1px solid #d8d8d8",
    boxShadow: "0 14px 30px rgba(15, 23, 42, 0.12)",
  },
  navDropdownLink: {
    display: "block",
    padding: "10px 14px",
    color: "#242424",
    textDecoration: "none",
    fontFamily: '"Questrial", Arial, Helvetica, sans-serif',
    fontSize: "0.96rem",
    lineHeight: 1.2,
    whiteSpace: "nowrap",
    transition: "background-color 160ms ease, color 160ms ease",
  },
  navDropdownLinkActive: {
    background: "#fafafa",
    color: "#151515",
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
};

function isPathCurrent(pathname, target, end = false) {
  if (!target) {
    return false;
  }

  if (end) {
    return pathname === target;
  }

  return pathname === target || pathname.startsWith(`${target}/`);
}

export default function AthleticsProgramShell({
  title,
  subtitle,
  menuTitle,
  menuSections = [],
  children,
  athleticsHomePath = "/athletics",
  headerHomePath = athleticsHomePath,
  homeLabel = "Home",
  showFooter = true,
}) {
  const location = useLocation();
  const [openDropdownTitle, setOpenDropdownTitle] = useState(null);

  const normalizedSections = useMemo(
    () =>
      (menuSections || []).filter(
        (section) => section?.title && Array.isArray(section.links) && section.links.length > 0
      ),
    [menuSections]
  );

  const navSections = useMemo(
    () => [
      {
        title: homeLabel,
        links: [{ to: headerHomePath, label: homeLabel, end: true }],
      },
      ...normalizedSections,
    ],
    [headerHomePath, homeLabel, normalizedSections]
  );

  useEffect(() => {
    setOpenDropdownTitle(null);
  }, [location.pathname]);

  const isLinkActive = (item) =>
    isPathCurrent(location.pathname, item?.to, Boolean(item?.end));

  const isSectionActive = (section) =>
    (section.links || []).some((item) => isLinkActive(item));

  const handleDropdownBlur = (event, sectionTitle) => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setOpenDropdownTitle((current) =>
        current === sectionTitle ? null : current
      );
    }
  };

  const renderNavItem = (section) => {
    const links = section.links || [];

    if (links.length === 1) {
      const item = links[0];
      return (
        <NavLink
          key={section.title}
          to={item.to}
          end={item.end}
          style={({ isActive }) => ({
            ...styles.navItemButton,
            ...(isActive ? styles.navItemActive : {}),
          })}
          className="px-2.5 text-[0.96rem] transition-colors hover:text-[#111111] sm:px-3 sm:text-[1.05rem] lg:text-[1.12rem]"
        >
          {section.title}
        </NavLink>
      );
    }

    const isOpen = openDropdownTitle === section.title;
    const isActive = isSectionActive(section);

    return (
      <div
        key={section.title}
        style={styles.navItem}
        onMouseEnter={() => setOpenDropdownTitle(section.title)}
        onMouseLeave={() =>
          setOpenDropdownTitle((current) =>
            current === section.title ? null : current
          )
        }
        onBlur={(event) => handleDropdownBlur(event, section.title)}
      >
        <button
          type="button"
          aria-haspopup="menu"
          aria-expanded={isOpen}
          style={{
            ...styles.navItemButton,
            ...(isActive || isOpen ? styles.navItemActive : {}),
          }}
          className="px-2.5 text-[0.96rem] transition-colors hover:text-[#111111] sm:px-3 sm:text-[1.05rem] lg:text-[1.12rem]"
          onFocus={() => setOpenDropdownTitle(section.title)}
          onClick={() =>
            setOpenDropdownTitle((current) =>
              current === section.title ? null : section.title
            )
          }
        >
          {section.title}
        </button>

        {isOpen ? (
          <div
            style={styles.navDropdown}
            className="w-max max-w-[calc(100vw-1.5rem)]"
          >
            <div style={styles.navDropdownInner}>
              {links.map((item) => (
                <NavLink
                  key={`${section.title}-${item.to}`}
                  to={item.to}
                  end={item.end}
                  onClick={() => setOpenDropdownTitle(null)}
                  style={({ isActive }) => ({
                    ...styles.navDropdownLink,
                    ...(isActive ? styles.navDropdownLinkActive : {}),
                  })}
                  className="hover:bg-[#fafafa]"
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div style={styles.topBar} className="h-20 px-3 py-3 sm:h-24 sm:px-6 sm:py-4">
          <Link
            to={headerHomePath}
            style={styles.logoLink}
            className="min-w-0 flex-1 pr-3 sm:pr-5"
          >
            <img
              src="/images/common/st_andrews_athletics_horizontal_logo_dark.png"
              alt="St. Andrew's Athletics"
              style={styles.logo}
              className="h-[35px] sm:h-[40px] md:h-[45px] lg:h-[49px]"
            />
            <span
              aria-hidden="true"
              style={styles.titleDivider}
              className="mx-0.5 h-7 sm:mx-1 sm:h-8 md:mx-1.5 md:h-9 lg:mx-1.5 lg:h-[39px]"
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
        </div>

        <div style={styles.navBar}>
          <nav
            aria-label={menuTitle || title}
            style={styles.navInner}
            className="overflow-x-auto overflow-y-visible px-2 sm:px-6 lg:overflow-visible"
          >
            <div style={styles.navList}>
              {navSections.map(renderNavItem)}
            </div>
          </nav>
        </div>
      </header>

      <div style={styles.content} className="pb-8 lg:pb-[144px]">
        <main
          style={{
            ...styles.main,
            paddingBottom: showFooter ? "32px" : 0,
          }}
          className={
            showFooter
              ? "pt-[146px] sm:pt-[162px] lg:pb-[144px]"
              : "pt-[146px] sm:pt-[162px]"
          }
        >
          {children}
        </main>
      </div>

      {showFooter ? <Footer /> : null}
    </div>
  );
}
