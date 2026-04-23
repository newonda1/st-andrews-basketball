import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import Footer from "./Footer";
import { statsSearchItems } from "./statsSearchIndex";

const utilityLinks = [
  {
    label: "Tickets",
    href: "https://gofan.co/app/school/GA23139",
  },
  {
    label: "Livestream",
    href: "https://fan.hudl.com/usa/ga/savannah/organization/31104/st-andrews-high-school",
  },
  {
    label: "Booster Club",
    href: "https://sasboosterclub.boosterhub.com/register/11952",
  },
];

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
    fontWeight: 600,
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
  utilityGroup: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    flexShrink: 0,
  },
  utilityLinks: {
    display: "flex",
    alignItems: "center",
  },
  utilityLink: {
    color: "#002169",
    textDecoration: "none",
    fontFamily: '"Questrial", Arial, Helvetica, sans-serif',
    fontSize: "0.92rem",
    fontWeight: 500,
    lineHeight: 1,
    whiteSpace: "nowrap",
    transition: "color 160ms ease",
  },
  searchButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "36px",
    height: "36px",
    border: "none",
    background: "transparent",
    color: "#7c7c7c",
    cursor: "pointer",
    padding: 0,
  },
  searchPopover: {
    position: "absolute",
    top: "calc(100% + 12px)",
    right: 0,
    zIndex: 45,
    width: "min(92vw, 420px)",
    background: "#ffffff",
    border: "1px solid #dedede",
    boxShadow: "0 18px 36px rgba(15, 23, 42, 0.16)",
  },
  searchForm: {
    padding: "16px 16px 12px",
    borderBottom: "1px solid #efefef",
  },
  searchInput: {
    width: "100%",
    border: "1px solid #d7d7d7",
    borderRadius: 0,
    padding: "10px 12px",
    fontFamily: '"Questrial", Arial, Helvetica, sans-serif',
    fontSize: "0.98rem",
    lineHeight: 1.2,
    color: "#1f2937",
    outline: "none",
    boxSizing: "border-box",
  },
  searchResults: {
    maxHeight: "360px",
    overflowY: "auto",
    padding: "8px 0",
  },
  searchSectionLabel: {
    margin: 0,
    padding: "0 16px 8px",
    fontFamily: '"Questrial", Arial, Helvetica, sans-serif',
    fontSize: "0.72rem",
    lineHeight: 1.1,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "#6b7280",
  },
  searchResultLink: {
    display: "block",
    padding: "10px 16px",
    textDecoration: "none",
    color: "#111827",
    transition: "background-color 160ms ease",
  },
  searchResultTitle: {
    margin: 0,
    fontFamily: '"Questrial", Arial, Helvetica, sans-serif',
    fontSize: "0.98rem",
    fontWeight: 500,
    lineHeight: 1.15,
  },
  searchResultMeta: {
    margin: "4px 0 0",
    fontFamily: '"Questrial", Arial, Helvetica, sans-serif',
    fontSize: "0.8rem",
    lineHeight: 1.15,
    color: "#6b7280",
  },
  searchEmpty: {
    margin: 0,
    padding: "4px 16px 12px",
    fontFamily: '"Questrial", Arial, Helvetica, sans-serif',
    fontSize: "0.92rem",
    lineHeight: 1.35,
    color: "#6b7280",
  },
  navBar: {
    background: "#f8f8f8",
    borderTop: "1px solid #efefef",
    borderBottom: "1px solid #e5e5e5",
  },
  navShell: {
    position: "relative",
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
  },
  navItem: {
    position: "relative",
    display: "flex",
    alignItems: "stretch",
    flex: "1 1 0",
    minWidth: 0,
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
    fontWeight: 600,
    letterSpacing: "0",
    lineHeight: 1.15,
    whiteSpace: "nowrap",
    transition: "background-color 160ms ease, color 160ms ease",
  },
  navItemActive: {
    background: "transparent",
    color: "#002169",
  },
  navItemIndicator: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "11px",
    background: "#9b9b9b",
    transform: "scaleX(0)",
    transformOrigin: "center center",
    transition: "transform 220ms cubic-bezier(0.22, 1, 0.36, 1)",
  },
  navDropdown: {
    position: "absolute",
    top: "100%",
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 35,
    width: "min(1040px, calc(100vw - 3rem))",
  },
  navDropdownInner: {
    background: "#002169",
    boxShadow: "0 28px 42px rgba(15, 23, 42, 0.28)",
    padding: "34px 40px 40px",
  },
  navDropdownColumns: {
    display: "grid",
    gap: "38px",
  },
  navDropdownColumn: {
    display: "flex",
    flexDirection: "column",
  },
  navDropdownLink: {
    display: "block",
    padding: "14px 0",
    color: "#ffffff",
    textDecoration: "none",
    fontFamily: '"Questrial", Arial, Helvetica, sans-serif',
    fontSize: "1.02rem",
    lineHeight: 1.18,
    whiteSpace: "normal",
    borderBottom: "1px solid rgba(255, 255, 255, 0.35)",
    transition: "opacity 160ms ease",
  },
  navDropdownLinkActive: {
    color: "#ffffff",
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

function getSearchScore(item, query) {
  const label = item.label.toLowerCase();
  const description = (item.description || "").toLowerCase();
  const keywords = (item.keywords || []).join(" ").toLowerCase();
  const haystack = `${label} ${description} ${keywords}`.trim();
  const terms = query.split(/\s+/).filter(Boolean);

  if (terms.length === 0) {
    return item.featured ? 1 : 0;
  }

  if (terms.some((term) => !haystack.includes(term))) {
    return 0;
  }

  let score = 20;

  if (label === query) {
    score += 100;
  } else if (label.startsWith(query)) {
    score += 50;
  } else if (haystack.includes(query)) {
    score += 25;
  }

  if (description.includes(query)) {
    score += 10;
  }

  if (item.featured) {
    score += 4;
  }

  return score;
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
  const navigate = useNavigate();
  const searchContainerRef = useRef(null);
  const searchInputRef = useRef(null);
  const [openDropdownTitle, setOpenDropdownTitle] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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

  const featuredSearchItems = useMemo(
    () => statsSearchItems.filter((item) => item.featured).slice(0, 7),
    []
  );

  const visibleSearchItems = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return featuredSearchItems;
    }

    return statsSearchItems
      .map((item) => ({ item, score: getSearchScore(item, normalizedQuery) }))
      .filter((entry) => entry.score > 0)
      .sort(
        (a, b) =>
          b.score - a.score || a.item.label.localeCompare(b.item.label)
      )
      .slice(0, 8)
      .map((entry) => entry.item);
  }, [featuredSearchItems, searchQuery]);

  const openDropdownSection = useMemo(
    () =>
      navSections.find(
        (section) =>
          section.title === openDropdownTitle &&
          (section.links || []).length > 1
      ) || null,
    [navSections, openDropdownTitle]
  );

  useEffect(() => {
    setOpenDropdownTitle(null);
    setSearchOpen(false);
    setSearchQuery("");
  }, [location.pathname]);

  useEffect(() => {
    if (!searchOpen) {
      return undefined;
    }

    const handlePointerDown = (event) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target)
      ) {
        setSearchOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [searchOpen]);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  const isLinkActive = (item) =>
    isPathCurrent(location.pathname, item?.to, Boolean(item?.end));

  const isSectionActive = (section) =>
    (section.links || []).some((item) => isLinkActive(item));

  const handleSearchSubmit = (event) => {
    event.preventDefault();

    if (visibleSearchItems.length > 0) {
      navigate(visibleSearchItems[0].to);
    }
  };

  const closeNavMenus = () => {
    setOpenDropdownTitle(null);
  };

  const handleNavShellBlur = (event) => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      closeNavMenus();
    }
  };

  const getDropdownColumns = (links) => {
    const columnCount = links.length > 3 ? 2 : 1;
    const chunkSize = Math.ceil(links.length / columnCount);

    return Array.from({ length: columnCount }, (_, index) =>
      links.slice(index * chunkSize, index * chunkSize + chunkSize)
    ).filter((column) => column.length > 0);
  };

  const renderNavItem = (section) => {
    const links = section.links || [];
    const showIndicator =
      openDropdownTitle === section.title ||
      (openDropdownTitle === null && isSectionActive(section));

    if (links.length === 1) {
      const item = links[0];
      return (
        <div key={section.title} style={styles.navItem}>
          <NavLink
            to={item.to}
            end={item.end}
            onMouseEnter={() => setOpenDropdownTitle(section.title)}
            onFocus={() => setOpenDropdownTitle(section.title)}
            style={({ isActive }) => ({
              ...styles.navItemButton,
              ...(isActive || openDropdownTitle === section.title
                ? styles.navItemActive
                : {}),
            })}
            className="px-2.5 text-[0.96rem] transition-colors hover:text-[#002169] sm:px-3 sm:text-[1.05rem] lg:text-[1.12rem]"
          >
            {section.title}
          </NavLink>
          <span
            aria-hidden="true"
            style={{
              ...styles.navItemIndicator,
              transform: showIndicator ? "scaleX(1)" : "scaleX(0)",
            }}
          />
        </div>
      );
    }

    const isOpen = openDropdownTitle === section.title;
    const isActive = isSectionActive(section);

    return (
      <div
        key={section.title}
        style={styles.navItem}
        onMouseEnter={() => setOpenDropdownTitle(section.title)}
      >
        <button
          type="button"
          aria-haspopup="menu"
          aria-expanded={isOpen}
          style={{
            ...styles.navItemButton,
            ...(isActive || isOpen ? styles.navItemActive : {}),
          }}
          className="w-full px-2.5 text-[0.96rem] transition-colors hover:text-[#002169] sm:px-3 sm:text-[1.05rem] lg:text-[1.12rem]"
          onFocus={() => setOpenDropdownTitle(section.title)}
          onClick={() =>
            setOpenDropdownTitle((current) =>
              current === section.title ? null : section.title
            )
          }
        >
          {section.title}
        </button>
        <span
          aria-hidden="true"
          style={{
            ...styles.navItemIndicator,
            transform: showIndicator ? "scaleX(1)" : "scaleX(0)",
          }}
        />
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
              className="translate-y-[2px] h-[35px] sm:h-[40px] md:h-[45px] lg:h-[49px]"
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

          <div
            ref={searchContainerRef}
            style={styles.utilityGroup}
            className="ml-3 gap-1.5 sm:ml-5 sm:gap-2.5"
          >
            <div style={styles.utilityLinks} className="hidden lg:flex lg:gap-10">
              {utilityLinks.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  style={styles.utilityLink}
                  className="text-[0.92rem] transition-colors hover:text-[#00174e]"
                >
                  {item.label}
                </a>
              ))}
            </div>

            <button
              type="button"
              aria-label="Search the stats site"
              aria-expanded={searchOpen}
              onClick={() => setSearchOpen((current) => !current)}
              style={styles.searchButton}
              className="rounded-full transition-colors hover:text-[#5e5e5e]"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                className="h-[1.35rem] w-[1.35rem]"
              >
                <circle
                  cx="11"
                  cy="11"
                  r="6.5"
                  stroke="currentColor"
                  strokeWidth="2.2"
                />
                <path
                  d="M16 16L21 21"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
              </svg>
            </button>

            {searchOpen ? (
              <div style={styles.searchPopover}>
                <form style={styles.searchForm} onSubmit={handleSearchSubmit}>
                  <input
                    ref={searchInputRef}
                    type="search"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search the stats site"
                    style={styles.searchInput}
                  />
                </form>

                <div style={styles.searchResults}>
                  <p style={styles.searchSectionLabel}>
                    {searchQuery.trim() ? "Results" : "Popular Pages"}
                  </p>

                  {visibleSearchItems.length > 0 ? (
                    visibleSearchItems.map((item) => (
                      <Link
                        key={`${item.to}-${item.label}`}
                        to={item.to}
                        style={styles.searchResultLink}
                        className="hover:bg-[#fafafa]"
                        onClick={() => {
                          setSearchOpen(false);
                          setSearchQuery("");
                        }}
                      >
                        <p style={styles.searchResultTitle}>{item.label}</p>
                        <p style={styles.searchResultMeta}>{item.description}</p>
                      </Link>
                    ))
                  ) : (
                    <p style={styles.searchEmpty}>
                      No matching stats pages found. Try a sport, result type, or
                      record category.
                    </p>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div style={styles.navBar}>
          <div
            style={styles.navShell}
            onMouseLeave={closeNavMenus}
            onBlur={handleNavShellBlur}
          >
            <nav
              aria-label={menuTitle || title}
              style={styles.navInner}
              className="overflow-x-auto overflow-y-visible px-2 sm:px-6 lg:overflow-visible"
            >
              <div style={styles.navList}>
                {navSections.map(renderNavItem)}
              </div>
            </nav>

            {openDropdownSection ? (
              <div style={styles.navDropdown}>
                <div style={styles.navDropdownInner}>
                  <div
                    style={{
                      ...styles.navDropdownColumns,
                      gridTemplateColumns: `repeat(${getDropdownColumns(
                        openDropdownSection.links
                      ).length}, minmax(0, 1fr))`,
                    }}
                  >
                    {getDropdownColumns(openDropdownSection.links).map(
                      (column, columnIndex) => (
                        <div
                          key={`${openDropdownSection.title}-column-${columnIndex}`}
                          style={styles.navDropdownColumn}
                        >
                          {column.map((item, itemIndex) => (
                            <NavLink
                              key={`${openDropdownSection.title}-${item.to}`}
                              to={item.to}
                              end={item.end}
                              onClick={closeNavMenus}
                              style={({ isActive }) => ({
                                ...styles.navDropdownLink,
                                ...(isActive ? styles.navDropdownLinkActive : {}),
                                borderBottom:
                                  itemIndex === column.length - 1
                                    ? "none"
                                    : styles.navDropdownLink.borderBottom,
                              })}
                              className="hover:opacity-80"
                            >
                              {item.label}
                            </NavLink>
                          ))}
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
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
